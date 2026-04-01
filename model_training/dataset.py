import torch
from torch.utils.data import Dataset
import numpy as np

class HeterogeneousEHRDataset(Dataset):
    """
    A PyTorch Dataset that handles highly variable Real-World Data (RWD).
    It treats missingness as meaningful information (Missingness-Aware Masking)
    and standardizes disparate cadences into time-delta sequences.
    """
    def __init__(self, raw_data_sources, max_seq_len=100, num_continuous_vars=10, num_discrete_codes=50000):
        self.raw_data_sources = raw_data_sources
        self.max_seq_len = max_seq_len
        self.num_continuous_vars = num_continuous_vars
        self.num_discrete_codes = num_discrete_codes
        
        # In a real scenario, this processes Claims + EHR into uniform tensors
        self.samples = self._process_disparate_sources(raw_data_sources)

    def _process_disparate_sources(self, raw_data):
        """
        ETL step simulating unification of variable formats.
        Converts (date, code, value) into sequenced tensors of:
        - time_deltas: days since last event
        - discrete_tokens: ICD/NDC (padded)
        - continuous_vals: Lab values 
        - missing_masks: 1 if lab was measured, 0 if missing/not measured
        """
        # Placeholder for processed patient trajectories
        return [self._simulate_patient() for _ in range(100)] 

    def _simulate_patient(self):
        seq_len = np.random.randint(10, self.max_seq_len)
        
        # Time intervals between visits (very irregular)
        time_deltas = np.random.exponential(scale=30.0, size=(seq_len,)) 
        
        # Discrete events (ICD-10, NDC) - 0 is padding
        discrete = np.random.randint(1, self.num_discrete_codes, size=(seq_len,))
        
        # Continuous values (Labs, Vitals)
        continuous = np.random.randn(seq_len, self.num_continuous_vars)
        
        # Missingness mask (often 80%+ of labs are missing at any given visit code)
        # This explicitly tells the model "A doctor did NOT order an A1C test today"
        missing_mask = np.random.binomial(1, 0.2, size=(seq_len, self.num_continuous_vars))
        
        # Mask out values that are actually missing (set to 0, mask tracks the missingness)
        continuous = continuous * missing_mask
        
        return {
            'time_deltas': torch.tensor(time_deltas, dtype=torch.float32),
            'discrete': torch.tensor(discrete, dtype=torch.long),
            'continuous': torch.tensor(continuous, dtype=torch.float32),
            'missing_mask': torch.tensor(missing_mask, dtype=torch.float32),
            'seq_len': seq_len
        }

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        sample = self.samples[idx]
        seq_len = sample['seq_len']
        
        # Pad sequences to max_seq_len for batched Transformer training
        pad_len = self.max_seq_len - seq_len
        
        padded_discrete = torch.nn.functional.pad(sample['discrete'], (0, pad_len), value=0)
        padded_time = torch.nn.functional.pad(sample['time_deltas'], (0, pad_len), value=0.0)
        
        padded_cont = torch.nn.functional.pad(sample['continuous'], (0, 0, 0, pad_len), value=0.0)
        padded_mask = torch.nn.functional.pad(sample['missing_mask'], (0, 0, 0, pad_len), value=0.0)
        
        # Attention mask (1 for real data, 0 for pad)
        attn_mask = torch.cat([torch.ones(seq_len), torch.zeros(pad_len)])
        
        return {
            'discrete_tokens': padded_discrete,       # (max_seq_len)
            'continuous_vals': padded_cont,           # (max_seq_len, num_continuous_vars)
            'missing_masks': padded_mask,             # (max_seq_len, num_continuous_vars)
            'time_deltas': padded_time,               # (max_seq_len)
            'attention_mask': attn_mask               # (max_seq_len)
        }
