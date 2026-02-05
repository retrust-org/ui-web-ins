import headPhone from "../../assets/headPhone.svg";
import styles from "../../css/headers/disasterMainHeader.module.css";

function DisasterMainHeader({ title }) {
    const baseUrl = process.env.REACT_APP_ABC_URL;

    return (
        <div className={styles.disasterMainHeaderContainer}>
            <div className={styles.disasterMainHeaderContent}>
                <div className={styles.disasterMainLogoWrapper}>
                    <img
                        src="/images/insuRETrust.png"
                        alt="insuRETrust"
                        className={styles.disasterMainLogo}
                    />
                </div>

                <div className={styles.disasterMainTitleWrapper}>
                    {title && <span className={styles.disasterMainTitle}>{title}</span>}
                </div>

                <div className={styles.disasterMainHeadPhoneWrapper}>
                    <img
                        src={headPhone}
                        alt="고객센터"
                        className={styles.disasterMainHeadPhone}
                        onClick={() => {
                            window.location.href = `${baseUrl + "/claim/claimFAQ"}`;
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default DisasterMainHeader;
