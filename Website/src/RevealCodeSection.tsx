import { useEffect, useState } from "react";
import { ApiService } from "./api";
import { StorageService } from "./storage";

interface Props {
  day: number;
  onExchange: (day: number, code: string) => void;
}

export function RevealCodeSection({ day, onExchange }: Props) {
  const [codeData, setCodeData] = useState<any>(null);
  const user = StorageService.getUser();

  useEffect(() => {
    async function load() {
      if (!user) return;
      const data = await ApiService.getRevealCode(user.id, day);
      setCodeData(data);
    }
    load();
  }, [day, user]);

  if (!codeData?.available) return null;

  return (
    <div className="reveal-code-section">
      <h3>🎁 Ton Code Secret</h3>

      <div>{codeData.code}</div>

      {!codeData.exchanged && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = (e.target as any).code.value;
            onExchange(day, input);
          }}
        >
          <input name="code" placeholder="Code partenaire" />
          <button type="submit">Échanger</button>
        </form>
      )}
    </div>
  );
}
