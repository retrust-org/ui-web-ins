// CertificatePage.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import styles from "../../css/certificate/index.module.css";

function CertificatePage() {
  const { group_no } = useParams();
  const navigate = useNavigate();
  const [birthDate, setBirthDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [userName, setUserName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // 생년월일 입력 핸들러
  const handleBirthDateChange = (e) => {
    // 숫자만 입력 허용
    const value = e.target.value.replace(/[^\d]/g, "");
    setBirthDate(value);
  };

  // 이름 입력 핸들러
  const handleUserNameChange = (e) => {
    setUserName(e.target.value);
  };

  // SHA256 해시 함수 (Base64 인코딩 유지)
  const hashValue = (value) => {
    return CryptoJS.SHA256(value).toString(CryptoJS.enc.Base64);
  };

  // PDF 앱으로 바로 열기
  const handleOpenPdfApp = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS) {
        // iOS에서는 location.href가 더 안정적
        window.location.href = url;
      } else {
        // Android는 window.open 사용
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          // 팝업이 차단된 경우 현재 창에서 열기
          window.location.href = url;
        }
      }

      // 메모리 정리 (약간의 지연 후)
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    }
  };

  // 증명서 요청 함수
  const requestCertificate = async (includeUserName = false) => {
    try {
      // 요청 데이터 준비
      const requestData = {
        birthDate: hashValue(birthDate) // 생년월일 해시 (Base64)
      };

      // 이름이 필요한 경우 해시된 이름 추가
      if (includeUserName && userName) {
        requestData.userName = hashValue(userName); // 이름도 해시 처리 (Base64)
      }

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/trip-api/api/v3/trip/certificate/${group_no}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData)
        }
      );

      // 응답이 PDF인 경우 (성공)
      if (response.headers.get('content-type')?.includes('application/pdf')) {
        const blob = await response.blob();
        if (!blob || blob.size === 0) {
          throw new Error("서버에서 PDF 데이터를 받지 못했습니다.");
        }

        // 파일명 처리
        let fileName = '보험증명서.pdf'; // 기본값
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const matches = contentDisposition.match(/filename="([^"]+)"/i);
          if (matches && matches[1]) {
            fileName = decodeURIComponent(matches[1]);
          }
        }

        // 파일 크기 로그
        console.log(`PDF 크기: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);

        setPdfBlob(blob);
        setIsSuccess(true);

        // 모달 닫기 및 초기화
        setShowNameModal(false);
        setUserName('');

        // PDF 발급 성공 - 모바일/데스크톱 구분하여 처리
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent || window.opera
        );

        if (!isMobileDevice) {
          // PC에서는 PDF 뷰어 페이지로 이동
          navigate(`/${group_no}/view`, {
            state: { pdfBlob: blob, fileName }
          });
        }
        return;
      }

      // JSON 응답 처리
      const data = await response.json();

      // 이름 입력이 필요한 경우
      if (data.requiresNameInput) {
        setModalMessage(data.message);
        setShowNameModal(true);
        return;
      }

      // 오류 처리
      if (!data.success) {
        throw new Error(data.message || '증명서 발급에 실패했습니다.');
      }

    } catch (error) {
      console.error('증명서 발급 오류:', error);
      throw error;
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      // 생년월일 형식 검증 (YYYYMMDD)
      if (!/^\d{8}$/.test(birthDate)) {
        throw new Error("생년월일을 YYYYMMDD 형식으로 입력해주세요.");
      }

      await requestCertificate(false); // 처음엔 생년월일만 전송
    } catch (err) {
      setError(err.message);
      console.error("PDF 발급 오류:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 이름 포함 재요청 핸들러
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('피보험자 이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await requestCertificate(true); // 이름 포함해서 재요청
    } catch (err) {
      setError(err.message);
      console.error("PDF 발급 오류:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.certificateContainer}>
      <h1>보험 가입증명서 발급</h1>
      <p>본인 확인을 위해 생년월일을 입력해주세요.</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="birthDate">생년월일 (YYYYMMDD)</label>
          <input
            type="text"
            id="birthDate"
            value={birthDate}
            onChange={handleBirthDateChange}
            placeholder="예: 19900101"
            maxLength={8}
            required
          />
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <span>오류:</span> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={styles.submitButton}
        >
          {isLoading ? "처리 중..." : "증명서 발급하기"}
        </button>
      </form>

      {isSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>증명서가 발급되었습니다</h2>
            <div className={styles.pdfActions}>
              <button
                onClick={handleOpenPdfApp}
                className={styles.viewButton}
              >
                증명서 보기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이름 입력 모달 */}
      {showNameModal && (
        <div className={styles.nameModalOverlay}>
          <div className={styles.nameModalContent}>
            <h3>추가 정보 필요</h3>
            <p>{modalMessage}</p>
            <form onSubmit={handleNameSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="userName">피보험자 이름</label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={handleUserNameChange}
                  placeholder="이름을 입력하세요"
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              {error && (
                <div className={styles.errorMessage}>
                  <span>오류:</span> {error}
                </div>
              )}
              <div className={styles.nameModalButtons}>
                <button
                  type="submit"
                  className={styles.confirmButton}
                  disabled={isLoading}
                >
                  {isLoading ? "처리 중..." : "확인"}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowNameModal(false);
                    setUserName('');
                    setError(null);
                  }}
                  disabled={isLoading}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificatePage;
