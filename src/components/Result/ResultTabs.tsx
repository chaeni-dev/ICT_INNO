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
    <section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">생성된 홍보 문구</h2>
        <p className="text-sm text-gray-600">채널별로 최적화된 문구가 생성되었습니다.</p>
      </div>

      {data?.contextSummary ? (
        <div className="mb-6 rounded-lg border border-primary/30 bg-blue-50 px-4 py-3 text-sm">
          <p className="mb-1 font-semibold text-primary">오늘의 로컬 컨텍스트</p>
          <p className="text-gray-700">{data.contextSummary}</p>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          아직 생성되지 않았습니다. 왼쪽 폼을 채워 AI에게 맡겨보세요.
        </div>
      )}

      <div className="space-y-4">
        <ResultBlock title="인스타그램 피드" text={feed?.text} hashtags={feed?.hashtags} />
        <ResultBlock title="인스타그램 스토리" text={story?.text} />
        <ResultBlock title="지도 리뷰" text={map?.text} />
        <ResultBlock title="문자/알림톡" text={sms?.text} />
      </div>
    </section>
  );
};

export default ResultTabs;
