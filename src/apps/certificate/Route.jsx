// CertificateRouter.js
import { Routes, Route } from "react-router-dom";
import CertificatePage from "./index";
import NotFoundPage from "../../components/NotFoundPage";
import PdfViewerPage from "./PdfViewerPage";

function CertificateRouter() {
  return (
    <Routes>
      {/* 기본 경로 */}
      <Route path="/" element={<CertificatePage />} />

      {/* group_no 파라미터를 받는 경로 */}
      <Route path="/:group_no" element={<CertificatePage />} />

      {/* PDF 뷰어 경로 - 중첩 라우팅 */}
      <Route path="/:group_no/view" element={<PdfViewerPage />} />

      {/* 와일드카드 경로 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default CertificateRouter;
