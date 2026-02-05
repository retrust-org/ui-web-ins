import forge from "node-forge";

const createPostData = async (data, publicKey) => {
  try {
    if (!publicKey) {
      throw new Error("Public key not provided");
    }

    const aesKey = forge.random.getBytesSync(32); // AES key 생성 (바이트 배열)
    const iv = forge.random.getBytesSync(16); // IV 생성 (바이트 배열)

    // 데이터 암호화 (AES-CBC)
    const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(data, "utf8"));
    cipher.finish();
    const encryptedData = cipher.output.getBytes();

    // RSA 공개 키를 사용하여 AES 키 암호화 (RSA-OAEP, SHA-256)
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
    const encryptedKey = publicKeyObj.encrypt(aesKey, "RSA-OAEP", {
      md: forge.md.sha256.create(),
    });

    // Base64 인코딩하여 전송 데이터 준비
    const postData = {
      encryptedKey: forge.util.encode64(encryptedKey),
      encryptedData: forge.util.encode64(encryptedData),
      iv: forge.util.encode64(iv),
    };

    return postData;
  } catch (error) {
    console.error("Error creating post data:", error);
    throw error;
  }
};

export default createPostData;
