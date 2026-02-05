import headPhone from "../../assets/headPhone.svg";
import styles from "../../css/headers/safetyGuardHeader.module.css";

function SafetyGuardHeader({ title }) {
    const baseUrl = process.env.REACT_APP_ABC_URL;

    return (
        <div className={styles.safetyGuardHeaderContainer}>
            <div className={styles.safetyGuardHeaderContent}>
                <div className={styles.safetyGuardLogoWrapper}>
                    <img
                        src="/images/insuRETrust.png"
                        alt="insuRETrust"
                        className={styles.safetyGuardLogo}
                    />
                </div>

                <div className={styles.safetyGuardTitleWrapper}>
                    {title && <span className={styles.safetyGuardTitle}>{title}</span>}
                </div>

                <div className={styles.safetyGuardHeadPhoneWrapper}>
                    <img
                        src={headPhone}
                        alt="고객센터"
                        className={styles.safetyGuardHeadPhone}
                        onClick={() => {
                            window.location.href = `${baseUrl + "/claim/claimFAQ"}`;
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default SafetyGuardHeader;
