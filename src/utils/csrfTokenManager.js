/**
 * CSRF 토큰 관리자
 *
 * 백엔드 API의 CSRF 보안을 위한 토큰 관리 유틸리티
 * - 토큰 자동 발급 및 갱신
 * - localStorage 저장/복원
 * - 만료 시간 관리 (1시간 - 5분 버퍼)
 * - Singleton 패턴
 */

class CsrfTokenManager {
  constructor() {
    this.token = null;
    this.expiresAt = null;
    this.isInitialized = false;

    // 환경에 따른 BASE_URL 설정
    this.baseUrl = process.env.NODE_ENV === 'production'
      ? `${process.env.REACT_APP_BASE_URL || ''}/disaster-api/api/v1`
      : `${process.env.REACT_APP_BASE_URL || 'http://localhost:38100'}/api/v1`;

    // localStorage 키
    this.STORAGE_KEY_TOKEN = 'csrf_token';
    this.STORAGE_KEY_EXPIRES = 'csrf_token_expires';

    // localStorage에서 토큰 복원 시도
    this.loadFromStorage();
  }

  /**
   * localStorage에서 토큰 로드
   * @private
   */
  loadFromStorage() {
    try {
      const savedToken = localStorage.getItem(this.STORAGE_KEY_TOKEN);
      const savedExpires = localStorage.getItem(this.STORAGE_KEY_EXPIRES);

      if (savedToken && savedExpires) {
        this.token = savedToken;
        this.expiresAt = parseInt(savedExpires, 10);

        // 만료되지 않았으면 복원 성공
        if (Date.now() < this.expiresAt) {
          console.log('✅ CSRF 토큰 복원 완료 (localStorage)');
          this.isInitialized = true;
          return true;
        } else {
          console.log('⚠️ 저장된 CSRF 토큰 만료됨');
          this.clearToken();
        }
      }
    } catch (error) {
      console.error('❌ CSRF 토큰 복원 실패:', error);
    }
    return false;
  }

  /**
   * localStorage에 토큰 저장
   * @private
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY_TOKEN, this.token);
      localStorage.setItem(this.STORAGE_KEY_EXPIRES, this.expiresAt.toString());
    } catch (error) {
      console.error('❌ CSRF 토큰 저장 실패:', error);
    }
  }

  /**
   * 백엔드에서 CSRF 토큰 발급
   * @returns {Promise<string>} CSRF 토큰
   */
  async fetchToken() {
    try {
      console.log('🔄 CSRF 토큰 발급 중...');

      const response = await fetch(`${this.baseUrl}/csrf-token`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'CSRF 토큰 발급 실패');
      }

      // 토큰 및 만료 시간 설정
      this.token = result.data.csrf_token;

      // 만료 시간 계산 (발급 시간 + expires_in - 5분 버퍼)
      const expiresInSeconds = result.data.expires_in || 3600; // 기본 1시간
      const bufferSeconds = 300; // 5분 버퍼
      this.expiresAt = Date.now() + (expiresInSeconds - bufferSeconds) * 1000;

      // localStorage에 저장
      this.saveToStorage();

      this.isInitialized = true;

      console.log('✅ CSRF 토큰 발급 완료');
      console.log(`   토큰: ${this.token.substring(0, 20)}...`);
      console.log(`   만료: ${new Date(this.expiresAt).toLocaleString()}`);

      return this.token;
    } catch (error) {
      console.error('❌ CSRF 토큰 발급 실패:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * 토큰 유효성 체크
   * @returns {boolean} 토큰이 유효하면 true
   */
  isTokenValid() {
    if (!this.token || !this.expiresAt) {
      return false;
    }
    return Date.now() < this.expiresAt;
  }

  /**
   * CSRF 토큰 가져오기 (자동 갱신)
   * - 토큰이 없거나 만료된 경우 자동으로 재발급
   * @returns {Promise<string>} CSRF 토큰
   */
  async getToken() {
    // 토큰이 유효하면 바로 반환
    if (this.isTokenValid()) {
      return this.token;
    }

    // 토큰이 없거나 만료된 경우 재발급
    console.log('🔄 CSRF 토큰 재발급 필요 (만료 또는 없음)');
    return await this.fetchToken();
  }

  /**
   * 토큰 초기화 (로그아웃 시 또는 에러 발생 시 사용)
   */
  clearToken() {
    this.token = null;
    this.expiresAt = null;
    this.isInitialized = false;

    try {
      localStorage.removeItem(this.STORAGE_KEY_TOKEN);
      localStorage.removeItem(this.STORAGE_KEY_EXPIRES);
      console.log('🗑️ CSRF 토큰 초기화 완료');
    } catch (error) {
      console.error('❌ CSRF 토큰 초기화 실패:', error);
    }
  }

  /**
   * 앱 초기화 시 호출 (선택사항)
   * - 미리 토큰을 발급하여 첫 API 호출 시 지연 방지
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized && this.isTokenValid()) {
      console.log('✅ CSRF 토큰 이미 초기화됨');
      return;
    }

    try {
      await this.fetchToken();
    } catch (error) {
      console.error('⚠️ CSRF 토큰 초기화 실패 (나중에 재시도됨):', error);
      // 에러를 throw하지 않음 - 실제 API 호출 시 다시 시도
    }
  }
}

// Singleton 인스턴스 생성 및 export
const csrfManager = new CsrfTokenManager();

export default csrfManager;
