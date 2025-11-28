import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useGeneratePromotion, useLocalContext } from '../../hooks/useGeneratePromotion';
import { Channel, PromotionRequest, PromotionResponse, Tone, Timing } from '../../types/promotion';

interface PromotionFormProps {
  onCompleted?: (data: PromotionResponse) => void;
}

const initialForm: PromotionRequest = {
  storeName: '남포동 OO카페',
  category: '카페',
  location: '남포동',
  intro: '조용하게 책 읽기 좋은 동네 카페',
  menus: ['아메리카노', '카페라떼', '바스크 치즈케이크'],
  event: '오늘 아메리카노 2잔 이상 주문 시 1,000원 할인',
  tone: 'busan-dialect',
  timing: 'weekend',
  channels: ['instagram_feed', 'instagram_story', 'map_review', 'sms'],
  useLocalContext: true,
  photoDescription: ''
};

const channelLabels: Record<Channel, string> = {
  instagram_feed: '인스타 피드',
  instagram_story: '인스타 스토리',
  map_review: '지도 리뷰',
  sms: '문자/알림톡'
};

const toneLabels: Record<Tone, string> = {
  'seoul-instagram': '세련된 인스타 감성',
  'busan-dialect': '친근한 부산 사투리'
};

const timingOptions: Record<Timing, string> = {
  today: '오늘',
  weekend: '주말',
  payday: '급여일 전후',
  festival: '지역 축제'
};

const PromotionForm = ({ onCompleted }: PromotionFormProps) => {
  const [form, setForm] = useState<PromotionRequest>(initialForm);
  const [menusInput, setMenusInput] = useState(initialForm.menus.join(', '));
  const [localContext, setLocalContext] = useState('');

  const {
    data: localContextData,
    refetch: refetchLocalContext,
    isFetching: isContextLoading
  } = useLocalContext(form.location);

  const { mutate, isPending, error } = useGeneratePromotion({
    onSuccess: (data) => {
      setLocalContext(data.contextSummary ?? localContext);
      onCompleted?.(data);
    }
  });

  useEffect(() => {
    if (localContextData?.contextSummary) {
      setLocalContext(localContextData.contextSummary);
    }
  }, [localContextData]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const menus = menusInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    mutate({
      ...form,
      menus
    });
  };

  const toggleChannel = (channel: Channel) => {
    setForm((prev) => {
      const exists = prev.channels.includes(channel);
      return {
        ...prev,
        channels: exists ? prev.channels.filter((c) => c !== channel) : [...prev.channels, channel]
      };
    });
  };

  const formIsDisabled = useMemo(() => isPending || isContextLoading, [isPending, isContextLoading]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-primary/5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">입력</p>
          <h2 className="text-xl font-semibold">가게 정보와 원하는 톤을 알려주세요</h2>
        </div>
        <span className="text-xs text-slate-400">사진 없이 텍스트만 입력</span>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            업종
            <input
              className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none focus:border-primary/60"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="카페, 식당 등"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            가게 이름
            <input
              className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none focus:border-primary/60"
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              placeholder="남포동 OO카페"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            위치(동/상권)
            <input
              className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none focus:border-primary/60"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="남포동, 광안리"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            가게 한 줄 소개
            <input
              className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none focus:border-primary/60"
              value={form.intro}
              onChange={(e) => setForm({ ...form, intro: e.target.value })}
              placeholder="조용하게 책 읽기 좋은 동네 카페"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            대표 메뉴 (쉼표 구분)
            <input
              className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none focus:border-primary/60"
              value={menusInput}
              onChange={(e) => setMenusInput(e.target.value)}
              placeholder="아메리카노, 카페라떼, 바스크 치즈케이크"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            오늘/이번 주 이벤트
            <input
              className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none focus:border-primary/60"
              value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })}
              placeholder="2잔 이상 주문 시 1,000원 할인"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm text-slate-200">
          사진 설명(옵션)
          <input
            className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 outline-none focus:border-primary/60"
            value={form.photoDescription ?? ''}
            onChange={(e) => setForm({ ...form, photoDescription: e.target.value })}
            placeholder="예: 따뜻한 라떼와 창가 자리 사진"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
            <p className="text-sm font-semibold text-slate-100">Tone & Manner</p>
            <div className="mt-2 grid gap-2">
              {(Object.keys(toneLabels) as Tone[]).map((tone) => (
                <label key={tone} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="tone"
                    value={tone}
                    checked={form.tone === tone}
                    onChange={() => setForm({ ...form, tone })}
                  />
                  <span>{toneLabels[tone]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
            <p className="text-sm font-semibold text-slate-100">언제 쓸 글인가요?</p>
            <div className="mt-2 grid gap-2">
              {(Object.keys(timingOptions) as Timing[]).map((timing) => (
                <label key={timing} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="timing"
                    value={timing}
                    checked={form.timing === timing}
                    onChange={() => setForm({ ...form, timing })}
                  />
                  <span>{timingOptions[timing]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <p className="text-sm font-semibold text-slate-100">채널 선택</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            {(Object.keys(channelLabels) as Channel[]).map((channel) => (
              <label key={channel} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={channel}
                  checked={form.channels.includes(channel)}
                  onChange={() => toggleChannel(channel)}
                />
                <span>{channelLabels[channel]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="flex items-center justify-between gap-2 text-sm text-slate-200">
            <div>
              <p className="font-semibold">오늘 우리 동네 이슈 불러오기</p>
              <p className="text-xs text-slate-400">location + date로 간단 필터 후 프롬프트 컨텍스트</p>
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={form.useLocalContext}
                onChange={(e) => setForm({ ...form, useLocalContext: e.target.checked })}
              />
              <span>프롬프트에 사용</span>
            </label>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => refetchLocalContext()}
              className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20 sm:w-auto"
              disabled={isContextLoading}
            >
              {isContextLoading ? '불러오는 중...' : '오늘 이슈 확인'}
            </button>
            <p className="text-xs text-slate-300">{localContext || '지역 컨텍스트를 불러와 프롬프트에 추가'}</p>
          </div>
        </div>

        {error ? <p className="text-sm text-amber-300">생성 중 오류가 발생했지만 목업 데이터로 대체합니다.</p> : null}

        <button
          type="submit"
          disabled={formIsDisabled}
          className="w-full rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:shadow-[0_10px_40px_rgba(31,182,255,0.35)] disabled:cursor-not-allowed disabled:bg-white/30"
        >
          {isPending ? 'AI가 글을 작성 중...' : 'AI에게 맡기기'}
        </button>
      </form>
    </section>
  );
};

export default PromotionForm;
