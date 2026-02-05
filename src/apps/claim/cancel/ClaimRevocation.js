import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ClaimRevocationSlide from "../../claim/cancel/ClaimRevacationSlide";
import styles from "../../../css/claim/claimRevocation.module.css";
import ClaimSubHeaders from "../../claim/components/ClaimSubHeaders";
import ErrorModal from "../../../components/modals/ErrorModal";
import { fetchData } from "../../../data/ClaimUtilsApi";

function ClaimRevocation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedIn = useSelector((state) => state.auth.isAuthenticated);
  const contractData = useSelector((state) => state.insurance.insurances);
  const [tokenData, setTokenData] = useState(contractData);
  const [filterData, setFilterData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [redirectPath, setRedirectPath] = useState("");
  // 로딩 상태 추가
  const [isLoading, setIsLoading] = useState(false);

  // contractData 변경 감지하여 tokenData 업데이트
  useEffect(() => {
    // Redux 스토어의 contractData가 변경될 때마다 tokenData 업데이트
    setTokenData(contractData);
  }, [contractData]);

  // 로그인 확인 및 데이터 로딩 useEffect
  useEffect(() => {
    // 로그인 상태 확인
    if (!loggedIn) {
      setErrorMessage("로그인 후 이용해주세요.");
      setRedirectPath(
        `/login?redirect=${encodeURIComponent("/claimRevocation")}`
      );
      setShowModal(true);
      return;
    }

    // 페이지 로드 시 항상 데이터 새로 가져오기
    setIsLoading(true);

    // 비동기 작업 처리
    const loadData = async () => {
      try {
        await fetchData(dispatch);

        // fetchData 호출 후 Redux 스토어가 업데이트되면
        // 위의 contractData useEffect가 자동으로 실행됨
      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loggedIn, dispatch]); // 의존성 배열에 loggedIn과 dispatch 포함

  // filterData 변경 감지 useEffect
  useEffect(() => {
    // 데이터 로딩이 완료되고, filterData가 비어있을 때만 모달 표시
    if (
      !isLoading &&
      tokenData.length > 0 &&
      (!filterData || filterData.length === 0)
    ) {
      setErrorMessage("취소할 보험계약이 없어요.");
      setRedirectPath("/");
      setShowModal(true);
    }
  }, [filterData, isLoading, tokenData]);

  const handleModalClose = () => {
    setShowModal(false);
    navigate(redirectPath);
  };

  return (
    <>
      {!showModal ? (
        <div className={styles.Wrapper}>
          <ClaimSubHeaders titleText="보험 가입 취소" />
          <section className={styles.section}>
            <h3 className={styles.title}>
              취소할 가입내역을
              <br />
              선택해주세요.
            </h3>
            <span
              className={styles.moreBtn}
              onClick={() => navigate("/claimRevocationAll")}
            >
              전체보기
            </span>
            <ClaimRevocationSlide
              tokenData={tokenData}
              setFilterData={setFilterData}
            />
            <div className={styles.noticeContents}>
              <ul>
                <li>
                  <span>・</span>
                  <p>
                    여행보험 중 개시전 취소/청약철회를 하실 계약을 선택해 주시기
                    바랍니다. 증권번호를 클릭하시면 개시전 취소/청약철회를
                    신청하실 수 있습니다.
                  </p>
                </li>
                <li>
                  <div className={styles.secondTextFlexbox}>
                    <div>
                      <p>・</p>
                      <p>보험료 환급안내</p>
                    </div>
                    <p className={styles.texts}>
                      보험기간이 시작되지 않은 보험계약 또는 청약일로부터 30일
                      이내의 계약만 가능하며, 보험료를 전액 환급해 드립니다
                    </p>
                  </div>
                  <span>
                    단, 아래의 경우에 해당하면 여행보험 개시전 취소/청약철회를
                    할 수 없습니다.
                  </span>
                </li>
                <li>
                  <p>[철회]</p>
                  <p>1. 청약일로부터 30일 이상 경과한 계약</p>
                  <p>2. 회사지원 진단계약</p>
                </li>
              </ul>
            </div>
          </section>
        </div>
      ) : (
        <ErrorModal message={errorMessage} onClose={handleModalClose} />
      )}
    </>
  );
}

export default ClaimRevocation;
