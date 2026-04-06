import torch
import torch.nn as nn
import os
import io

class BasePredictor(nn.Module):
    def __init__(self, in_features, out_features, embed_dim=8, num_heads=2, num_layers=2, hidden_dim=64):
        super().__init__()
        self.embedding = nn.Linear(in_features, embed_dim)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim, 
            nhead=num_heads, 
            dim_feedforward=hidden_dim, 
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.hazard_head = nn.Sequential(
            nn.Linear(embed_dim, 32),
            nn.ReLU(),
            nn.Linear(32, out_features),
            nn.Sigmoid() 
        )

    def forward(self, x):
        x = self.embedding(x)
        features = self.transformer(x)
        final_state = features[:, -1, :] 
        return self.hazard_head(final_state)

def export_onnx(model, dummy_input, filename):
    onnx_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'public', filename))
    model.eval()
    f = io.BytesIO()
    torch.onnx.export(
        model, dummy_input, f,
        export_params=True, opset_version=14, do_constant_folding=True,
        input_names=['vitals_input'], output_names=['hazard_preds'],
        dynamic_axes={
            'vitals_input': {0: 'batch_size', 1: 'seq_len'}, 
            'hazard_preds': {0: 'batch_size'}
        }
    )
    f.seek(0)
    with open(onnx_path, 'wb') as out:
         out.write(f.read())
    print(f"Successfully generated {filename}")

# Model 1: Cardiometabolic (Age, BP, CVHealth, LDL) -> (Stroke, CHF)
m_cardio = BasePredictor(in_features=4, out_features=2)
export_onnx(m_cardio, torch.randn(1, 10, 4), 'cardio_model.onnx')

# Model 2: Renal (A1c, eGFR, UACR) -> (Renal Failure)
m_renal = BasePredictor(in_features=3, out_features=1)
export_onnx(m_renal, torch.randn(1, 10, 3), 'renal_model.onnx')

# Model 3: Neurology (Age, BMI, Stress) -> (Dementia/Alzheimer's)
m_neuro = BasePredictor(in_features=3, out_features=1)
export_onnx(m_neuro, torch.randn(1, 10, 3), 'neuro_model.onnx')

