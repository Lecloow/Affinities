package ml

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"sync"
)

var (
	model Model
	once  sync.Once
	ready bool
)

func GetGender(name string) string {
	once.Do(loadModel)

	if !ready {
		return "Unknown"
	}

	out := forward(encodeName(name))

	if len(out) < 3 {
		return "Unknown"
	}

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

func getWeightsPath() string {
	_, filename, _, _ := runtime.Caller(0)
	dir := filepath.Dir(filename)

	return filepath.Join(dir, "..", "..", "..", "ml", "model", "weights.json")
}

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