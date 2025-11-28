import ResultBlock from './ResultBlock';
import { PromotionResponse } from '../../types/promotion';

interface ResultTabsProps {
  data: PromotionResponse | null;
}

const ResultTabs = ({ data }: ResultTabsProps) => {
  const feed = data?.results.instagram_feed;
  const story = data?.results.instagram_story;
  const map = data?.results.map_review;
  const sms = data?.results.sms;

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-blue-100/60">
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-500">AI 결과</p>
        <h2 className="text-xl font-semibold text-slate-900">채널별 문구</h2>
      </div>

      {data?.contextSummary ? (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <p className="font-semibold text-blue-700">오늘의 컨텍스트</p>
          <p className="text-slate-800">{data.contextSummary}</p>
        </div>
      ) : null}

      <div className="space-y-3">
        <ResultBlock title="인스타그램 피드" text={feed?.text} />
        <ResultBlock title="인스타그램 스토리" text={story?.text} />
        <ResultBlock title="지도 리뷰" text={map?.text} />
        <ResultBlock title="문자/알림톡" text={sms?.text} />
      </div>
    </section>
  );
};

export default ResultTabs;
