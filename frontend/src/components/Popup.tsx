import Button from "@/components/Button.tsx";
import {useTranslation} from "react-i18next";
import ReactMarkdown from "react-markdown";
import { useEffect } from "react";

type PopupProps = {
  isOpen: boolean;
  onClose: () => void;
  content: string;
};

export default function Popup({ isOpen, onClose, content }: PopupProps) {
  const { t } = useTranslation();

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
          <div className="rounded-lg p-6 shadow-lg pointer-events-auto max-w-sm" style={{backgroundColor: "#ffffff"}}>
            <ReactMarkdown components={{ strong: (props) => <strong style={{fontWeight: "600"}} {...props} /> }}>
              {content}
            </ReactMarkdown>

            <div className="flex justify-center w-full mt-3">
              <Button text={t("cancel")} backgroundColor="#f3f3f3" foregroundColor="#000000" onClick={onClose}/>
            </div>
          </div>
        </div>
      </>
  );
}