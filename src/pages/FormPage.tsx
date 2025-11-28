import { useNavigate } from 'react-router-dom';
import PromotionForm from '../components/Form/PromotionForm';
import { PromotionResponse } from '../types/promotion';
import { Store } from '../types/store';

const FormPage = () => {
  const navigate = useNavigate();

  const handleCompleted = (data: PromotionResponse, formData: any) => {
    // 가게 정보를 로컬 스토리지에 저장
    const store: Store = {
      id: Date.now().toString(),
      storeName: formData.storeName,
      category: formData.category,
      location: formData.location,
      intro: formData.intro,
      createdAt: new Date().toISOString(),
      lastPromotionAt: new Date().toISOString()
    };

    // 기존 가게 리스트 불러오기
    const existingStores = localStorage.getItem('stores');
    const stores: Store[] = existingStores ? JSON.parse(existingStores) : [];
    
    // 같은 이름의 가게가 있으면 업데이트, 없으면 추가
    const existingIndex = stores.findIndex(s => s.storeName === store.storeName && s.location === store.location);
    if (existingIndex >= 0) {
      stores[existingIndex] = { ...stores[existingIndex], lastPromotionAt: store.lastPromotionAt };
      store.id = stores[existingIndex].id;
    } else {
      stores.push(store);
    }
    
    localStorage.setItem('stores', JSON.stringify(stores));

    // 결과 데이터를 로컬 스토리지에 저장
    localStorage.setItem(`promotion_${store.id}`, JSON.stringify(data));
    
    // 폼 데이터도 저장 (AI 비서에서 사용)
    localStorage.setItem(`formData_${store.id}`, JSON.stringify(formData));

    // 결과 페이지로 이동
    navigate(`/result/${store.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <PromotionForm onCompleted={handleCompleted} />
        </div>
      </main>
    </div>
  );
};

export default FormPage;

