import CryptoJS from "crypto-js";

const key = "9721550af5808946300a67a3e05c92b7476fa887f1ec164d6ee3a76c511bfc3f";
const iv = "c6f3279afeaf27a593f46d22ee716132";

export const encrypt = (data: string) => {
  const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Hex.parse(key), {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
};

export const decrypt = (encryptedData: string) => {
  if (!encryptedData || typeof encryptedData !== "string") {
    return "";
  }

  try {
    const decrypted = CryptoJS.AES.decrypt(
      CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(encryptedData),
      }),
      CryptoJS.enc.Hex.parse(key),
      {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      return "";
    }

    return decryptedString;
  } catch (error) {
    return "";
  }
};
