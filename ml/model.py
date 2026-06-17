import torch.nn as nn

class Classifier(nn.Module):
    def __init__(
            self,
            input_size: int,
            num_classes: int
    ) -> None:
        super().__init__()

        self.input_layer = nn.Linear(input_size, 512)
        self.hidden_1 = nn.Linear(512, 256)
        self.hidden_2 = nn.Linear(256, 128)
        self.output_layer = nn.Linear(128, num_classes)

        self.activation = nn.ReLU()
        self.dropout = nn.Dropout(0.3)

    def forward(self, x):
        # Pass Input Sequentially through each dense layer and activation
        x = self.activation(self.input_layer(x))
        x = self.activation(self.hidden_1(x))
        x = self.activation(self.hidden_2(x))
        x = self.dropout(x)
        return self.output_layer(x)