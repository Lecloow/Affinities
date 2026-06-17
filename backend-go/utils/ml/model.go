package ml

type Model struct {
	W1 [][]float64 `json:"w1"`
	B1 []float64   `json:"b1"`

	W2 [][]float64 `json:"w2"`
	B2 []float64   `json:"b2"`

	W3 [][]float64 `json:"w3"`
	B3 []float64   `json:"b3"`

	W4 [][]float64 `json:"w4"`
	B4 []float64   `json:"b4"`
}