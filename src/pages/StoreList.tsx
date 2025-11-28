import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from '../types/store';

const StoreList = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    // 로컬 스토리지에서 가게 리스트 불러오기
    const savedStores = localStorage.getItem('stores');
    if (savedStores) {
      setStores(JSON.parse(savedStores));
    }
  }, []);

  const handleAddStore = () => {
    navigate('/form');
  };

  const handleStoreClick = (storeId: string) => {
    navigate(`/result/${storeId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">등록된 가게</h1>
              <p className="mt-2 text-sm text-gray-600">홍보 문구를 생성할 가게를 선택하거나 새로 등록하세요.</p>
            </div>
            <button
              onClick={handleAddStore}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-kakao-dark"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              가게 등록
            </button>
          </div>

          {stores.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">등록된 가게가 없습니다</h3>
              <p className="mt-2 text-sm text-gray-500">새 가게를 등록하여 홍보 문구를 생성해보세요.</p>
              <button
                onClick={handleAddStore}
                className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-kakao-dark"
              >
                가게 등록하기
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => handleStoreClick(store.id)}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{store.storeName}</h3>
                      <p className="mt-1 text-sm text-gray-500">{store.category}</p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-primary">
                      {store.location}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{store.intro}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span>등록일: {new Date(store.createdAt).toLocaleDateString('ko-KR')}</span>
                    {store.lastPromotionAt && (
                      <span>마지막 생성: {new Date(store.lastPromotionAt).toLocaleDateString('ko-KR')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StoreList;

