// ClaimPolicy.jsx
import { useState, useEffect } from "react";
import styles from "../../../css/claim/claimPolicy.module.css";
import downloadIcon from "../../../assets/downloadIcon.svg";
import ClaimHeader from "../components/ClaimHeader";

function ClaimPolicy() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleClick = (index) => {
    setActiveIndex(index);
  };

  // API 데이터 페치
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const response = await fetch('/trip-api/api/v3/trip/master-policies');
        const data = await response.json();

        if (data.errCd === "00001" && data.data.masterPolicies) {
          setPolicies(data.data.masterPolicies);
        } else {
          setError("약관 데이터를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("네트워크 오류가 발생했습니다.");
        console.error("Policy fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  // 보험 종류별로 그룹화
  const groupedPolicies = policies.reduce((acc, policy) => {
    const productType = policy.Product.product_type;
    const productName = policy.Product.product_nm;

    if (!acc[productType]) {
      acc[productType] = {
        name: productName,
        policies: []
      };
    }
    acc[productType].policies.push(policy);
    return acc;
  }, {});

  const menuItems = Object.keys(groupedPolicies).map(key => groupedPolicies[key].name);
  const productTypes = Object.keys(groupedPolicies);

  // 다운로드 함수
  const handleDownload = (url) => {
    if (!url) {
      alert("다운로드할 수 있는 파일이 없습니다.");
      return;
    }

    // URL을 그대로 새 창에서 열어서 다운로드
    window.open(url, '_blank');
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.');
  };

  if (loading) {
    return (
      <>
        <ClaimHeader titleText="보험약관" />
        <div className={styles.pageContainer}>
          <div className={styles.loadingContainer}>
            <p>약관 정보를 불러오는 중...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ClaimHeader titleText="보험약관" />
        <div className={styles.pageContainer}>
          <div className={styles.errorContainer}>
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ClaimHeader titleText="보험약관" />
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.description}>
            <p>증권의 유효기간에 따라 해당하는 보험약관을 다운로드할 수 있습니다.</p>
          </div>

          <div className={styles.policyFilterBtn}>
            <ul>
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleClick(index)}
                  className={activeIndex === index ? styles.active : ""}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.policyList}>
            {productTypes.map((productType, typeIndex) =>
              typeIndex === activeIndex && (
                <ul key={typeIndex}>
                  {groupedPolicies[productType].policies.map((policy, policyIndex) => (
                    <li key={policyIndex} className={styles.policyItem}>
                      <div className={styles.policyHeader}>
                        <div className={styles.policyInfo}>
                          <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>증권번호 :</span>
                            <span className={styles.infoValue}>{policy.policy_no}</span>
                          </div>
                          <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>판매기간 :</span>
                            <span className={styles.infoValue}>
                              {formatDate(policy.effective_from)} ~ {formatDate(policy.effective_to)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.downloadSection}>
                        <button
                          className={styles.downloadBtn}
                          onClick={() => handleDownload(policy.terms_url)}
                          disabled={!policy.terms_url}
                        >
                          <img src={downloadIcon} alt="download" />
                          <span>약관</span>
                        </button>

                        <button
                          className={styles.downloadBtn}
                          onClick={() => handleDownload(policy.product_guide_url)}
                          disabled={!policy.product_guide_url}
                        >
                          <img src={downloadIcon} alt="download" />
                          <span>설명서</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>

          <div className={styles.compensationSection}>
            <h3 className={styles.compensationSectionTitle}>보험금 청구전 보상관련 사전 문의</h3>
            <div className={styles.compensationGrid}>
              <div className={styles.compensationCard}>
                <h4 className={styles.compensationCardTitle}>휴대품 및 기타특약 손해</h4>
                <div className={styles.compensationSubItems}>
                  <div>항공기 및 수하물지연, 여권분실 후 재발급비용, 중단사고 발생 추가비용</div>
                </div>
                <div className={styles.compensationContact}>02-6941-0478</div>
              </div>

              <div className={styles.compensationCard}>
                <h4 className={styles.compensationCardTitle}>배상책임</h4>
                <div className={styles.compensationContact}>02-6941-0446</div>
              </div>

              <div className={styles.compensationCard}>
                <h4 className={styles.compensationCardTitle}>사망/후유장해</h4>
                <div className={styles.compensationContact}>02-6464-3806</div>
              </div>

              <div className={styles.compensationCard}>
                <h4 className={styles.compensationCardTitle}>실손 등 인보험관련 소액건</h4>
                <div className={styles.compensationSubItems}>
                  <div>실손의료비, 여행중 중대사고 구조송환비용, 식중독입원일당, 특정전염병치료비 등</div>
                </div>
                <div className={styles.compensationContact}>02-2039-2830</div>
                <div className={styles.compensationContact}>02-6956-6213</div>
                <div className={styles.compensationContact}>02-6941-0539</div>
                <div className={styles.compensationContact}>02-6941-0517</div>
              </div>
            </div>

            <div className={styles.generalInquirySection}>
              <h4 className={styles.generalInquiryTitle}>보험가입여부 안내, 보험 변경(취소,변경)</h4>
              <div className={styles.generalInquiryContact}>고객콜센터 1566-3305</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ClaimPolicy;