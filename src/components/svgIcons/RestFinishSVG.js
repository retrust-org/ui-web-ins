import React from "react";

const FinishSVG = () => {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="101"
        height="100"
        viewBox="0 0 101 100"
        fill="none"
      >
        <g clipPath="url(#clip0_56_7921)">
          <circle cx="50.5" cy="50" r="50" fill="#EBF0EB" />
          <path
            d="M29.5 47.9275L44.5459 63L70.5 37"
            stroke="#386937"
            strokeWidth="6"
            strokeLinecap="round"
            // strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_56_7921">
            <rect
              width="100"
              height="100"
              fill="white"
              transform="translate(0.5)"
            />
          </clipPath>
        </defs>
      </svg>
    </>
  );
};

//finish 로딩 스팟 SVG

const LodingSpot = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="9"
      height="8"
      viewBox="0 0 9 8"
      fill="none"
    >
      <circle cx="4.5" cy="4" r="4" fill="#7A9B79" />
    </svg>
  );
};

const DptLoading = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="9"
      height="8"
      viewBox="0 0 9 8"
      fill="none"
    >
      <circle cx="4.5" cy="4" r="4" fill="#0E98F6" />
    </svg>
  );
};

//약관내용 확인 (>) --> 아이콘
const FaGreaterThanSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M7 16L13 10L7 4"
        stroke="#66686F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const InputDeleteSVG = ({ onClick }) => {
  return (
    <div onClick={onClick} style={{ position: "relative" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <circle cx="10" cy="10" r="10" fill="#96989C" />
        <path
          d="M6 6L14 14M6 14L14 6"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export { LodingSpot, FinishSVG, FaGreaterThanSvg, InputDeleteSVG, DptLoading };
