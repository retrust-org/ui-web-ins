// ClaimAnnounce.js - Context 적용
import { useEffect } from "react";
import ClaimNoticeDoc from "./ClaimNoticeDoc";
import ClaimHeader from "../components/ClaimHeader";
import useClaimTableButton from "../../../hooks/useClaimTableButton";

function ClaimAnnounce() {
  const { setTableBtnPath, setContextBtnName } = useClaimTableButton();

  // 컴포넌트 마운트 시 테이블 버튼 경로 설정
  useEffect(() => {
    setTableBtnPath("/claimDocSend");
    setContextBtnName("필요서류 첨부하기");
  }, [setTableBtnPath, setContextBtnName]);

  return (
    <>
      <ClaimHeader titleText="청구필요 서류 안내" />
      <ClaimNoticeDoc />
    </>
  );
}

export default ClaimAnnounce;
