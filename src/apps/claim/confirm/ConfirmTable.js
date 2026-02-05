import React from "react";
import styles from "../../../css/claim/claimConfirm.module.css";

const ConfirmTable = () => {
  return (
    <div className={styles.TableContents}>
      <div className={styles.TableContentsWrap}>
        <div className={styles.TableBox}>
          <table>
            <thead>
              <tr>
                <th className="">지급일자</th>
                <th className="">보험금</th>
                <th className="">은행</th>
                <th className="">담당자</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2023.08.08</td>
                <td></td>
                <td>**은행</td>
                <td>김리트</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConfirmTable;
