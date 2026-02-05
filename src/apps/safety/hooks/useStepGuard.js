import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'disaster_step_validation';

// 단계 정의: order는 순서, redirect는 미완료 시 이동할 경로, message는 모달 메시지
const STEPS = {
  smallBusiness: { order: 1, redirect: '/', message: '유효하지 않은 접근입니다' },
  queryConsent: { order: 2, redirect: '/', message: '유효하지 않은 접근입니다' },
  exteriorWall: { order: 3, redirect: '/result', message: '외벽구조 정보를 먼저 입력해주세요' },
  autoInfo: { order: 4, redirect: '/result', message: '자동정보 확인이 필요합니다' },
  workplaceInfo: { order: 5, redirect: '/workPlaceinfo', message: '사업장 정보를 먼저 입력해주세요' },
  limitsAnnounce: { order: 6, redirect: '/limitAnnounce', message: '초과보험 안내를 먼저 확인해주세요' },
  consentAgreement: { order: 7, redirect: '/agreement', message: '동의 항목을 모두 체크해주세요' },
  personalConsent: { order: 8, redirect: '/personalInfoConsent', message: '개인정보 동의를 완료해주세요' },
  identity: { order: 9, redirect: '/signupChkConsent', message: '본인인증을 완료해주세요' },
  userInfo: { order: 10, redirect: '/userInfo', message: '사용자 정보를 먼저 입력해주세요' },
  confirm: { order: 11, redirect: '/confirm', message: '가입 정보를 먼저 확인해주세요' },
  document: { order: 12, redirect: '/document', message: '서류를 먼저 확인해주세요' }
};

// sessionStorage에서 완료된 단계 목록 가져오기
const getCompletedSteps = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// sessionStorage에 완료된 단계 목록 저장
const saveCompletedSteps = (steps) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
  } catch (error) {
    console.error('stepGuard 저장 오류:', error);
  }
};

export const useStepGuard = (requiredSteps = []) => {
  const navigate = useNavigate();
  const [modalState, setModalState] = useState({ isOpen: false, message: '', redirect: '' });

  // 페이지 진입 시 자동 검증
  useEffect(() => {
    if (requiredSteps.length === 0) return;

    const completed = getCompletedSteps();
    for (const stepName of requiredSteps) {
      if (!completed.includes(stepName)) {
        const step = STEPS[stepName];
        if (step) {
          setModalState({ isOpen: true, message: step.message, redirect: step.redirect });
          return;
        }
      }
    }
  }, []);

  // 모달 확인 후 리다이렉트
  const handleModalConfirm = useCallback(() => {
    setModalState(prev => {
      if (prev.redirect) {
        navigate(prev.redirect, { replace: true });
      }
      return { ...prev, isOpen: false };
    });
  }, [navigate]);

  // 단계 완료 표시
  const completeStep = useCallback((stepName) => {
    if (!STEPS[stepName]) return;

    const completed = getCompletedSteps();
    if (!completed.includes(stepName)) {
      completed.push(stepName);
      saveCompletedSteps(completed);
    }
  }, []);

  // 특정 단계 이후 모든 단계 초기화 (값 변경 시 사용)
  const resetFrom = useCallback((stepName) => {
    if (!STEPS[stepName]) return;

    const targetOrder = STEPS[stepName].order;
    const completed = getCompletedSteps();
    const filtered = completed.filter(name => {
      const step = STEPS[name];
      return step && step.order < targetOrder;
    });
    saveCompletedSteps(filtered);
  }, []);

  // 특정 단계가 완료되었는지 확인
  const isCompleted = useCallback((stepName) => {
    const completed = getCompletedSteps();
    return completed.includes(stepName);
  }, []);

  // 모든 단계 초기화
  const resetAll = useCallback(() => {
    saveCompletedSteps([]);
  }, []);

  return {
    completeStep,
    resetFrom,
    isCompleted,
    resetAll,
    modalState,
    handleModalConfirm
  };
};

export default useStepGuard;
