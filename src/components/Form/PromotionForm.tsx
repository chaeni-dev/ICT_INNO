import { FormEvent, useEffect, useState } from 'react';
import { PromotionResponse } from '../../types/promotion';
import LocationHint from './LocationHint';

declare global {
  interface Window {
    daum: any;
  }
}

interface PromotionFormProps {
  onCompleted?: (data: PromotionResponse) => void;
}

const ADDRESS_SUGGESTIONS = [
  '부산 중구 남포동 자갈치로 12',
  '부산 수영구 광안동 광안해변로 193',
  '부산 해운대구 우동 해운대해변로 287',
  '부산 부산진구 전포동 서면문화로 10',
  '부산 기장군 기장읍 기장해안로 100',
  '부산 영도구 봉래동 흰여울길 65'
];

const CATEGORY_OPTIONS = ['카페', '식당', '주점', '베이커리', '뷰티/헤어', '기타'];

const PromotionForm = ({ onCompleted }: PromotionFormProps) => {
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [description, setDescription] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [includeTrends, setIncludeTrends] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPostcodeLoading, setIsPostcodeLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.daum?.Postcode) return;
    if (document.getElementById('daum-postcode-script')) return;
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.id = 'daum-postcode-script';
    document.body.appendChild(script);
  }, []);

  const handleAddressSearch = () => {
    if (typeof window === 'undefined') return;
    if (!window.daum?.Postcode) {
      setIsPostcodeLoading(true);
      setTimeout(() => setIsPostcodeLoading(false), 800);
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        const fullAddress = data.address || data.roadAddress || '';
        setAddress(fullAddress);
      }
    }).open();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: storeName.trim(),
          description: description.trim(),
          location: address.trim(),
          address: address.trim(),
          businessHours: businessHours.trim(),
          category,
          includeTrends
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
      onCompleted?.(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성에 실패했어요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabledSubmit = isSubmitting || !storeName.trim() || !description.trim() || !address.trim() || !businessHours.trim();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-blue-100/60">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-500">입력</p>
          <h2 className="text-xl font-semibold text-slate-900">주소와 정보를 입력하면 AI가 홍보글을 완성해드려요</h2>
        </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <label className="flex flex-col gap-2 text-sm text-slate-800">
              가게 이름
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-400"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="예) 남포동 OO카페"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-800">
              업종 선택
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-400"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-800">
              상세 주소
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-400"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  list="address-suggestions"
                  placeholder="부산 ○○구 ○○동 ○○로 00"
                />
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  className="rounded-xl border border-blue-400 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isPostcodeLoading}
                >
                  {isPostcodeLoading ? '로드 중...' : '주소 검색'}
                </button>
              </div>
              <datalist id="address-suggestions">
                {ADDRESS_SUGGESTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              <LocationHint />
            </label>
          </div>

          <div className="space-y-3">
            <label className="flex flex-col gap-2 text-sm text-slate-800">
              메뉴/이벤트/이점 설명
              <textarea
                className="min-h-[140px] rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-400"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="대표 메뉴, 이벤트, 이점을 적어주세요."
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-800">
              영업시간
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-400"
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                placeholder="예) 매일 11:00~22:00 (연중무휴)"
              />
            </label>
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={includeTrends}
            onChange={(e) => setIncludeTrends(e.target.checked)}
            className="h-4 w-4"
          />
          <div>
            <p className="font-semibold">오늘 우리 동네 날씨/이슈 반영</p>
            <p className="text-xs text-slate-500">날씨/요일 컨텍스트를 문구에 반영합니다.</p>
          </div>
        </label>

        {error ? <p className="text-sm text-amber-500">{error}</p> : null}

        <button
          type="submit"
          disabled={disabledSubmit}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:shadow-[0_10px_40px_rgba(59,130,246,0.35)] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? 'AI가 글을 작성 중...' : '생성하기'}
        </button>
      </form>
    </section>
  );
};

export default PromotionForm;
