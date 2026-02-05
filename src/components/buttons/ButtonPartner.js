import React from "react";
import styles from "../../css/common/button.module.css";
import { web2app } from "../../utils/web2app";
import { usePartner } from "../../hooks/usePartner";

function ButtonPartner() {
  const { isB2B, partnerConfig } = usePartner();

  // 파트너 정보 확인만 수행 (appType 검사 제거)
  if (!isB2B || !partnerConfig) return null;

  const handleClick = () => {
    if (partnerConfig.app_link && partnerConfig.app_scheme) {
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const scheme = partnerConfig.app_scheme;
      const pkgName = partnerConfig.android_package_name;

      web2app({
        urlScheme: partnerConfig.app_link,
        intentURI: pkgName
          ? `intent://main#Intent;scheme=${scheme};package=${pkgName};end;`
          : null,
        storeURL: isIOS
          ? partnerConfig.ios_store_url || partnerConfig.website
          : partnerConfig.android_store_url || partnerConfig.website,
        appName: partnerConfig.name,
        onUnsupportedEnvironment: () => {
          window.location.href = partnerConfig.website;
        },
      });
    } else if (partnerConfig.website) {
      window.open(partnerConfig.website, "_blank");
    }
  };

  const logoUrl =
    partnerConfig.logo_url ||
    `/images/partners/${partnerConfig.partner_cd}/logo.png`;

  return (
    <div
      className={`${styles.alignCenter}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <img
        src={logoUrl}
        alt={`${partnerConfig.name} 로고`}
        className={styles.floatingImage}
        onError={(e) => {
          e.target.src = "/images/default.png";
        }}
      />
    </div>
  );
}

export default ButtonPartner;
