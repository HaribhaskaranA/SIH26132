// Security Utilities: Input Sanitization, HTML Escaping & Prototype Auth Tokenization
// NOTE: Authentication in this prototype is designed for SIH demonstration and evaluation.
// In a production deployment, this would be replaced with enterprise OAuth2 / OIDC / AgriStack SSO.

const SecurityUtils = {
  /**
   * Escapes untrusted string for safe dynamic HTML injection
   * Encodes &, <, >, ", ', / into safe HTML entities
   * @param {string|any} str - Input text
   * @returns {string} Sanitized string safe for innerHTML
   */
  escapeHtml: function(str) {
    if (str === null || str === undefined) return '';
    const s = String(str);
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
      '/': '&#x2F;'
    };
    return s.replace(/[&<>"'/]/g, (m) => map[m]);
  },

  /**
   * Sanitizes string to remove potential HTML tag injections
   * @param {string} str - Raw input
   * @returns {string} Sanitized string
   */
  sanitizeText: function(str) {
    if (!str) return '';
    return String(str).trim().replace(/<[^>]*>?/gm, '');
  },

  /**
   * Prototype credential tokenization for demo session persistence.
   * Prevents storing plaintext passwords in browser storage during evaluation.
   * NOTE: This is a prototype-level demonstration control, not a replacement for production backend authentication.
   * @param {string} pinOrPassword - User PIN or Password
   * @param {string} salt - Optional salt
   * @returns {string} Obfuscated token representation
   */
  hashCredentials: function(pinOrPassword, salt = 'ew_prototype_salt_2026') {
    const raw = String(pinOrPassword) + ':' + salt;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `EW-DEMO-AUTH-${hex.toUpperCase()}`;
  },

  /**
   * Generates a tokenized session identifier for demo role management
   * @param {string} userId - User or Entity ID
   * @param {string} role - 'farmer' or 'buyer'
   * @returns {string} Prototype session token
   */
  generateSessionToken: function(userId, role) {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 8);
    const payload = JSON.stringify({ uid: userId, r: role, t: timestamp, n: nonce });
    try {
      const b64 = btoa(payload).replace(/=/g, '');
      return `EW-SES-${b64}`;
    } catch (e) {
      return `EW-SES-${Date.now()}`;
    }
  }
};
