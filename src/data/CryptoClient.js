/**
 * 프론트엔드 하이브리드 암호화 모듈 V2
 * AES-256-CBC + RSA-OAEP 방식 (IV 포함)
 *
 * 사용법:
 * import CryptoClientV2 from './CryptoClient';
 *
 * const crypto = new CryptoClientV2();
 * await crypto.initialize();
 * const encrypted = await crypto.encrypt('민감한데이터');
 * // 서버로 전송: encrypted = { encryptedKey, encryptedData } (IV 포함)
 */

import forge from 'node-forge';

class CryptoClientV2 {
    constructor(serverUrl = '') {
        // 프론트엔드 프록시 경로: /disaster-api/api/v1
        this.serverUrl = serverUrl || '/disaster-api';
        this.publicKey = null;
        this.publicKeyExpiry = null;
        this.cacheDuration = 5 * 60 * 1000; // 5분
    }

    /**
     * 초기화 (공개키 자동 조회)
     * @returns {Promise<void>}
     */
    async initialize() {
        await this.fetchPublicKey();
        console.log('✅ CryptoClientV2 초기화 완료');
    }

    /**
     * 서버에서 RSA 공개키 조회
     * @returns {Promise<string>} PEM 형식 공개키
     */
    async fetchPublicKey() {
        // 캐시된 공개키가 유효하면 재사용
        if (this.publicKey && this.publicKeyExpiry && Date.now() < this.publicKeyExpiry) {
            console.log('✅ 캐시된 공개키 사용');
            return this.publicKey;
        }

        try {
            console.log('📡 서버에서 공개키 조회 중...');
            const response = await fetch(`${this.serverUrl}/api/v1/crypto/public-key`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`공개키 조회 실패: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success || !result.data.publicKey) {
                throw new Error('공개키를 찾을 수 없습니다');
            }

            this.publicKey = result.data.publicKey;
            this.publicKeyExpiry = Date.now() + this.cacheDuration;

            console.log('✅ 공개키 조회 성공');
            return this.publicKey;

        } catch (error) {
            console.error('❌ 공개키 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 랜덤 AES-256 키 생성
     * @returns {string} 32바이트 AES 키 (바이너리 문자열)
     */
    generateAESKey() {
        // 256비트 (32바이트) 랜덤 키 생성
        return forge.random.getBytesSync(32);
    }

    /**
     * 랜덤 IV (Initialization Vector) 생성
     * @returns {string} 16바이트 IV (바이너리 문자열)
     */
    generateIV() {
        // 128비트 (16바이트) 랜덤 IV 생성
        return forge.random.getBytesSync(16);
    }

    /**
     * AES-256-CBC로 데이터 암호화 (IV 포함 방식)
     * @param {string} plainText - 평문 데이터
     * @param {string} aesKey - AES 키 (바이너리 문자열)
     * @returns {string} IV가 포함된 Base64 암호문
     */
    encryptWithAESEmbedded(plainText, aesKey) {
        try {
            const iv = this.generateIV();
            const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
            cipher.start({ iv: iv });
            cipher.update(forge.util.createBuffer(plainText, 'utf8'));
            cipher.finish();

            // 암호화된 데이터
            const encrypted = forge.util.encode64(cipher.output.getBytes());

            // IV와 암호화된 데이터를 결합 (서버의 encryptWithAppKey와 동일한 방식)
            const combined = forge.util.encode64(iv) + ':' + encrypted;

            // Base64로 한 번 더 인코딩
            return forge.util.encode64(combined);

        } catch (error) {
            console.error('❌ AES 암호화 실패:', error);
            throw error;
        }
    }

    /**
     * RSA 공개키로 AES 키 암호화
     * @param {string} aesKey - AES 키 (바이너리 문자열)
     * @param {string} publicKeyPem - PEM 형식 공개키
     * @returns {string} Base64 암호화된 AES 키
     */
    encryptAESKeyWithRSA(aesKey, publicKeyPem) {
        try {
            // PEM 형식의 공개키를 forge 객체로 변환
            const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

            // RSA-OAEP 암호화 (SHA-256 해시)
            const encrypted = publicKey.encrypt(aesKey, 'RSA-OAEP', {
                md: forge.md.sha256.create(),
                mgf1: {
                    md: forge.md.sha256.create()
                }
            });

            // Base64 인코딩
            return forge.util.encode64(encrypted);

        } catch (error) {
            console.error('❌ RSA 암호화 실패:', error);
            throw error;
        }
    }

    /**
     * RSA로 단일 필드 암호화
     * @param {string} data - 암호화할 데이터
     * @returns {Promise<string>} Base64 암호문
     */
    async encryptWithRSA(data) {
        const publicKey = await this.fetchPublicKey();
        const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);

        const encrypted = publicKeyObj.encrypt(data, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: { md: forge.md.sha256.create() }
        });

        return forge.util.encode64(encrypted);
    }

    /**
     * 하이브리드 암호화 (AES + RSA, IV 포함)
     * @param {string|Object} data - 암호화할 데이터 (문자열 또는 객체)
     * @returns {Promise<Object>} { encryptedKey, encryptedData } (IV 포함됨)
     */
    async encryptHybrid(data) {
        if (!data) {
            throw new Error('암호화할 데이터가 없습니다');
        }

        try {
            // 1. 공개키 조회 (캐시 활용)
            const publicKey = await this.fetchPublicKey();

            // 2. 랜덤 AES 키 생성
            const aesKey = this.generateAESKey();

            // 3. 객체인 경우 JSON 문자열로 변환
            const plainText = typeof data === 'object' ? JSON.stringify(data) : data;

            // 4. AES로 데이터 암호화 (IV 포함)
            const encryptedData = this.encryptWithAESEmbedded(plainText, aesKey);

            // 5. RSA로 AES 키 암호화
            const encryptedKey = this.encryptAESKeyWithRSA(aesKey, publicKey);

            console.log('✅ 하이브리드 암호화 완료 (IV 포함)');

            // 6. 암호화된 데이터 반환 (IV는 encryptedData에 포함됨)
            return {
                encryptedKey: encryptedKey,    // RSA로 암호화된 AES 키
                encryptedData: encryptedData   // AES로 암호화된 데이터 (IV 포함)
            };

        } catch (error) {
            console.error('❌ 하이브리드 암호화 실패:', error);
            throw error;
        }
    }

    /**
     * 여러 필드를 RSA로 개별 암호화 (가계약용)
     * @param {Object} fields - { fieldName: value } 형식
     * @returns {Promise<Object>} { fieldName: encryptedValue }
     */
    async encryptFieldsWithRSA(fields) {
        const publicKey = await this.fetchPublicKey();
        const encrypted = {};

        for (const [key, value] of Object.entries(fields)) {
            if (value) {
                encrypted[key] = await this.encryptWithRSA(value);
            }
        }

        console.log(`✅ ${Object.keys(encrypted).length}개 필드 RSA 암호화 완료`);
        return encrypted;
    }

    /**
     * 공개키 캐시 초기화
     */
    clearCache() {
        this.publicKey = null;
        this.publicKeyExpiry = null;
        console.log('✅ 공개키 캐시 초기화');
    }
}

// ES6 모듈로 내보내기
export default CryptoClientV2;

// 전역 네임스페이스에 노출 (브라우저 환경)
if (typeof window !== 'undefined') {
    window.CryptoClientV2 = CryptoClientV2;
}

// CommonJS 모듈로도 내보내기 (Node.js 환경)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CryptoClientV2;
}
