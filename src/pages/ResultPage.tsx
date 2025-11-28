import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ResultTabs from '../components/Result/ResultTabs';
import { PromotionResponse } from '../types/promotion';
import { Store } from '../types/store';

const ResultPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<PromotionResponse | null>(null);
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    if (!storeId) return;

    // 가게 정보 불러오기
    const stores = localStorage.getItem('stores');
    if (stores) {
      const storeList: Store[] = JSON.parse(stores);
      const foundStore = storeList.find(s => s.id === storeId);
      setStore(foundStore || null);
    }

    // 결과 데이터 불러오기
    const savedResult = localStorage.getItem(`promotion_${storeId}`);
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    }
  }, [storeId]);

  const handleBackToList = () => {
    navigate('/');
  };

  const handleCreateNew = () => {
    navigate('/form');
  };

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-600">가게 정보를 찾을 수 없습니다.</p>
            <button
              onClick={handleBackToList}
              className="mt-4 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-kakao-dark"
            >
              목록으로 돌아가기
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <button
                onClick={handleBackToList}
                className="mb-2 flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                목록으로
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{store.storeName}</h1>
              <p className="mt-1 text-sm text-gray-600">
                {store.category} · {store.location}
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-kakao-dark"
            >
              새 문구 생성
            </button>
          </div>
          <ResultTabs data={result} />
        </div>
      </main>
    </div>
  );
};

export default ResultPage;

