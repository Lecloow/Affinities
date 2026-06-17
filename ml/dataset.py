from pathlib import Path

import pandas as pd
from torch.utils.data import Dataset
from utils import encode_name

class NameDataset(Dataset):
    def __init__(self, csvPath: Path):
        df = pd.read_csv(csvPath)

        df = df[df["Gender"].isin(["Male", "Female", "Unisex"])].reset_index(drop=True)

        self.names = df["Name"].tolist()

        mapping = {
            "Female": 0,
            "Male": 1,
            "Unisex": 2
        }

        self.labels = [mapping[g] for g in df["Gender"]]

    def __len__(self):
        return len(self.names)

    def __getitem__(self, idx):
        x = encode_name(self.names[idx])
        y = self.labels[idx]
        return x, y