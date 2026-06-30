import { useState, useEffect } from "react";
import * as ort from "onnxruntime-web";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

import { Button, Credits, TextInput } from "@/components";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

function encodeName(name: string): number[] {
  name = name.toLowerCase().trim();

  if (!name.length) {
    return Array(755).fill(0);
  }

  const freq = Array(26).fill(0);

  for (let i = 0; i < 26; i++) {
    const c = ALPHABET[i];
    freq[i] = [...name].filter((x) => x === c).length / name.length;
  }

  const bigrams = Array(676).fill(0);

  for (let i = 0; i < name.length - 1; i++) {
    const a = ALPHABET.indexOf(name[i]);
    const b = ALPHABET.indexOf(name[i + 1]);

    if (a !== -1 && b !== -1) {
      bigrams[a * 26 + b]++;
    }
  }

  if (name.length > 1) {
    for (let i = 0; i < 676; i++) {
      bigrams[i] /= (name.length - 1);
    }
  }

  const last = Array(26).fill(0);
  const first = Array(26).fill(0);

  const firstIndex = ALPHABET.indexOf(name[0]);
  const lastIndex = ALPHABET.indexOf(name[name.length - 1]);

  if (firstIndex !== -1) first[firstIndex] = 1;
  if (lastIndex !== -1) last[lastIndex] = 1;

  const length = [name.length / 20];

  return [...freq, ...bigrams, ...last, ...first, ...length];
}

export default function MlPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(true);

  const [session, setSession] =
    useState<ort.InferenceSession | null>(null);

  const goBack = () => navigate("/home");

  useEffect(() => {
    async function loadModel() {
      try {
        const s = await ort.InferenceSession.create("/model.onnx");

        console.log("Inputs:", s.inputNames);
        console.log("Outputs:", s.outputNames);

        setSession(s);
      } catch (err) {
        console.error("Failed to load model:", err);
      } finally {
        setLoading(false);
      }
    }

    loadModel();
  }, []);

  useEffect(() => {
    if (!session || !firstName.trim()) {
      setPrediction("");
      return;
    }
  
    predict();
  }, [firstName, session]);

  const predict = async () => {
    if (!session || !firstName.trim()) {
      return;
    }

    try {
      const features = encodeName(firstName);

      const inputTensor = new ort.Tensor(
        "float32",
        Float32Array.from(features),
        [1, 755]
      );

      const feeds: Record<string, ort.Tensor> = {
        [session.inputNames[0]]: inputTensor,
      };

      const results = await session.run(feeds);

      const outputName = session.outputNames[0];
      const output = results[outputName].data as Float32Array;

      let bestIndex = 0;

      for (let i = 1; i < output.length; i++) {
        if (output[i] > output[bestIndex]) {
          bestIndex = i;
        }
      }

      const labels = [
        "Female",
        "Male",
        "Unisex",
      ];

      setPrediction(labels[bestIndex] ?? "Unknown");
    } catch (err) {
      console.error(err);
      setPrediction("Error");
    }
  };

  return (
    <div>
      <div className="bg-white flex flex-col w-full items-center mt-5 min-h-screen">
        <div className="flex flex-row justify-center items-center gap-[4.9rem]">
          <Button
            onClick={goBack}
            style={{
              width: "2.5rem",
              padding: "0px",
            }}
          >
            <ChevronLeftIcon className="w-[1.4rem] h-[1.4rem]" />
          </Button>

          <h1
            className="text-[30px]"
            style={{ fontWeight: 400 }}
          >
            {t("Test the ml")}
          </h1>
        </div>

        <div className="flex flex-col gap-4 p-10 w-full max-w-md">
          <TextInput
            placeholder={t("firstName")}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                predict();
              }
            }}
          />

          <Button
            onClick={predict}
            disabled={!session || loading}
          >
            {loading ? "Loading model..." : "Predict"}
          </Button>

          {prediction && (
            <div className="text-xl text-center">
              {firstName} is a {prediction} first name.
            </div>
          )}
        </div>
      </div>

      <Credits />
    </div>
  );
}