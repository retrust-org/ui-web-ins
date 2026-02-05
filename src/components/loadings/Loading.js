import React, { useState, useEffect } from "react";
import loadingLogo from "../../assets/loadingLogo.svg";

function Loading() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % 8);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-[999]">
      <div className="flex flex-col items-center justify-center" style={{ paddingTop: '40px' }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="168"
          viewBox="0 0 120 100"
          fill="none"
          style={{ marginBottom: '8px' }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
            <circle
              key={index}
              cx="60"
              cy="21"
              r="7"
              fill="#C1D1C1"
              fillOpacity={index === activeIndex ? 1 : 0.3}
              transform={index === 0 ? "" : `rotate(${index * 45} 60 60)`}
            />
          ))}
        </svg>
        <img src={loadingLogo} alt="Loading..." />
      </div>
    </div>
  );
}
export default Loading;
