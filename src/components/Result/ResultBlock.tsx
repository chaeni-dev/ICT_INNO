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
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!text}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
        >
          {copied ? '복사됨' : '복사하기'}
        </button>
      </div>
      {text ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{text}</p>
      ) : (
        <p className="text-sm text-gray-500">아직 생성된 문구가 없습니다.</p>
      )}
      {hashtags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {hashtags.map((tag) => (
            <span key={tag} className="rounded-full bg-white border border-gray-200 px-2.5 py-1 text-gray-700">
              #{tag.replace(/^#/, '')}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ResultBlock;
