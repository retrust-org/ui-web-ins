import React, { useState, useEffect } from "react";
import ClaimHeader from "../../claim/components/ClaimHeader";
import styles from "../../../css/claim/claimAgreement.module.css";
import commonRightArrow from "../../../assets/commonRightArrow.svg";
import commonRadioBtn from "../../../assets/commonRadioBtn.svg";
import commonRadinActive from "../../../assets/commonRadinActive.svg";
import commonCheck from "../../../assets/commonCheck.svg";
import commonActiveChk from "../../../assets/commonActiveChk.svg";
import { useNavigate } from "react-router-dom";
import ClaimAgreeData from "../../../data/ClaimAgreeData";
import ClaimButton from "../../../components/buttons/ClaimButton";
import { useClaimUploadContext } from "../../../context/ClaimUploadContext"; // Context import 추가

function ClaimEntryAndAgreement() {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  const toggleBtn = () => {
    setIsActive(!isActive);
  };

  const [formData, setFormData] = useState(ClaimAgreeData);

  const toggleCheckbox = (formIndex, itemIndex, isAgree) => {
    setFormData((prevFormData) => {
      const newFormData = [...prevFormData];
      const form = newFormData[formIndex];
      const newItem = { ...form.agreeItems[itemIndex] };
      newItem.checked = newItem.checked === isAgree ? null : isAgree;
      form.agreeItems[itemIndex] = newItem;
      return newFormData;
    });
  };

  const toggleAllCheckboxes = (formIndex, isAgree) => {
    setFormData((prevFormData) => {
      const newFormData = [...prevFormData];
      const form = newFormData[formIndex];
      form.agreeItems = form.agreeItems.map((item) => ({
        ...item,
        checked: isAgree ? true : null,
      }));
      return newFormData;
    });
  };

  const isAllChecked = (form) => {
    return form.agreeItems.every((item) => item.checked === true);
  };

  const handleAllAgree = () => {
    navigate("/claimTypeSelect");
  };

  const isAllAgreed = formData.every((form) => isAllChecked(form));

  return (
    <>
      <ClaimHeader titleText="청구하기" />
      <div className="w-full pb-20">
        <div className="w-full">
          <div className={styles.sectionFirst}>
            <h3>아래 필수 약관에 동의해주세요.</h3>
            <p>
              귀하는 개인(신용)정보의 수집·이용 및 조회, 제공에 관한 동의를 거부
              하실 수 있으며, 개인의 신용도 등을 평가하기 위한 목적 이외의
              개인(신용)정보 제공 동의는 철회할 수 있습니다. 다만, 본 동의는
              '보험금 청구'를 위해 필수적인 사항이므로 동의를 거부하시는 경우
              관련 업무수행이 불가능할 수 있습니다.
            </p>
            <span>심의번호 : [상세] 손_03_C_D_001_2105</span>
          </div>
        </div>
        <div className={styles.line}></div>
        {/* 선 끝 */}
        <div className={styles.sectionSecnod}>
          {formData.map((form, formIndex) => (
            <div className={styles.agreeFormContentsWrap} key={formIndex}>
              <div className={styles.FormBox}>
                <div className={styles.FormBoxTitle}>
                  <div className={styles.TitleWrap}>
                    <img
                      src={isAllChecked(form) ? commonActiveChk : commonCheck}
                      className={styles.checkIcon}
                      onClick={() =>
                        toggleAllCheckboxes(formIndex, !isAllChecked(form))
                      }
                      alt="check icon"
                    />
                    <h3>{form.title}</h3>
                    <img
                      src={commonRightArrow}
                      alt="commonRightArrow"
                      className={styles.RightArrow}
                    />
                  </div>
                </div>
                <div className={styles.textContents}>
                  <div className={styles.textContentsWrap}>
                    <div className={styles.textContentFlexCol}>
                      {form.description.map((text, itemIndex) => (
                        <p key={itemIndex}>{text}</p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.agreeInfoCehck}>
                  <div className={styles.agreeInfoCehckWrap}>
                    <ul>
                      {form.agreeItems.map((item, itemIndex) => (
                        <li className={styles.infoList} key={itemIndex}>
                          <p className={styles.textTitle}>{item.title}</p>
                          <div className={styles.agreeCheckWrap}>
                            <div className={styles.agreeCheckContents}>
                              <img
                                src={
                                  item.checked === true
                                    ? commonRadinActive
                                    : commonRadioBtn
                                }
                                alt=""
                                onClick={() =>
                                  toggleCheckbox(formIndex, itemIndex, true)
                                }
                              />
                              <p>동의</p>
                            </div>
                            <div className={styles.agreeCheckContents}>
                              <img
                                src={
                                  item.checked === false
                                    ? commonRadinActive
                                    : commonRadioBtn
                                }
                                alt=""
                                onClick={() =>
                                  toggleCheckbox(formIndex, itemIndex, false)
                                }
                              />
                              <p>미동의</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className={styles.line}></div>
        </div>
        <div className={styles.sectionThird}>
          <div className={styles.thridWrap}>
            <ul className="">
              <li className="">보험금 청구 동의</li>
              <li className="">
                이상의 기재사항은 사실임을 확인하며, 사실과 다른 내용을 기재하는
                경우, 약관의 보험금 청구권 상실조항에 따라 보험금 청구권이
                상실됨을 동의하기에 보험금을 청구합니다. 보험금 지급과 관련하여
                향후 해약환급금 또는 만기환급금의 감소가 우려될 경우 귀하에 대한
                애출금과의 우선변제 충당에 동의합니다.
              </li>
              <li className="">
                <div
                  style={{ borderColor: isActive ? "#386937" : "#e8e9ea" }}
                  onClick={toggleBtn}
                >
                  <img
                    src={isActive ? commonActiveChk : commonCheck}
                    alt="commonCheck"
                    className="checkbox-image"
                  />
                  <span>동의합니다</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.buttonWrap}>
          <div className="w-[370px] h-[20px] fixed bottom-[72px] bg-[#fff] left-1/2 transform -translate-x-1/2 blur-sm rounded-full "></div>
          <div className="pt-14 pb-7 bg-[#fff] fixed bottom-[0px] left-0 right-0 text-center w-[440px] mx-auto border-with-shadow"></div>
          <ClaimButton
            buttonText="전체동의 및 확인"
            disabled={!isAllAgreed || !isActive}
            onClick={handleAllAgree}
          />
        </div>
      </div>
    </>
  );
}

export default ClaimEntryAndAgreement;
