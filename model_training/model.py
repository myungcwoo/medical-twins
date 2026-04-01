import torch
import torch.nn as nn

class MedicalDigitalTwinModel(nn.Module):
    """
    A hybrid PyTorch Model bridging Discrete Clinical Events (Transformer)
    and Continuous Biomarkers over irregular intervals (via explicit Missingness).
    """
    def __init__(self, vocab_size=50000, num_continuous_vars=10, d_model=128, nhead=4, num_layers=3):
        super(MedicalDigitalTwinModel, self).__init__()
        
        self.d_model = d_model
        
        # 1. Discrete Medical Codes (ICD/NDC) Embedding Layer
        self.discrete_embedding = nn.Embedding(vocab_size, d_model, padding_idx=0)
        
        # 2. Continuous Variable (Labs/Vitals) Embedding with explicit Missingness
        # We project [value, is_missing] into the same continuous space
        self.continuous_projection = nn.Linear(num_continuous_vars * 2, d_model)
        
        # 3. Temporal delta embedding (handling irregular cadences)
        self.time_delta_projection = nn.Linear(1, d_model)
        
        # 4. Transformer Sequence Encoder (Processing Patient History)
        encoder_layer = nn.TransformerEncoderLayer(d_model=d_model, nhead=nhead, batch_first=True)
        self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        # 5. Output Heads (Predicting next tick physiological state)
        self.health_delta_head = nn.Linear(d_model, 1)          # Predicts health delta
        self.vitals_head = nn.Linear(d_model, num_continuous_vars) # Predicts new lab/vital values

    def forward(self, discrete_tokens, continuous_vals, missing_masks, time_deltas, src_key_padding_mask=None):
        """
        discrete_tokens: (batch_size, seq_len)
        continuous_vals: (batch_size, seq_len, num_continuous_vars) 
        missing_masks:   (batch_size, seq_len, num_continuous_vars)   1 if valid, 0 if missing/not measured
        time_deltas:     (batch_size, seq_len)
        """
        # Embed discrete Medical Codes
        x_disc = self.discrete_embedding(discrete_tokens)
        
        # Combine continuous values and their missingness masks (Heterogeneous Handling)
        cont_input = torch.cat([continuous_vals, missing_masks], dim=-1)
        x_cont = self.continuous_projection(cont_input)
        
        # Embed irregular time deltas
        x_time = self.time_delta_projection(time_deltas.unsqueeze(-1))
        
        # Additive Fusion (Summing discrete + continuous + time context per step)
        x = x_disc + x_cont + x_time
        
        # Pass through Transformer to learn long-range temporal dependencies
        encoded_seq = self.transformer_encoder(x, src_key_padding_mask=src_key_padding_mask)
        
        # For simulation ticks, we usually care about the prediction directly proceeding the LAST observed event
        # (Assuming causal/causal masking in full deployment, here we take the last state vector)
        last_state = encoded_seq[:, -1, :] 
        
        # Predict deltas for the medical-twin Agent Engine
        health_delta = self.health_delta_head(last_state)
        predicted_vitals = self.vitals_head(last_state)
        
        return health_delta, predicted_vitals

def export_to_onnx():
    """
    Converts trained backend PyTorch model to ONNX for frontend local deployment.
    """
    print("Initializing PyTorch Model...")
    model = MedicalDigitalTwinModel()
    model.eval()
    
    # Define a single inference dummy payload from Agent.ts
    seq_len = 10 # Let's assume Agent.ts sends the past 10 physiological events
    dummy_discrete = torch.randint(0, 50000, (1, seq_len), dtype=torch.long)
    dummy_cont     = torch.randn(1, seq_len, 10, dtype=torch.float32)
    dummy_mask     = torch.ones(1, seq_len, 10, dtype=torch.float32) # Assume fully populated for dummy
    dummy_time     = torch.ones(1, seq_len, dtype=torch.float32)     # 1 tick difference each step
    
    onnx_path = "../public/medical_twin_model.onnx"
    print(f"Exporting to {onnx_path}...")
    
    torch.onnx.export(
        model, 
        (dummy_discrete, dummy_cont, dummy_mask, dummy_time),
        onnx_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=["discrete_tokens", "continuous_vals", "missing_masks", "time_deltas"],
        output_names=["health_delta", "predicted_vitals"],
        dynamic_axes={
            "discrete_tokens": {0: "batch_size", 1: "seq_len"},
            "continuous_vals": {0: "batch_size", 1: "seq_len"},
            "missing_masks":   {0: "batch_size", 1: "seq_len"},
            "time_deltas":     {0: "batch_size", 1: "seq_len"},
            "health_delta":    {0: "batch_size"},
            "predicted_vitals":{0: "batch_size"}
        }
    )
    print("ONNX Export Complete. Frontend can now serve from /public!")

if __name__ == "__main__":
    export_to_onnx()
