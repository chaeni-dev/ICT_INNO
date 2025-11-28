const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="text-lg font-bold text-gray-800">Dan_D</div>
        </div>
        <div className="mb-4 flex flex-wrap gap-6 text-sm text-gray-600">
          <a href="#" className="hover:text-primary">서비스소개</a>
          <a href="#" className="hover:text-primary">문의하기</a>
          <a href="#" className="hover:text-primary">이용약관</a>
          <a href="#" className="hover:text-primary">개인정보처리방침</a>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            <p>코드포부산 · 업스테이지 · 패스파인더</p>
            <p className="mt-1">© 2025 AI Marketing Manager. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
