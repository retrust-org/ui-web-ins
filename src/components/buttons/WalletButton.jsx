import React, { useState, useEffect } from "react";
import QRCodeModal from "../modals/QRCodeModal";

const WalletButton = ({
  appleWalletUrl,
  samsungWalletUrl,
  show = false,
  children,
  className = "",
}) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
      setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent));
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const handleWalletClick = (walletType) => {
    const url = walletType === 'apple' ? appleWalletUrl : samsungWalletUrl;

    if (url) {
      if (isMobile) {
        // 모바일: 새 창으로 열기
        window.open(url, "_blank");
      } else {
        // PC: QR 코드 모달 표시
        setQrCodeData(url);
        setShowQRModal(true);
      }
    }
  };

  // URL 체크: PC는 둘 중 하나라도, 모바일은 디바이스별 URL 확인
  if (!isMobile) {
    // PC: 둘 중 하나라도 있으면 표시
    if (!appleWalletUrl && !samsungWalletUrl) {
      return null;
    }
  } else {
    // 모바일: 디바이스별 URL 체크
    const walletUrl = isIOS ? appleWalletUrl : samsungWalletUrl;
    if (!walletUrl) {
      return null;
    }
  }

  // children이 없으면 지갑 버튼만 표시 (disaster Complete.js용)
  if (!children) {
    // PC: Apple Wallet + Samsung Wallet 두 개 모두 가로로 표시
    if (!isMobile) {
      return (
        <>
          <div className={`w-full flex flex-row gap-3 ${className}`}>
            {/* Apple Wallet 버튼 */}
            <div
              className="flex-1 h-[60px] flex justify-center items-center rounded-[8px] cursor-pointer overflow-hidden"
              onClick={() => handleWalletClick('apple')}
            >
              <img
                src="/images/addToWallet/add-to-apple-wallet-v3.png"
                alt="Add to Apple Wallet"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Samsung Wallet 버튼 */}
            <div
              className="flex-1 h-[60px] flex justify-center items-center rounded-[8px] cursor-pointer overflow-hidden"
              style={{ backgroundColor: "#000000" }}
              onClick={() => handleWalletClick('samsung')}
            >
              <img
                src="/images/addToWallet/add-to-samsung-wallet-v3.png"
                alt="Add to Samsung Wallet"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {showQRModal && (
            <QRCodeModal
              onClose={() => setShowQRModal(false)}
              qrCodeData={qrCodeData}
            />
          )}
        </>
      );
    }

    // 모바일: iOS면 Apple, Android면 Samsung 하나만 표시
    return (
      <>
        <div className={`w-full ${className}`}>
          <div
            className="w-full h-[60px] flex justify-center items-center rounded-[8px] cursor-pointer overflow-hidden"
            style={isIOS ? {} : { backgroundColor: "#000000" }}
            onClick={() => handleWalletClick(isIOS ? 'apple' : 'samsung')}
          >
            {isIOS ? (
              <img
                src="/images/addToWallet/add-to-apple-wallet-v3.png"
                alt="Add to Apple Wallet"
                className="h-full object-contain"
              />
            ) : (
              <img
                src="/images/addToWallet/add-to-samsung-wallet-v3.png"
                alt="Add to Samsung Wallet"
                className="h-[80%] object-contain"
              />
            )}
          </div>
        </div>
        {showQRModal && (
          <QRCodeModal
            onClose={() => setShowQRModal(false)}
            qrCodeData={qrCodeData}
          />
        )}
      </>
    );
  }

  // children이 있으면 레이아웃 담당 (trip Finish.js용)
  return (
    <>
    <div className={`w-full px-[2%] ${className}`}>
      {show ? (
        // NFT 받기 버튼과 월렛 버튼을 세로로 배치 (풍수해 Complete.js와 동일)
        <div className="flex flex-col gap-[12px] w-full">
          {/* NFT 받기 버튼 (children) */}
          <div className="w-full h-[56px]">
            {children}
          </div>

          {/* Wallet 버튼 영역 */}
          {!isMobile ? (
            // PC: Apple + Samsung 두 개를 가로로 배치
            <div className="w-full flex flex-row gap-3">
              <div
                className="flex-1 h-[60px] flex justify-center items-center cursor-pointer rounded-[8px] overflow-hidden"
                onClick={() => handleWalletClick('apple')}
              >
                <img
                  src="/images/addToWallet/add-to-apple-wallet-v3.png"
                  alt="Add to Apple Wallet"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="flex-1 h-[60px] flex justify-center items-center cursor-pointer rounded-[8px] overflow-hidden"
                style={{ backgroundColor: "#000000" }}
                onClick={() => handleWalletClick('samsung')}
              >
                <img
                  src="/images/addToWallet/add-to-samsung-wallet-v3.png"
                  alt="Add to Samsung Wallet"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            // 모바일: 기존처럼 하나만 표시
            <div
              className="w-full h-[60px] flex justify-center items-center cursor-pointer rounded-[12px] overflow-hidden"
              style={isIOS ? {} : { backgroundColor: "#000000" }}
              onClick={() => handleWalletClick(isIOS ? 'apple' : 'samsung')}
            >
              {isIOS ? (
                <img
                  src="/images/addToWallet/add-to-apple-wallet-v3.png"
                  alt="Add to Apple Wallet"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="/images/addToWallet/add-to-samsung-wallet-v3.png"
                  alt="Add to Samsung Wallet"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          )}
        </div>
      ) : (
        // show가 false일 때는 NFT 버튼만 표시
        <div className="w-full h-[56px]">
          {children}
        </div>
      )}
    </div>
    {showQRModal && (
      <QRCodeModal
        onClose={() => setShowQRModal(false)}
        qrCodeData={qrCodeData}
      />
    )}
    </>
  );
};

export default WalletButton;
