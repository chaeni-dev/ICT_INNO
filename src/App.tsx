import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import StoreList from './pages/StoreList';
import FormPage from './pages/FormPage';
import ResultPage from './pages/ResultPage';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<StoreList />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/result/:storeId" element={<ResultPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
