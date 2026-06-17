package ml

import (
	"encoding/json"
	"log"
	"math"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
)

var (
	model Model
	once  sync.Once
	ready bool
)

// -------------------
// PATH RESOLVER
// -------------------

func getWeightsPath() string {
	_, filename, _, _ := runtime.Caller(0)
	dir := filepath.Dir(filename)

	return filepath.Join(dir, "..", "..", "..", "ml", "model", "weights.json")
}

// -------------------
// LOAD MODEL (SAFE)
// -------------------

func loadModel() {
	path := getWeightsPath()

	f, err := os.Open(path)
	if err != nil {
		log.Fatalf("failed to open model: %v", err)
	}
	defer f.Close()

	if err := json.NewDecoder(f).Decode(&model); err != nil {
		log.Fatalf("failed to decode model: %v", err)
	}

	if len(model.W1) == 0 || len(model.W4) == 0 {
		log.Fatal("model invalid (empty weights)")
	}

	ready = true
	log.Println("ML model loaded")
}

// -------------------
// ACTIVATIONS
// -------------------

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

// -------------------
// API
// -------------------

func GetGender(name string) string {
	once.Do(loadModel)

	if !ready {
		return "Unknown"
	}

	out := forward(encodeName(name))

	if len(out) < 3 {
		return "Unknown"
	}

	// 3 classes
	maxIdx := 0
	maxVal := out[0]

	for i := 1; i < len(out); i++ {
		if out[i] > maxVal {
			maxVal = out[i]
			maxIdx = i
		}
	}

	switch maxIdx {
	case 0:
		return "Female"
	case 1:
		return "Male"
	case 2:
		return "Unisex"
	default:
		return "Unknown"
	}
}

// -------------------
// FEATURES (755)
// -------------------

const alphabet = "abcdefghijklmnopqrstuvwxyz"

func encodeName(name string) []float64 {
	name = strings.ToLower(strings.TrimSpace(name))

	features := make([]float64, 755)
	n := len(name)

	if n == 0 {
		return features
	}

	// letters
	for i, c := range alphabet {
		count := 0
		for _, ch := range name {
			if ch == c {
				count++
			}
		}
		features[i] = float64(count) / float64(n)
	}

	// bigrams
	bigramOffset := 26
	if n > 1 {
		for i := 0; i < n-1; i++ {
			a := name[i]
			b := name[i+1]

			if a < 'a' || a > 'z' || b < 'a' || b > 'z' {
				continue
			}

			idx := int(a-'a')*26 + int(b-'a')
			features[bigramOffset+idx]++
		}

		div := float64(n - 1)
		for i := 0; i < 676; i++ {
			features[bigramOffset+i] /= div
		}
	}

	// last
	lastOffset := 26 + 676
	last := name[n-1]
	if last >= 'a' && last <= 'z' {
		features[lastOffset+int(last-'a')] = 1
	}

	// first
	firstOffset := 26 + 676 + 26
	first := name[0]
	if first >= 'a' && first <= 'z' {
		features[firstOffset+int(first-'a')] = 1
	}

	// length
	lengthOffset := 26 + 676 + 26 + 26
	features[lengthOffset] = float64(n) / 20.0

	return features
}