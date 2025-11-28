import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useGeneratePromotion, useLocalContext } from '../../hooks/useGeneratePromotion';
import {
  Channel,
  PromotionRequest,
  PromotionResponse,
  Tone,
  Timing,
  TargetAudience,
  PromotionPurpose
} from '../../types/promotion';

interface PromotionFormProps {
  onCompleted?: (data: PromotionResponse, formData: PromotionRequest) => void;
}

const initialForm: PromotionRequest = {
  storeName: '',
  category: '',
  location: '',
  intro: '',
  menus: [],
  event: '',
  tone: 'busan-dialect',
  timing: 'weekend',
  channels: ['instagram_feed', 'instagram_story'],
  useLocalContext: true,
  photoDescription: '',
  targetAudience: 'all',
  promotionPurpose: 'regular',
  priceRange: '',
  operatingHours: '',
  specialRequest: ''
};

const channelLabels: Record<Channel, string> = {
  instagram_feed: '인스타그램 피드',
  instagram_story: '인스타그램 스토리',
  map_review: '네이버/구글 지도 리뷰',
  sms: '문자/알림톡',
  facebook: '페이스북',
  blog: '블로그',
  'kakao-channel': '카카오톡 채널'
};

const channelDescriptions: Record<Channel, string> = {
  instagram_feed: '인스타그램 메인 피드에 게시되는 게시물',
  instagram_story: '인스타그램 스토리 (24시간 임시 게시물)',
  map_review: '네이버 지도, 구글 맵 등에 작성하는 리뷰',
  sms: '고객에게 발송하는 문자 메시지 또는 알림톡',
  facebook: '페이스북 페이지 게시물',
  blog: '네이버 블로그, 브런치 등 블로그 포스팅',
  'kakao-channel': '카카오톡 채널 메시지'
};

const toneLabels: Record<Tone, string> = {
  'seoul-instagram': '세련된 인스타 감성',
  'busan-dialect': '친근한 부산 사투리',
  friendly: '친근하고 따뜻한 톤',
  professional: '전문적이고 신뢰감 있는 톤',
  humorous: '유머러스하고 재미있는 톤',
  emotional: '감성적이고 공감대 형성 톤'
};

const toneDescriptions: Record<Tone, string> = {
  'seoul-instagram': '트렌디하고 세련된 표현, 젊은 층에게 어필',
  'busan-dialect': '부산 지역 특색을 살린 친근한 사투리 표현',
  friendly: '가족 같은 친근함, 편안한 느낌',
  professional: '신뢰감 있는 전문적인 표현, 비즈니스 고객 대상',
  humorous: '재미있고 유쾌한 표현, 기억에 남는 문구',
  emotional: '감정을 자극하는 따뜻하고 공감대 형성 문구'
};

const timingOptions: Record<Timing, string> = {
  today: '오늘 바로',
  weekend: '이번 주말',
  weekday: '평일',
  evening: '저녁 시간대',
  lunch: '점심 시간대',
  payday: '급여일 전후',
  festival: '지역 축제 기간',
  'specific-date': '특정 날짜'
};

const timingDescriptions: Record<Timing, string> = {
  today: '오늘 바로 홍보하고 싶을 때',
  weekend: '주말을 타겟으로 하는 홍보',
  weekday: '평일을 타겟으로 하는 홍보',
  evening: '저녁 시간대 고객 유치',
  lunch: '점심 시간대 고객 유치',
  payday: '급여일 전후 소비 심리 활용',
  festival: '지역 축제나 행사 기간 홍보',
  'specific-date': '특정 날짜나 기간 홍보'
};

const targetAudienceLabels: Record<TargetAudience, string> = {
  all: '전체 고객',
  young: '20-30대 젊은 층',
  family: '가족 단위 고객',
  'office-worker': '직장인',
  student: '학생',
  elderly: '중장년층'
};

const promotionPurposeLabels: Record<PromotionPurpose, string> = {
  'new-opening': '신규 오픈 홍보',
  event: '이벤트/할인 홍보',
  regular: '정기적인 홍보',
  seasonal: '계절/시즌 홍보',
  emergency: '긴급/특별 공지'
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
      onCompleted?.(data, form);
    }
  });

  useEffect(() => {
    if (localContextData?.contextSummary) {
      setLocalContext(localContextData.contextSummary);
    }
  }, [localContextData]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // 필수 필드 검증
    if (!form.storeName || !form.category || !form.location || !form.intro || !form.event || !menusInput.trim()) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (form.channels.length === 0) {
      alert('홍보 채널을 최소 1개 이상 선택해주세요.');
      return;
    }

    const menus = menusInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (menus.length === 0) {
      alert('대표 메뉴를 입력해주세요.');
      return;
    }

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
    <section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">AI 마케팅 매니저로 홍보 문구를 생성해보세요</h2>
        <p className="text-sm text-gray-600">
          사용 방법과 기능에 대한 문의는 도움말 또는 고객센터에서 확인하실 수 있으며, 도입/계약 관련 문의는 아래 양식을 작성해주세요.
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">가게 정보</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">
                업종 <span className="text-red-500">*</span>
              </span>
              <input
                required
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="예: 카페, 식당, 미용실, 병원 등"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">
                가게 이름 <span className="text-red-500">*</span>
              </span>
              <input
                required
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                placeholder="가게 이름을 입력해주세요."
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">
                위치(동/상권) <span className="text-red-500">*</span>
              </span>
              <input
                required
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="예: 남포동, 광안리, 해운대, 서면 등"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">
                가게 한 줄 소개 <span className="text-red-500">*</span>
              </span>
              <input
                required
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
                value={form.intro}
                onChange={(e) => setForm({ ...form, intro: e.target.value })}
                placeholder="예: 조용하게 책 읽기 좋은 동네 카페, 신선한 재료로 만든 일식당"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">
                대표 메뉴 (쉼표 구분) <span className="text-red-500">*</span>
              </span>
              <input
                required
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
                value={menusInput}
                onChange={(e) => setMenusInput(e.target.value)}
                placeholder="예: 아메리카노, 카페라떼, 바스크 치즈케이크"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">
                오늘/이번 주 이벤트 <span className="text-red-500">*</span>
              </span>
              <input
                required
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
                value={form.event}
                onChange={(e) => setForm({ ...form, event: e.target.value })}
                placeholder="예: 오늘 아메리카노 2잔 이상 주문 시 1,000원 할인"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">
                가격대 <span className="text-gray-400">(선택)</span>
              </span>
              <input
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
                value={form.priceRange ?? ''}
                onChange={(e) => setForm({ ...form, priceRange: e.target.value })}
                placeholder="예: 1인당 1만원대, 메인 2-3만원"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">
                운영 시간 <span className="text-gray-400">(선택)</span>
              </span>
              <input
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
                value={form.operatingHours ?? ''}
                onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
                placeholder="예: 평일 10:00-22:00, 주말 09:00-23:00"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">사진 설명 (선택)</span>
            <input
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
              value={form.photoDescription ?? ''}
              onChange={(e) => setForm({ ...form, photoDescription: e.target.value })}
              placeholder="예: 따뜻한 라떼와 창가 자리 사진, 야경이 보이는 테라스"
            />
          </label>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">홍보 설정</h3>
          
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-sm font-semibold text-gray-900">홍보 목적</p>
            <p className="mb-3 text-xs text-gray-500">이번 홍보의 목적을 선택해주세요.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(Object.keys(promotionPurposeLabels) as PromotionPurpose[]).map((purpose) => (
                <label key={purpose} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="promotionPurpose"
                    value={purpose}
                    checked={form.promotionPurpose === purpose}
                    onChange={() => setForm({ ...form, promotionPurpose: purpose })}
                    className="text-primary"
                  />
                  <span>{promotionPurposeLabels[purpose]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">Tone & Manner</p>
              <p className="mb-3 text-xs text-gray-500">문구의 톤앤매너를 선택해주세요.</p>
              <div className="space-y-2">
                {(Object.keys(toneLabels) as Tone[]).map((tone) => (
                  <label key={tone} className="flex items-start gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="tone"
                      value={tone}
                      checked={form.tone === tone}
                      onChange={() => setForm({ ...form, tone })}
                      className="mt-0.5 text-primary"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{toneLabels[tone]}</span>
                      <p className="text-xs text-gray-500">{toneDescriptions[tone]}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">언제 쓸 글인가요?</p>
              <p className="mb-3 text-xs text-gray-500">홍보 시점을 선택해주세요.</p>
              <div className="space-y-2">
                {(Object.keys(timingOptions) as Timing[]).map((timing) => (
                  <label key={timing} className="flex items-start gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="timing"
                      value={timing}
                      checked={form.timing === timing}
                      onChange={() => setForm({ ...form, timing })}
                      className="mt-0.5 text-primary"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{timingOptions[timing]}</span>
                      <p className="text-xs text-gray-500">{timingDescriptions[timing]}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-sm font-semibold text-gray-900">타겟 고객층</p>
            <p className="mb-3 text-xs text-gray-500">주로 타겟으로 하는 고객층을 선택해주세요.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {(Object.keys(targetAudienceLabels) as TargetAudience[]).map((audience) => (
                <label key={audience} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="targetAudience"
                    value={audience}
                    checked={form.targetAudience === audience}
                    onChange={() => setForm({ ...form, targetAudience: audience })}
                    className="text-primary"
                  />
                  <span>{targetAudienceLabels[audience]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-sm font-semibold text-gray-900">홍보 채널 선택</p>
            <p className="mb-3 text-xs text-gray-500">홍보할 채널을 하나 이상 선택해주세요.</p>
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {(Object.keys(channelLabels) as Channel[]).map((channel) => (
                <label
                  key={channel}
                  className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3 transition hover:border-primary hover:bg-blue-50"
                >
                  <input
                    type="checkbox"
                    value={channel}
                    checked={form.channels.includes(channel)}
                    onChange={() => toggleChannel(channel)}
                    className="mt-0.5 text-primary"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{channelLabels[channel]}</span>
                    <p className="mt-0.5 text-xs text-gray-500">{channelDescriptions[channel]}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">오늘 우리 동네 이슈 불러오기</p>
                <p className="mt-1 text-xs text-gray-500">지역별 최신 이슈를 반영하여 더 효과적인 홍보 문구를 생성합니다.</p>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={form.useLocalContext}
                  onChange={(e) => setForm({ ...form, useLocalContext: e.target.checked })}
                  className="text-primary"
                />
                <span>프롬프트에 사용</span>
              </label>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => refetchLocalContext()}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
                disabled={isContextLoading}
              >
                {isContextLoading ? '불러오는 중...' : '오늘 이슈 확인'}
              </button>
              <p className="text-xs text-gray-500">
                {localContext || '지역 컨텍스트를 불러와 프롬프트에 추가하면 더 현실적이고 효과적인 문구가 생성됩니다.'}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-900">
                특별 요청사항 <span className="text-gray-400 font-normal">(선택)</span>
              </span>
              <p className="text-xs text-gray-500 mb-2">
                문구에 반영하고 싶은 특별한 요청사항이나 강조하고 싶은 내용이 있으면 작성해주세요.
              </p>
              <textarea
                className="min-h-[100px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400"
                value={form.specialRequest ?? ''}
                onChange={(e) => setForm({ ...form, specialRequest: e.target.value })}
                placeholder="예: 친환경 재료 사용 강조, 반려동물 동반 가능, 주차 공간 안내 등"
              />
            </label>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            생성 중 오류가 발생했지만 목업 데이터로 대체합니다.
          </div>
        ) : null}

        <div className="pt-4">
          <button
            type="submit"
            disabled={formIsDisabled}
            className="w-full rounded-lg bg-primary px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-kakao-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isPending ? 'AI가 글을 작성 중...' : '문의 등록하기'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default PromotionForm;
