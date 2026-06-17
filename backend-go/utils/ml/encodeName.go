package ml

import "strings"


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