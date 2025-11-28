const Header = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">부산 로컬 특화</p>
          <h1 className="text-2xl font-semibold">AI 마케팅 매니저</h1>
          <p className="text-sm text-slate-300">사진 없이도, 사장님 대신 글 써주는 부울경 전용 도구</p>
        </div>
        <div className="hidden text-right text-xs text-slate-400 sm:block">
          <p>React + Vite + TS + Tailwind</p>
          <p>Upstage Solar · 부산 데이터 컨텍스트</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
