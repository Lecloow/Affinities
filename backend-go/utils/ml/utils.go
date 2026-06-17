package ml

func relu(x float64) float64 {
	if x > 0 {
		return x
	}
	return 0
}