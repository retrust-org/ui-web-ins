// src/hooks/useAgreeTermsModal.js
import { useState, useEffect } from "react";

export const useAgreeTermsModal = () => {
  const [showModal, setShowModal] = useState(() => {
    const storedModalState = sessionStorage.getItem("agreeTermsModalState");
    return storedModalState ? JSON.parse(storedModalState).isModalOpen : false;
  });

  useEffect(() => {
    const existingState = sessionStorage.getItem("agreeTermsModalState");
    const currentState = existingState ? JSON.parse(existingState) : {};

    sessionStorage.setItem(
      "agreeTermsModalState",
      JSON.stringify({
        ...currentState,
        isModalOpen: showModal,
      })
    );
  }, [showModal]);

  const handleInitializeModal = () => {
    sessionStorage.setItem(
      "agreeTermsModalState",
      JSON.stringify({
        agrees: [false, false, false, false, false],
        isAllAgreed: false,
        isModalOpen: true,
        showTooltip: false,
      })
    );
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    sessionStorage.removeItem("agreeTermsModalState");
  };

  return {
    showModal,
    handleInitializeModal,
    handleCloseModal,
  };
};
