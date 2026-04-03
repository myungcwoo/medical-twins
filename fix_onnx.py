import torch
import torch.nn as nn
import os

class TransformerPredictor(nn.Module):
    def __init__(self, embed_dim=8, num_heads=2, num_layers=2, hidden_dim=64):
        super().__init__()
        self.embedding = nn.Linear(8, embed_dim)
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
            nn.Linear(32, 4),
            nn.Sigmoid() 
        )

    def forward(self, x):
        x = self.embedding(x)
        features = self.transformer(x)
        final_state = features[:, -1, :] 
        return self.hazard_head(final_state)

model = TransformerPredictor()
model.eval()

import io

dummy_input = torch.randn(1, 10, 8)
onnx_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'public', 'medical_twin_model.onnx'))

# Export to memory buffer first to guarantee single binary blob without .data shards
f = io.BytesIO()
torch.onnx.export(
    model,
    dummy_input,
    f,
    export_params=True,
    opset_version=14,
    do_constant_folding=True,
    input_names=['vitals_input'],
    output_names=['hazard_preds'],
    dynamic_axes={
        'vitals_input': {0: 'batch_size', 1: 'seq_len'}, 
        'hazard_preds': {0: 'batch_size'}
    }
)
f.seek(0)
with open(onnx_path, 'wb') as out:
    out.write(f.read())

print(f"Successfully generated clean, unified ONNX at {onnx_path}")

