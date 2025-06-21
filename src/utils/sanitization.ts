/**
 * Input Sanitization Utilities
 * Provides comprehensive sanitization for user inputs to prevent XSS and injection attacks
 */

// HTML entities for escaping
const HTML_ENTITIES: { [key: string]: string } = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
  '=': '&#x3D;'
};

// SQL injection patterns to detect and block
const SQL_INJECTION_PATTERNS = [
  /(\s*(union|select|insert|delete|update|drop|create|alter|exec|execute)\s+)/i,
  /(;|\||&|'|"|--|\*|\$|\+|%|@|#|\^)/,
  /(\s*(or|and)\s+\d+\s*=\s*\d+)/i,
  /(1=1|0=0|true|false)/i,
];

// XSS patterns to detect and block
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>/gi,
  /<link[^>]*>/gi,
  /<meta[^>]*>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /on\w+\s*=/gi, // onclick, onload, etc.
];

// Safe HTML tags (allowed in rich text)
const SAFE_HTML_TAGS = ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'span'];

/**
 * Basic Input Sanitizer
 */
export class InputSanitizer {
  /**
   * Escape HTML entities to prevent XSS
   */
  static escapeHTML(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input.replace(/[&<>"'`=\/]/g, match => HTML_ENTITIES[match] || match);
  }

  /**
   * Remove HTML tags completely
   */
  static stripHTML(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input.replace(/<[^>]*>/g, '');
  }

  /**
   * Allow only safe HTML tags
   */
  static sanitizeHTML(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // First escape all HTML
    let sanitized = this.escapeHTML(input);
    
    // Then allow back safe tags
    SAFE_HTML_TAGS.forEach(tag => {
      const openTag = new RegExp(`&lt;${tag}&gt;`, 'gi');
      const closeTag = new RegExp(`&lt;/${tag}&gt;`, 'gi');
      sanitized = sanitized.replace(openTag, `<${tag}>`);
      sanitized = sanitized.replace(closeTag, `</${tag}>`);
    });

    return sanitized;
  }

  /**
   * Detect and block SQL injection attempts
   */
  static detectSQLInjection(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
  }

  /**
   * Detect and block XSS attempts
   */
  static detectXSS(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    return XSS_PATTERNS.some(pattern => pattern.test(input));
  }

  /**
   * Comprehensive sanitization for text inputs
   */
  static sanitizeText(input: string, options: {
    allowHTML?: boolean;
    maxLength?: number;
    trim?: boolean;
  } = {}): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    const { allowHTML = false, maxLength, trim = true } = options;

    let sanitized = input;

    // Trim whitespace
    if (trim) {
      sanitized = sanitized.trim();
    }

    // Check for malicious patterns
    if (this.detectSQLInjection(sanitized)) {
      console.warn('Potential SQL injection detected and blocked');
      return '';
    }

    if (this.detectXSS(sanitized)) {
      console.warn('Potential XSS attack detected and blocked');
      return '';
    }

    // Handle HTML
    if (allowHTML) {
      sanitized = this.sanitizeHTML(sanitized);
    } else {
      sanitized = this.stripHTML(sanitized);
    }

    // Truncate if needed
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }
}

/**
 * Phone Number Sanitizer
 */
export class PhoneSanitizer {
  /**
   * Clean and format phone number
   */
  static sanitize(phone: string): string {
    if (!phone || typeof phone !== 'string') {
      return '';
    }

    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Block suspicious patterns
    if (InputSanitizer.detectSQLInjection(phone) || InputSanitizer.detectXSS(phone)) {
      return '';
    }

    // Limit length
    if (cleaned.length > 15) {
      cleaned = cleaned.substring(0, 15);
    }

    return cleaned;
  }
}

/**
 * Email Sanitizer
 */
export class EmailSanitizer {
  /**
   * Clean and normalize email address
   */
  static sanitize(email: string): string {
    if (!email || typeof email !== 'string') {
      return '';
    }

    // Check for XSS patterns but skip SQL injection check for emails since @ is valid
    if (InputSanitizer.detectXSS(email)) {
      return '';
    }

    // Check for specific dangerous SQL patterns that don't include @
    const emailSpecificSQLPatterns = [
      /(\s*(union|select|insert|delete|update|drop|create|alter|exec|execute)\s+)/i,
      /(;|\||&|'|"|--|\*|\$|\+|%|#|\^)/,  // Removed @ from this pattern
      /(\s*(or|and)\s+\d+\s*=\s*\d+)/i,
      /(1=1|0=0|true|false)/i,
    ];
    
    if (emailSpecificSQLPatterns.some(pattern => pattern.test(email))) {
      console.warn('Potential SQL injection detected in email input');
      return '';
    }

    // Normalize email
    let sanitized = email.trim().toLowerCase();
    
    // Remove dangerous characters but preserve @ and . for email format
    sanitized = sanitized.replace(/[<>()[\]\\,;:\s"]/g, '');

    // Limit length
    if (sanitized.length > 254) {
      sanitized = sanitized.substring(0, 254);
    }

    return sanitized;
  }
}

/**
 * Name Sanitizer
 */
export class NameSanitizer {
  /**
   * Clean and format personal names
   */
  static sanitize(name: string): string {
    if (!name || typeof name !== 'string') {
      return '';
    }

    // Security checks
    if (InputSanitizer.detectSQLInjection(name) || InputSanitizer.detectXSS(name)) {
      return '';
    }

    // Remove HTML and trim
    let sanitized = InputSanitizer.stripHTML(name).trim();
    
    // Allow only letters, spaces, hyphens, apostrophes
    sanitized = sanitized.replace(/[^a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\s'-]/g, '');
    
    // Clean up multiple spaces
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Limit length
    if (sanitized.length > 50) {
      sanitized = sanitized.substring(0, 50);
    }

    return sanitized;
  }
}

/**
 * Business Name Sanitizer
 */
export class BusinessNameSanitizer {
  /**
   * Clean and format business names
   */
  static sanitize(businessName: string): string {
    if (!businessName || typeof businessName !== 'string') {
      return '';
    }

    // Security checks
    if (InputSanitizer.detectSQLInjection(businessName) || InputSanitizer.detectXSS(businessName)) {
      return '';
    }

    // Remove HTML and trim
    let sanitized = InputSanitizer.stripHTML(businessName).trim();
    
    // Allow letters, numbers, spaces, and business punctuation
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-'&.,()]/g, '');
    
    // Clean up multiple spaces
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Limit length
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 100);
    }

    return sanitized;
  }
}

/**
 * Address Sanitizer
 */
export class AddressSanitizer {
  /**
   * Clean and format addresses
   */
  static sanitize(address: string): string {
    if (!address || typeof address !== 'string') {
      return '';
    }

    // Security checks
    if (InputSanitizer.detectSQLInjection(address) || InputSanitizer.detectXSS(address)) {
      return '';
    }

    // Remove HTML and trim
    let sanitized = InputSanitizer.stripHTML(address).trim();
    
    // Allow alphanumeric, spaces, and common address characters
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s,.-]/g, '');
    
    // Clean up multiple spaces
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Limit length
    if (sanitized.length > 200) {
      sanitized = sanitized.substring(0, 200);
    }

    return sanitized;
  }
}

/**
 * OTP Sanitizer
 */
export class OTPSanitizer {
  /**
   * Clean OTP input
   */
  static sanitize(otp: string): string {
    if (!otp || typeof otp !== 'string') {
      return '';
    }

    // Remove all non-digit characters
    let sanitized = otp.replace(/\D/g, '');
    
    // Limit to 6 digits
    if (sanitized.length > 6) {
      sanitized = sanitized.substring(0, 6);
    }

    return sanitized;
  }
}

/**
 * Tracking ID Sanitizer
 */
export class TrackingIDSanitizer {
  /**
   * Clean tracking ID input
   */
  static sanitize(trackingId: string): string {
    if (!trackingId || typeof trackingId !== 'string') {
      return '';
    }

    // Security checks
    if (InputSanitizer.detectSQLInjection(trackingId) || InputSanitizer.detectXSS(trackingId)) {
      return '';
    }

    // Remove non-alphanumeric characters and convert to uppercase
    let sanitized = trackingId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Limit length
    if (sanitized.length > 12) {
      sanitized = sanitized.substring(0, 12);
    }

    return sanitized;
  }
}

/**
 * Generic Text Sanitizer
 */
export class TextSanitizer {
  /**
   * Generic text sanitization with options
   */
  static sanitize(text: string, options: {
    allowHTML?: boolean;
    allowSpecialChars?: boolean;
    maxLength?: number;
    pattern?: RegExp;
  } = {}): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    const { 
      allowHTML = false, 
      allowSpecialChars = true, 
      maxLength = 1000,
      pattern 
    } = options;

    // Security checks
    if (InputSanitizer.detectSQLInjection(text) || InputSanitizer.detectXSS(text)) {
      return '';
    }

    let sanitized = text;

    // Handle HTML
    if (!allowHTML) {
      sanitized = InputSanitizer.stripHTML(sanitized);
    }

    // Apply custom pattern if provided
    if (pattern) {
      const matches = sanitized.match(pattern);
      sanitized = matches ? matches.join('') : '';
    } else if (!allowSpecialChars) {
      // Remove special characters if not allowed
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, '');
    }

    // Trim and clean up spaces
    sanitized = sanitized.trim().replace(/\s+/g, ' ');

    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }
}

/**
 * Form Data Sanitizer
 */
export class FormDataSanitizer {
  /**
   * Sanitize all fields in a form data object
   */
  static sanitizeFormData(formData: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        // Apply appropriate sanitization based on field name
        if (key.toLowerCase().includes('phone')) {
          sanitized[key] = PhoneSanitizer.sanitize(value);
        } else if (key.toLowerCase().includes('email')) {
          sanitized[key] = EmailSanitizer.sanitize(value);
        } else if (key.toLowerCase().includes('otp')) {
          sanitized[key] = OTPSanitizer.sanitize(value);
        } else if (key.toLowerCase().includes('name') && !key.toLowerCase().includes('business')) {
          sanitized[key] = NameSanitizer.sanitize(value);
        } else if (key.toLowerCase().includes('business')) {
          sanitized[key] = BusinessNameSanitizer.sanitize(value);
        } else if (key.toLowerCase().includes('address')) {
          sanitized[key] = AddressSanitizer.sanitize(value);
        } else if (key.toLowerCase().includes('tracking')) {
          sanitized[key] = TrackingIDSanitizer.sanitize(value);
        } else {
          sanitized[key] = InputSanitizer.sanitizeText(value);
        }
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

// All sanitizers are already exported as classes above