import { useState } from 'react';

interface ResultBlockProps {
  title: string;
  text?: string;
}

const ResultBlock = ({ title, text }: ResultBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-blue-50">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!text}
          className="rounded-full border border-blue-400 px-3 py-1 text-xs text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
        >
          {copied ? '복사됨' : '복사하기'}
        </button>
      </div>
      {text ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{text}</p>
      ) : (
        <p className="text-sm text-slate-500">아직 생성된 문구가 없습니다.</p>
      )}
    </div>
  );
};

export default ResultBlock;
