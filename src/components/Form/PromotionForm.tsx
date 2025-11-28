import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { COMMON_LOCATION_SUGGESTIONS } from '../../data/busanData';
import { PromotionResponse } from '../../types/promotion';

interface PromotionFormProps {
  onCompleted?: (data: PromotionResponse) => void;
}

const PromotionForm = ({ onCompleted }: PromotionFormProps) => {
  const [storeName, setStoreName] = useState('');
  const [location, setLocation] = useState(COMMON_LOCATION_SUGGESTIONS[0] ?? '');
  const [description, setDescription] = useState('');
  const [includeTrends, setIncludeTrends] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localResult, setLocalResult] = useState<PromotionResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('이미지 변환에 실패했습니다.'));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const imageBase64 = imageFile ? await fileToBase64(imageFile) : null;
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: storeName.trim(),
          description: description.trim(),
          location,
          includeTrends,
          imageBase64
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '생성에 실패했어요. 잠시 후 다시 시도해주세요.');
      }

      const data = await res.json();
      const feedText =
        (data?.feed as string | undefined) ||
        (data?.results?.instagram_feed?.text as string | undefined) ||
        (data?.result as string | undefined) ||
        '';
      const storyText =
        (data?.story as string | undefined) || (data?.results?.instagram_story?.text as string | undefined) || feedText;
      const mapText =
        (data?.map as string | undefined) || (data?.results?.map_review?.text as string | undefined) || feedText;
      const smsText = (data?.sms as string | undefined) || (data?.results?.sms?.text as string | undefined) || feedText;

      const normalized: PromotionResponse = {
        contextSummary: data?.contextSummary,
        results: {
          instagram_feed: { text: feedText, hashtags: data?.results?.instagram_feed?.hashtags || [] },
          instagram_story: { text: storyText },
          map_review: { text: mapText },
          sms: { text: smsText }
        }
      };
      setLocalResult(normalized);
      onCompleted?.(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성에 실패했어요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mainCopyText = useMemo(() => {
    return (
      localResult?.results.instagram_feed?.text ||
      localResult?.results.instagram_story?.text ||
      localResult?.results.map_review?.text ||
      localResult?.results.sms?.text ||
      ''
    );
  }, [localResult]);

  const handleCopy = async () => {
    if (!mainCopyText) return;
    await navigator.clipboard.writeText(mainCopyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const disabledSubmit = isSubmitting || !storeName.trim() || !description.trim() || !location.trim();

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-primary/5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">입력</p>
          <h2 className="text-xl font-semibold">사진을 올리고 동네를 적으면 AI가 써줘요</h2>
        </div>
        <span className="text-xs text-slate-400">Vercel Serverless + Solar API</span>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <span className="text-sm text-slate-200">사진 업로드 (메뉴/매장)</span>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-slate-950"
              />
              <span className="text-xs text-slate-400">미리보기 포함 · 업로드는 선택사항</span>
            </div>
            {imagePreview ? (
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                <img src={imagePreview} alt="업로드 미리보기" className="w-full max-h-52 object-cover" />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-xs text-slate-500">
                아직 선택한 사진이 없어요.
              </div>
            )}
          </label>

          <div className="space-y-3">
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              가게 이름
              <input
                className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none focus:border-primary/60"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="예) 남포동 OO카페"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-200">
              위치 입력 (자동완성 + 직접 입력)
              <input
                className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none focus:border-primary/60"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                list="location-suggestions"
                placeholder="서면/전포, 광안리, 괴정동 등 자유 입력"
              />
              <datalist id="location-suggestions">
                {COMMON_LOCATION_SUGGESTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              <span className="text-xs text-slate-400">
                서면/전포, 광안리, 해운대, 남포동(자갈치/국제시장), 기장(오시리아), 영도(흰여울) 추천 · 다른 동네도 직접 입력 가능
              </span>
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-200">
              메뉴/이벤트 설명
              <textarea
                className="min-h-[120px] rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none focus:border-primary/60"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="대표 메뉴, 이벤트, 원하는 톤 등을 적어주세요."
              />
            </label>
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={includeTrends}
            onChange={(e) => setIncludeTrends(e.target.checked)}
            className="h-4 w-4"
          />
          <div>
            <p className="font-semibold">오늘 우리 동네 날씨/이슈 반영</p>
            <p className="text-xs text-slate-400">요일·시간·날씨를 가상 생성해 퇴근길/주말 인파 같은 컨텍스트를 문구에 녹입니다.</p>
          </div>
        </label>

        {error ? <p className="text-sm text-amber-300">{error}</p> : null}

        <button
          type="submit"
          disabled={disabledSubmit}
          className="w-full rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:shadow-[0_10px_40px_rgba(31,182,255,0.35)] disabled:cursor-not-allowed disabled:bg-white/30"
        >
          {isSubmitting ? 'AI가 글을 작성 중...' : '생성하기'}
        </button>
      </form>

      {localResult ? (
        <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-slate-100">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">결과</p>
              <p className="font-semibold">{localResult.contextSummary || '생성된 홍보글'}</p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-full border border-primary/60 px-3 py-1 text-xs text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed"
              disabled={!mainCopyText}
            >
              {copied ? '복사됨' : '복사하기'}
            </button>
          </div>
          <p className="whitespace-pre-wrap leading-relaxed">
            {mainCopyText || 'AI 결과가 도착하면 여기서 바로 복사할 수 있어요.'}
          </p>
        </div>
      ) : null}
    </section>
  );
};

export default PromotionForm;
