import { useState } from 'react';

interface ResultBlockProps {
  title: string;
  text?: string;
  hashtags?: string[];
}

const ResultBlock = ({ title, text, hashtags }: ResultBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(
        hashtags?.length ? `${text}\n\n${hashtags.map((tag) => `#${tag.replace(/^#/, '')}`).join(' ')}` : text
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('copy failed', err);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-primary/10">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!text}
          className="rounded-full border border-primary/50 px-3 py-1 text-xs text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-400"
        >
          {copied ? '복사됨' : '복사하기'}
        </button>
      </div>
      {text ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{text}</p>
      ) : (
        <p className="text-sm text-slate-500">아직 생성된 문구가 없습니다.</p>
      )}
      {hashtags?.length ? (
        <div className="mt-3 flex flex-wrap gap-1 text-xs text-slate-300">
          {hashtags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/10 px-2 py-1">
              #{tag.replace(/^#/, '')}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ResultBlock;
