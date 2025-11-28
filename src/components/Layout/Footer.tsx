const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="text-lg font-bold text-gray-800">AI 마케팅 매니저</div>
        </div>
        <div className="mb-4 flex flex-wrap gap-6 text-sm text-gray-600">
          <a href="#" className="hover:text-primary">회사소개</a>
          <a href="#" className="hover:text-primary">언론보도</a>
          <a href="#" className="hover:text-primary">기술문서</a>
          <a href="#" className="hover:text-primary">파트너</a>
          <a href="#" className="hover:text-primary">고객센터</a>
        </div>
        <div className="mb-4 flex flex-wrap gap-6 text-xs text-gray-500">
          <a href="#" className="hover:text-gray-700">개인정보처리방침</a>
          <a href="#" className="hover:text-gray-700">위치기반서비스이용약관</a>
          <a href="#" className="hover:text-gray-700">운영정책</a>
          <a href="#" className="hover:text-gray-700">서비스이용약관</a>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            <p>코드포부산 · 업스테이지 · 패스파인더</p>
            <p className="mt-1">© 2024 AI Marketing Manager. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-600">관련사이트</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
