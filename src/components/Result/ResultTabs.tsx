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
    <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-xl shadow-primary/5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">AI 결과</p>
          <h2 className="text-xl font-semibold">채널별 문구</h2>
        </div>
        <span className="text-xs text-slate-400">인스타 / 스토리 / 지도 / 문자</span>
      </div>

      {data?.contextSummary ? (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          <p className="font-semibold text-primary">오늘의 로컬 컨텍스트</p>
          <p className="text-slate-100">{data.contextSummary}</p>
        </div>
      ) : (
        <p className="mb-4 text-sm text-slate-500">아직 생성되지 않았습니다. 오른쪽 폼을 채워 AI에게 맡겨보세요.</p>
      )}

      <div className="space-y-3">
        <ResultBlock title="인스타그램 피드" text={feed?.text} hashtags={feed?.hashtags} />
        <ResultBlock title="인스타그램 스토리" text={story?.text} />
        <ResultBlock title="지도 리뷰" text={map?.text} />
        <ResultBlock title="문자/알림톡" text={sms?.text} />
      </div>
    </section>
  );
};

export default ResultTabs;
