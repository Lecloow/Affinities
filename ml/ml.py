import torch
import torch.nn as nn
import torch.optim as optim
import json
from pathlib import Path
from torch.utils.data import DataLoader
from model import Classifier
from dataset import NameDataset

# -------------------
# CONFIG
# -------------------
INPUT_SIZE = 755
NUM_CLASSES = 3
BATCH_SIZE = 128
LEARNING_RATE = 0.001
NUM_EPOCHS = 50 # Minimum (500+ is better for precision)
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

# -------------------
# DATASET
# -------------------
BASE_DIR = Path(__file__).resolve().parent

train_dataset = NameDataset(BASE_DIR / "data/train.csv")
test_dataset = NameDataset(BASE_DIR / "data/test.csv")

train_dataloader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
test_dataloader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)

# -------------------
# MODEL
# -------------------
model = Classifier(input_size=INPUT_SIZE, num_classes=NUM_CLASSES)
model.to(DEVICE)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

# -------------------
# TRAINING
# -------------------
print("\nTraining...\n")

for epoch in range(NUM_EPOCHS):
    total_loss = 0
    steps = 0

    for x, y in train_dataloader:
        x = x.to(DEVICE)
        y = y.to(DEVICE)

        preds = model(x)
        loss = criterion(preds, y)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        steps += 1

    print(f"Epoch {epoch+1}/{NUM_EPOCHS} - Loss: {total_loss / steps:.4f}")


# -------------------
# SAVE MODEL
# -------------------
torch.save(model.state_dict(), BASE_DIR / "model/weights.pth")


# -------------------
# EVALUATION
# -------------------
print("\nEvaluating...\n")

model.eval()

correct = 0
total = 0

with torch.no_grad():
    for x, y in test_dataloader:
        x = x.to(DEVICE)
        y = y.to(DEVICE)

        preds = model(x)
        preds = torch.argmax(preds, dim=1)

        correct += (preds == y).sum().item()
        total += y.size(0)

print(f"ACCURACY: {(correct / total) * 100:.2f}%")

# -------------------
# EXPORT WEIGHTS 
# -------------------
print("\nExporting weights to JSON...\n")

weights = {
    "w1": model.input_layer.weight.detach().cpu().numpy().tolist(),
    "b1": model.input_layer.bias.detach().cpu().numpy().tolist(),

    "w2": model.hidden_1.weight.detach().cpu().numpy().tolist(),
    "b2": model.hidden_1.bias.detach().cpu().numpy().tolist(),

    "w3": model.hidden_2.weight.detach().cpu().numpy().tolist(),
    "b3": model.hidden_2.bias.detach().cpu().numpy().tolist(),

    "w4": model.output_layer.weight.detach().cpu().numpy().tolist(),
    "b4": model.output_layer.bias.detach().cpu().numpy().tolist(),
}

output_path = BASE_DIR / "model/weights.json"

with open(output_path, "w") as f:
    json.dump(weights, f)

print(f"Data exported → {output_path}")