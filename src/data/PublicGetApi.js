import { useState, useEffect } from "react";

const usePublicKey = () => {
  const [publicKey, setPublicKey] = useState(null);

  useEffect(() => {
    // 서버에서 공개 키를 가져오는 함수
    const fetchPublicKey = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/trip-api/auth/pubkey`
        );
        const data = await response.json();
        setPublicKey(data.publicKey);
      } catch (error) {
        console.error("Error fetching public key:", error);
      }
    };

    fetchPublicKey();
  }, []);

  return publicKey;
};

export default usePublicKey;
