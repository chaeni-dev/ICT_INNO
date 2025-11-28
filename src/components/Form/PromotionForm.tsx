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

      const data: PromotionResponse = await res.json();
      setLocalResult(data);
      onCompleted?.(data);
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
    <section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">홍보 문구 생성</h2>
        <p className="text-sm text-gray-600">
          사진과 간단한 정보만 입력하면 AI가 채널별 홍보 문구를 자동으로 생성해드립니다.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">사진 업로드 (선택사항)</span>
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white file:cursor-pointer hover:file:bg-teal-dark"
                />
                <span className="text-xs text-gray-500">메뉴나 매장 사진을 업로드하시면 더 정확한 문구가 생성됩니다.</span>
              </div>
              {imagePreview ? (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <img src={imagePreview} alt="업로드 미리보기" className="w-full max-h-52 object-cover" />
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-sm text-gray-400">
                  사진을 선택해주세요
                </div>
              )}
            </label>
          </div>

          <div className="space-y-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">가게 이름</span>
              <input
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="예) 남포동 OO카페"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">위치</span>
              <input
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                list="location-suggestions"
                placeholder="서면, 광안리, 괴정동 등"
              />
              <datalist id="location-suggestions">
                {COMMON_LOCATION_SUGGESTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              <span className="text-xs text-gray-500">서면/광안리/해운대/남포동 등 추천</span>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">메뉴/이벤트 설명</span>
              <textarea
                className="min-h-[120px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="대표 메뉴, 이벤트, 원하는 톤 등을 적어주세요."
              />
            </label>
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-mint-light p-4">
          <input
            type="checkbox"
            checked={includeTrends}
            onChange={(e) => setIncludeTrends(e.target.checked)}
            className="mt-0.5 h-4 w-4 text-primary"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">오늘 우리 동네 분위기/이슈 반영</p>
            <p className="mt-1 text-xs text-gray-600">요일·시간·날씨를 가상 생성해 퇴근길/주말 인파 같은 컨텍스트를 문구에 녹입니다.</p>
          </div>
        </label>

        {error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={disabledSubmit}
          className="w-full rounded-lg bg-primary px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-teal-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          {isSubmitting ? 'AI가 글을 작성 중...' : '생성하기'}
        </button>
      </form>

      {localResult ? (
        <div className="mt-6 rounded-lg border border-primary/30 bg-mint-light p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">생성 완료</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{localResult.contextSummary || '홍보 문구가 생성되었습니다'}</p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg border border-primary bg-white px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-mint-medium disabled:cursor-not-allowed"
              disabled={!mainCopyText}
            >
              {copied ? '복사됨' : '복사하기'}
            </button>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {mainCopyText || 'AI 결과가 도착하면 여기서 바로 복사할 수 있어요.'}
          </p>
        </div>
      ) : null}
    </section>
  );
};

export default PromotionForm;
