import Button from "@/components/Button.tsx";
import {useTranslation} from "react-i18next";
import { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Markdown from "@/components/Markdown.tsx";

type PopupProps = {
  isOpen: boolean;
  error?: boolean;
  onClose: () => void;
  content: string;
};

export default function Popup({ isOpen, error, onClose, content }: PopupProps) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <>
      <div
        className="fixed inset-0 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="rounded-lg p-6 shadow-lg pointer-events-auto max-w-sm" style={{backgroundColor: "#efefef"}}>
          {error ?
            <>
              <p>{t("errorMessage")}</p>
              <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-2 cursor-pointer mt-2 hover:underline"
                  style={{color: "#8b8b8b"}}
              >
                {showDetails ? (
                    <ChevronDownIcon className="w-4 h-4" />
                ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                )}
                Details
              </button>
              {showDetails && (
                  <div className="mt-3 p-3 rounded border" style={{backgroundColor: "#f5f5f5", borderColor: "#e0e0e0"}}>
                    <p className="text-sm" style={{color: "#000000"}}>{content}</p>
                  </div>
              )}
            </>
            :
            <Markdown content={content}/>
          }

          <div className="flex justify-center w-full mt-3">
            {error ?
              <Button text={t("retry")} backgroundColor="#e1e0e3" foregroundColor="#e4363c" onClick={() => window.location.reload()}/>
              :
              <Button text={t("cancel")} backgroundColor="#e1e0e3" foregroundColor="#000000" onClick={onClose}/>
            }
          </div>
        </div>
      </div>
    </>
  );
}