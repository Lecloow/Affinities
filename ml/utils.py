import torch
ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

def encode_name(name: str) -> torch.Tensor:
    name = name.lower().strip()

    # Bag of letters (26)
    freq = [name.count(c) / len(name) for c in ALPHABET]

    # Bigrammes (26*26 = 676)
    bigrams = [0.0] * 676
    for i in range(len(name) - 1):
        a, b = name[i], name[i + 1]
        if a in ALPHABET and b in ALPHABET:
            idx = ALPHABET.index(a) * 26 + ALPHABET.index(b)
            bigrams[idx] += 1.0
    if len(name) > 1:
        bigrams = [x / (len(name) - 1) for x in bigrams]

    # Last letter (26)
    last = [0.0] * 26
    if name[-1] in ALPHABET:
        last[ALPHABET.index(name[-1])] = 1.0

    # First letter (26)
    first = [0.0] * 26
    if name[0] in ALPHABET:
        first[ALPHABET.index(name[0])] = 1.0

    # Length (1)
    length = [len(name) / 20.0]

    return torch.tensor(freq + bigrams + last + first + length, dtype=torch.float32)  # 755 (26*26 + 3*26 + 1) features
