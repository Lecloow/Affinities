package ml

import "math"

func softmax(a []float64) []float64 {
	n := len(a)
	if n == 0 {
		return []float64{0.5, 0.5}
	}

	max := a[0]
	for _, v := range a {
		if v > max {
			max = v
		}
	}

	out := make([]float64, n)
	sum := 0.0

	for i, v := range a {
		out[i] = math.Exp(v - max)
		sum += out[i]
	}

	if sum == 0 {
		for i := range out {
			out[i] = 1.0 / float64(n)
		}
		return out
	}

	for i := range out {
		out[i] /= sum
	}

	return out
}

// -------------------
// FORWARD
// -------------------

func forward(x []float64) []float64 {

	if len(x) != 755 {
		return []float64{0.5, 0.5}
	}

	// layer 1
	h1 := make([]float64, len(model.B1))
	for i := range model.W1 {
		sum := model.B1[i]
		for j := range x {
			sum += model.W1[i][j] * x[j]
		}
		h1[i] = relu(sum)
	}

	// layer 2
	h2 := make([]float64, len(model.B2))
	for i := range model.W2 {
		sum := model.B2[i]
		for j := range h1 {
			sum += model.W2[i][j] * h1[j]
		}
		h2[i] = relu(sum)
	}

	// layer 3
	h3 := make([]float64, len(model.B3))
	for i := range model.W3 {
		sum := model.B3[i]
		for j := range h2 {
			sum += model.W3[i][j] * h2[j]
		}
		h3[i] = relu(sum)
	}

	// output
	out := make([]float64, len(model.B4))
	for i := range model.W4 {
		sum := model.B4[i]
		for j := range h3 {
			sum += model.W4[i][j] * h3[j]
		}
		out[i] = sum
	}

	return softmax(out)
}