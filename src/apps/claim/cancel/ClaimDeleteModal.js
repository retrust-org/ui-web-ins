import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "../../../css/claim/ClaimDeleteModal.module.css";
import commonX from "../../../assets/commonX.svg";
import ErrorModal from "../../../components/modals/ErrorModal";
import Loading from "../../../components/loadings/Loading";
import { fetchData } from "../../../data/ClaimUtilsApi";
import ClaimButton from "../../../components/buttons/ClaimButton";
import SuccessModal from "../../../components/modals/SuccessModal";

function ClaimDeleteModal({ isOpen, onClose, selectedItem }) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState("취소 사유를 선택해주세요.");
  const [errorMsg, setErrorMsg] = useState("");
  const [subMsg, setSubMsg] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Define modifyData with keys and values
  const modifyData = {
    ModifyPlan: "여행 일정 혹은 여행지 변경",
    ModifyMembers: "인원 변경",
    PersonalReason: "개인적 사정",
  };

  const resetState = () => {
    setSelected("취소 사유를 선택해주세요.");
  };

  const toggleAction = () => {
    setToggle(!toggle);
  };

  if (!isOpen || !selectedItem) return null;

  const contractId = selectedItem?.Contract?.id;

  const handleCancelInsurance = async () => {


    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/v3/pay/contract/${contractId}?cancel_message=${selected}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          redirect: "follow",
        }
      );

      if (!response.ok) {
        // API 응답 에러
        const apiError = new Error(
          `네트워크 응답 오류: ${response.statusText}`
        );
     
        throw apiError;
      }

      const result = await response.json();

      if (result.success === false) {
        // 비즈니스 로직 에러
        const businessError = new Error("보험 취소 처리 실패");
        console.error("보험 취소 처리 실패:", businessError);

        setShowErrorModal(true);
        setErrorMsg(result?.data?.errMsg || "알 수 없는 오류가 발생했습니다.");
        setSubMsg(result?.data?.insurance_start_date ? result?.data?.msg : "");
        return;
      }

      // 성공 처리
      setShowSuccessModal(true);
      setTimeout(() => {
        handleSuccessClose();
        setShowSuccessModal(false);
        fetchData(dispatch);
      }, 3000);
    } catch (error) {
      console.error("서비스 오류:", error);


      setShowErrorModal(true);
      setErrorMsg(
        "서비스에 문제가 발생했습니다. 고객센터로 문의 부탁드립니다."
      );
      setSubMsg("불편을 드려 죄송합니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate("/claimRevocation");
  };

  const handleOptionSelect = (key) => {
    setSelected(key);
    setToggle(false);
  };

  const resetClose = () => {
    resetState();
    onClose(); // Call the passed onClose function
  };

  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalWrap}>
            <div className={styles.modalTitle}>
              <h3>사유를 선택해주세요.</h3>
              <img src={commonX} alt="닫기" onClick={resetClose} />
            </div>
            <div className={styles.optionContents}>
              <div
                className={!toggle ? styles.options : styles.optionsActive}
                onClick={toggleAction}
              >
                <div>{modifyData[selected] || selected}</div>
                <ul>
                  {toggle &&
                    Object.keys(modifyData).map((key) => (
                      <li
                        key={key}
                        className={styles.optionItem}
                        onClick={() => handleOptionSelect(key)}
                      >
                        {modifyData[key]}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
            <div className={styles.modalTextBox}>
              <div className={styles.modalTextBoxWrap}>
                <ul>
                  <h3>확인사항</h3>
                  <li>
                    <span>·</span>
                    <p>
                      여행보험 취소 시, 승인 취소는 다소 지연될 수 있습니다.
                    </p>
                  </li>
                  <li>
                    <span>·</span>
                    <p>
                      단체보험 특성상 선택한 해당 보험은 일괄 취소되오니
                      유의바랍니다.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            <ClaimButton
              buttonText="보험가입 취소하기"
              onClick={handleCancelInsurance}
              disabled={selected === "취소 사유를 선택해주세요."}
            />
          </div>
        </div>
      </div>
      {loading && <Loading />}
      {showSuccessModal && (
        <SuccessModal onClose={handleSuccessClose} message="보험 취소가" />
      )}
      {showErrorModal && (
        <ErrorModal
          message={errorMsg}
          subMsg={subMsg}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </>
  );
}

export default ClaimDeleteModal;

// 취소 데이터 추출 및 dataLayer 푸시
// if (
//   result?.data &&
//   result?.data?.contract_canceled &&
//   result?.data?.contract_canceled?.cancelDatas
// ) {
//   const cancelData =
//     result?.data?.contract_canceled?.cancelDatas[0] || [];
//   if (cancelData) {
//     const { tid, amt } = cancelData;

//     window.dataLayer = window.dataLayer || [];
//     window.dataLayer.push({ purchaseCancel: null });
//     window.dataLayer.push({
//       event: "purchase_cancel",
//       purchaseCancel: {
//         transaction_id: tid,
//         value: parseInt(amt, 10),
//         currency: "KRW",
//       },
//     });

//     console.log("dataLayer 푸시 성공!", window.dataLayer);
//   }
// }
