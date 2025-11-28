import { useState } from 'react';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import PromotionForm from './components/Form/PromotionForm';
import ResultTabs from './components/Result/ResultTabs';
import { PromotionResponse } from './types/promotion';

const App = () => {
  const [result, setResult] = useState<PromotionResponse | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PromotionForm onCompleted={setResult} />
          <ResultTabs data={result} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
