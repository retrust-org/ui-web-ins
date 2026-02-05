import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react"; // useState 추가
import ClaimSubHeaders from "../components/ClaimSubHeaders";
import ClaimButton from "../../../components/buttons/ClaimButton";
import ClaimNoticeDoc from "./ClaimNoticeDoc";
import useClaimTableButton from "../../../hooks/useClaimTableButton";
import ReceiptTypeSelecte from "./ReceiptTypeSelecte";

function ClaimMemberIntro() {
  const { setTableBtnPath, setContextBtnName } = useClaimTableButton();
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리

  const handleClick = () => {
    setIsModalOpen(true); // 모달 열기
  };

  const closeModal = () => {
    setIsModalOpen(false); // 모달 닫기
  };

  useEffect(() => {
    setTableBtnPath(-1);
    setContextBtnName("다음으로");
  }, [setTableBtnPath, setContextBtnName]);

  return (
    <>
      <ClaimSubHeaders titleText="청구안내" />
      <ClaimNoticeDoc />
      <ClaimButton buttonText="확인" onClick={handleClick} />

      {/* 모달이 열려있을 때만 렌더링 */}
      {isModalOpen && <ReceiptTypeSelecte onClose={closeModal} />}
    </>
  );
}

export default ClaimMemberIntro;
