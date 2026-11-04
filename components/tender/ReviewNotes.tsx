import React, { useState, useRef } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { useTenderStore } from "@/store/tenderStore";

interface ReviewNotesProps {
  code: string;
}

const MAX_CHARS = 1000;

export const ReviewNotes: React.FC<ReviewNotesProps> = ({ code }) => {
  const savedNote = useTenderStore((state) => state.notes[code] || "");
  const setStoreNote = useTenderStore((state) => state.setNote);

  const [text, setText] = useState<string>(savedNote);
  const [prevSavedNote, setPrevSavedNote] = useState<string>(savedNote);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (savedNote !== prevSavedNote) {
    setPrevSavedNote(savedNote);
    setText(savedNote);
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value.slice(0, MAX_CHARS);
    setText(newVal);
    setSaveStatus("saving");

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setStoreNote(code, newVal);
      setSaveStatus("saved");
    }, 500);
  };

  const handleBlur = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setStoreNote(code, text);
    setSaveStatus("saved");
  };

  return (
    <div className="mt-6 pt-5 border-t border-neutral-200">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={`review-notes-${code}`}
          className="text-sm font-semibold text-neutral-900"
        >
          Catatan Review (Internal)
        </label>
        <div className="flex items-center gap-3 text-xs">
          {saveStatus === "saving" ? (
            <span className="flex items-center gap-1 text-amber-700 font-medium">
              <Clock className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center gap-1 text-green-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              Tersimpan
            </span>
          )}
          <span
            className={`font-mono ${
              text.length >= MAX_CHARS ? "text-red-600 font-bold" : "text-neutral-500"
            }`}
          >
            {text.length} / {MAX_CHARS}
          </span>
        </div>
      </div>
      <textarea
        id={`review-notes-${code}`}
        rows={4}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Tulis catatan analisis, temuan kepatuhan, atau catatan verifikasi di sini..."
        className="w-full p-3 text-sm bg-neutral-50 border border-neutral-300 rounded-md text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
      />
      <p className="mt-1 text-xs text-neutral-500">
        Catatan disimpan secara lokal di peramban dan tidak dikirimkan ke server.
      </p>
    </div>
  );
};
