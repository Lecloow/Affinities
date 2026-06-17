import torch
from dataset import encode_name
from model import Classifier
from pathlib import Path

# Constants
INPUT_SIZE = 755
NUM_CLASSES = 3
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
LABELS = ["Female", "Male", "Unisex"]

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model/weights.pth"

# Load the model
model = Classifier(input_size=INPUT_SIZE, num_classes=NUM_CLASSES)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()

def predict_gender(name: str) -> tuple[str, float]:
    """Predict the gender of a given name and return the gender and confidence."""
    x = encode_name(name).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=1)
        pred = torch.argmax(probs, dim=1).item()
        pred = int(pred)
        confidence = probs[0, pred].item() * 100

    return LABELS[pred], confidence

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        name = sys.argv[1]
        gender, confidence = predict_gender(name)
        # Output format: gender,confidence (cleaned of any null characters)
        print(f"{gender},{confidence:.2f}".replace('\x00', ''))
    else:
        print("Usage: python predict.py <name>")
        sys.exit(1)
