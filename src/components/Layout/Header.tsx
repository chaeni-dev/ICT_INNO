import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-primary hover:text-kakao-dark">
            AI 마케팅 매니저
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#" className="text-sm text-gray-700 hover:text-primary">서비스소개</a>
            <a href="#" className="text-sm text-gray-700 hover:text-primary">다운로드</a>
            <a href="#" className="text-sm text-gray-700 hover:text-primary">요금안내</a>
            <a href="#" className="text-sm text-gray-700 hover:text-primary">새소식</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-kakao-dark">
            도입문의
          </button>
          <button className="hidden rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:block">
            관리자
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
