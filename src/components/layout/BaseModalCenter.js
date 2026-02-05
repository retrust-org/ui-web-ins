import React, { useState, useEffect } from "react";
import styles from "../../css/disasterSafeguard/baseModalCenter.module.css";

function BaseModalCenter({ isOpen, onClose, children }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.baseModalOverlay} ${
        isAnimating ? styles.show : styles.hide
      }`}
    >
      <div
        className={`${styles.baseModalContent} ${
          isAnimating ? styles.show : styles.hide
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default BaseModalCenter;
