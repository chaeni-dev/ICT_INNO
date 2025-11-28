import logoImage from '@/assets/logo.png'; // '@'는 src 폴더를 가리킵니다.

const Header = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="AI 마케팅 매니저 로고" className="h-20 w-20 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dan_D</h1>
            <p className="text-sm text-gray-600">부산 소상공인을 위한 마케팅 도구</p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#" className="text-sm text-gray-700 hover:text-primary transition">홈</a>
          <a href="#" className="text-sm text-gray-700 hover:text-primary transition">서비스</a>
          <a href="#" className="text-sm text-gray-700 hover:text-primary transition">문의</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
