import logo from '@/data/logo.png';

const Header = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
        <img src={logo} alt="DAN.D 로고" className="h-10 w-10 rounded-xl shadow-sm" />
        <div className="ml-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">DAN.D</p>
          <h1 className="text-xl font-bold text-slate-900">부산 소상공인 AI 마케팅 매니저</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
