/**
 * Comprehensive Validation Utilities
 * Provides client-side validation for all forms with Nigerian-specific rules
 */

// Validation error interface
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

// Common validation error messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  PHONE_INVALID: 'Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)',
  PHONE_TOO_SHORT: 'Phone number must be at least 10 digits',
  PHONE_TOO_LONG: 'Phone number must not exceed 14 digits',
  EMAIL_INVALID: 'Please enter a valid email address',
  OTP_INVALID: 'OTP must be exactly 6 digits',
  OTP_REQUIRED: 'Please enter the OTP code',
  NAME_TOO_SHORT: 'Name must be at least 2 characters long',
  NAME_TOO_LONG: 'Name must not exceed 50 characters',
  NAME_INVALID: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  BUSINESS_NAME_TOO_SHORT: 'Business name must be at least 2 characters long',
  BUSINESS_NAME_TOO_LONG: 'Business name must not exceed 100 characters',
  BUSINESS_NAME_INVALID: 'Business name contains invalid characters',
  TRACKING_ID_INVALID: 'Tracking ID must be 8-12 characters long',
  ADDRESS_TOO_SHORT: 'Address must be at least 10 characters long',
  ADDRESS_TOO_LONG: 'Address must not exceed 200 characters',
  COORDINATE_INVALID: 'Invalid coordinate value',
  DELIVERY_NOTE_TOO_LONG: 'Delivery note must not exceed 500 characters',
  PRICE_INVALID: 'Price must be a valid amount',
  PRICE_TOO_LOW: 'Price must be greater than 0',
  PRICE_TOO_HIGH: 'Price must not exceed ₦1,000,000',
  PHONE_FORMAT_HINT: 'Use format: 08012345678 or +2348012345678',
} as const;

/**
 * Nigerian Phone Number Validation
 * Supports formats: 08012345678, +2348012345678, 2348012345678
 */
export class PhoneValidator {
  // Nigerian mobile network prefixes
  private static readonly NIGERIAN_PREFIXES = [
    '070', '080', '081', '090', '091', // MTN
    '080', '081', '070', '090', '091', // GLO
    '080', '081', '070', '090', '091', // Airtel
    '081', '080', '070', '090', '091', // 9mobile (Etisalat)
  ];

  /**
   * Validate and format Nigerian phone number
   */
  static validate(phone: string): ValidationResult {
    if (!phone || typeof phone !== 'string') {
      return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    if (!cleaned) {
      return { isValid: false, error: VALIDATION_MESSAGES.PHONE_INVALID };
    }

    // Handle different formats
    let normalizedPhone = '';
    
    if (cleaned.startsWith('+234')) {
      // +2348012345678 format
      normalizedPhone = cleaned.substring(4); // Remove +234
    } else if (cleaned.startsWith('234')) {
      // 2348012345678 format
      normalizedPhone = cleaned.substring(3); // Remove 234
    } else if (cleaned.startsWith('0')) {
      // 08012345678 format
      normalizedPhone = cleaned.substring(1); // Remove leading 0
    } else {
      // Assume it's already in 8012345678 format
      normalizedPhone = cleaned;
    }

    // Validate length
    if (normalizedPhone.length !== 10) {
      return { 
        isValid: false, 
        error: normalizedPhone.length < 10 ? 
          VALIDATION_MESSAGES.PHONE_TOO_SHORT : 
          VALIDATION_MESSAGES.PHONE_TOO_LONG 
      };
    }

    // Validate Nigerian prefix
    const prefix = normalizedPhone.substring(0, 3);
    const validPrefixes = ['70', '80', '81', '90', '91'];
    
    if (!validPrefixes.some(p => prefix.startsWith(p))) {
      return { 
        isValid: false, 
        error: VALIDATION_MESSAGES.PHONE_INVALID 
      };
    }

    // Return validated phone with leading 0
    const formattedPhone = '0' + normalizedPhone;
    
    return { 
      isValid: true, 
      sanitizedValue: formattedPhone 
    };
  }

  /**
   * Format phone number for display
   */
  static formatForDisplay(phone: string): string {
    const result = this.validate(phone);
    if (result.isValid && result.sanitizedValue) {
      const digits = result.sanitizedValue;
      return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
    }
    return phone;
  }

  /**
   * Format phone number for API (international format)
   */
  static formatForAPI(phone: string): string {
    const result = this.validate(phone);
    if (result.isValid && result.sanitizedValue) {
      return result.sanitizedValue; // Return local format for backend
    }
    return phone;
  }
}

/**
 * Email Validation
 */
export class EmailValidator {
  // RFC 5322 compliant email regex (simplified)
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  static validate(email: string): ValidationResult {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      return { isValid: false, error: VALIDATION_MESSAGES.EMAIL_INVALID };
    }

    // Additional checks
    if (trimmedEmail.length > 254) {
      return { isValid: false, error: 'Email address is too long' };
    }

    const localPart = trimmedEmail.split('@')[0];
    if (localPart.length > 64) {
      return { isValid: false, error: 'Email address is too long' };
    }

    return { isValid: true, sanitizedValue: trimmedEmail };
  }
}

/**
 * OTP Validation
 */
export class OTPValidator {
  static validate(otp: string): ValidationResult {
    if (!otp || typeof otp !== 'string') {
      return { isValid: false, error: VALIDATION_MESSAGES.OTP_REQUIRED };
    }

    const cleaned = otp.replace(/\D/g, ''); // Remove non-digits
    
    if (cleaned.length !== 6) {
      return { isValid: false, error: VALIDATION_MESSAGES.OTP_INVALID };
    }

    return { isValid: true, sanitizedValue: cleaned };
  }
}

/**
 * Name Validation (for first name, last name)
 */
export class NameValidator {
  // Allow letters, spaces, hyphens, apostrophes, and common international characters
  private static readonly NAME_REGEX = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\s'-]+$/;

  static validate(name: string, fieldName: string = 'Name'): ValidationResult {
    if (!name || typeof name !== 'string') {
      return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    const trimmed = name.trim();
    
    if (trimmed.length < 2) {
      return { isValid: false, error: VALIDATION_MESSAGES.NAME_TOO_SHORT };
    }

    if (trimmed.length > 50) {
      return { isValid: false, error: VALIDATION_MESSAGES.NAME_TOO_LONG };
    }

    if (!this.NAME_REGEX.test(trimmed)) {
      return { isValid: false, error: VALIDATION_MESSAGES.NAME_INVALID };
    }

    // Check for excessive spaces or special characters
    if (trimmed.includes('  ') || trimmed.startsWith('-') || trimmed.startsWith("'")) {
      return { isValid: false, error: `${fieldName} format is invalid` };
    }

    // Capitalize first letter of each word
    const formatted = trimmed.replace(/\b\w/g, l => l.toUpperCase());
    
    return { isValid: true, sanitizedValue: formatted };
  }
}

/**
 * Business Name Validation
 */
export class BusinessNameValidator {
  // Allow letters, numbers, spaces, and common business punctuation
  private static readonly BUSINESS_NAME_REGEX = /^[a-zA-Z0-9\s\-'&.,()]+$/;

  static validate(businessName: string): ValidationResult {
    if (!businessName || typeof businessName !== 'string') {
      return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    const trimmed = businessName.trim();
    
    if (trimmed.length < 2) {
      return { isValid: false, error: VALIDATION_MESSAGES.BUSINESS_NAME_TOO_SHORT };
    }

    if (trimmed.length > 100) {
      return { isValid: false, error: VALIDATION_MESSAGES.BUSINESS_NAME_TOO_LONG };
    }

    if (!this.BUSINESS_NAME_REGEX.test(trimmed)) {
      return { isValid: false, error: VALIDATION_MESSAGES.BUSINESS_NAME_INVALID };
    }

    // Basic formatting
    const formatted = trimmed.replace(/\s+/g, ' ');
    
    return { isValid: true, sanitizedValue: formatted };
  }
}

/**
 * Tracking ID Validation
 */
export class TrackingIDValidator {
  static validate(trackingId: string): ValidationResult {
    if (!trackingId || typeof trackingId !== 'string') {
      return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    const cleaned = trackingId.trim().toUpperCase();
    
    if (cleaned.length < 8 || cleaned.length > 12) {
      return { isValid: false, error: VALIDATION_MESSAGES.TRACKING_ID_INVALID };
    }

    // Allow alphanumeric characters
    if (!/^[A-Z0-9]+$/.test(cleaned)) {
      return { isValid: false, error: 'Tracking ID can only contain letters and numbers' };
    }

    return { isValid: true, sanitizedValue: cleaned };
  }
}

/**
 * Address Validation
 */
export class AddressValidator {
  static validate(address: string): ValidationResult {
    if (!address || typeof address !== 'string') {
      return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    const trimmed = address.trim();
    
    if (trimmed.length < 10) {
      return { isValid: false, error: VALIDATION_MESSAGES.ADDRESS_TOO_SHORT };
    }

    if (trimmed.length > 200) {
      return { isValid: false, error: VALIDATION_MESSAGES.ADDRESS_TOO_LONG };
    }

    // Basic sanitization
    const sanitized = trimmed.replace(/\s+/g, ' ');
    
    return { isValid: true, sanitizedValue: sanitized };
  }
}

/**
 * Coordinate Validation (for latitude/longitude)
 */
export class CoordinateValidator {
  static validateLatitude(lat: number | string): ValidationResult {
    const num = typeof lat === 'string' ? parseFloat(lat) : lat;
    
    if (isNaN(num)) {
      return { isValid: false, error: VALIDATION_MESSAGES.COORDINATE_INVALID };
    }

    if (num < -90 || num > 90) {
      return { isValid: false, error: 'Latitude must be between -90 and 90' };
    }

    return { isValid: true, sanitizedValue: num.toString() };
  }

  static validateLongitude(lng: number | string): ValidationResult {
    const num = typeof lng === 'string' ? parseFloat(lng) : lng;
    
    if (isNaN(num)) {
      return { isValid: false, error: VALIDATION_MESSAGES.COORDINATE_INVALID };
    }

    if (num < -180 || num > 180) {
      return { isValid: false, error: 'Longitude must be between -180 and 180' };
    }

    return { isValid: true, sanitizedValue: num.toString() };
  }
}

/**
 * Price Validation (for delivery prices)
 */
export class PriceValidator {
  static validate(price: number | string): ValidationResult {
    if (price === null || price === undefined || price === '') {
      return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    const num = typeof price === 'string' ? parseFloat(price.replace(/[₦,\s]/g, '')) : price;
    
    if (isNaN(num)) {
      return { isValid: false, error: VALIDATION_MESSAGES.PRICE_INVALID };
    }

    if (num <= 0) {
      return { isValid: false, error: VALIDATION_MESSAGES.PRICE_TOO_LOW };
    }

    if (num > 1000000) {
      return { isValid: false, error: VALIDATION_MESSAGES.PRICE_TOO_HIGH };
    }

    return { isValid: true, sanitizedValue: num.toString() };
  }

  static formatForDisplay(price: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  }
}

/**
 * Generic Text Validation
 */
export class TextValidator {
  static validate(
    text: string, 
    minLength: number = 1, 
    maxLength: number = 255,
    fieldName: string = 'Field'
  ): ValidationResult {
    if (!text || typeof text !== 'string') {
      return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    const trimmed = text.trim();
    
    if (trimmed.length < minLength) {
      return { 
        isValid: false, 
        error: `${fieldName} must be at least ${minLength} character${minLength > 1 ? 's' : ''} long` 
      };
    }

    if (trimmed.length > maxLength) {
      return { 
        isValid: false, 
        error: `${fieldName} must not exceed ${maxLength} characters` 
      };
    }

    return { isValid: true, sanitizedValue: trimmed };
  }
}

/**
 * Form Validation Utilities
 */
export class FormValidator {
  /**
   * Validate multiple fields at once
   */
  static validateFields(validations: { [key: string]: ValidationResult }): {
    isValid: boolean;
    errors: { [key: string]: string };
    sanitizedData: { [key: string]: string };
  } {
    const errors: { [key: string]: string } = {};
    const sanitizedData: { [key: string]: string } = {};
    let isValid = true;

    for (const [field, result] of Object.entries(validations)) {
      if (!result.isValid) {
        isValid = false;
        if (result.error) {
          errors[field] = result.error;
        }
      } else if (result.sanitizedValue !== undefined) {
        sanitizedData[field] = result.sanitizedValue;
      }
    }

    return { isValid, errors, sanitizedData };
  }

  /**
   * Create validation schema for React Hook Form
   */
  static createSchema() {
    return {
      phone: {
        required: VALIDATION_MESSAGES.REQUIRED,
        validate: (value: string) => {
          const result = PhoneValidator.validate(value);
          return result.isValid || result.error;
        }
      },
      email: {
        required: VALIDATION_MESSAGES.REQUIRED,
        validate: (value: string) => {
          const result = EmailValidator.validate(value);
          return result.isValid || result.error;
        }
      },
      otp: {
        required: VALIDATION_MESSAGES.OTP_REQUIRED,
        validate: (value: string) => {
          const result = OTPValidator.validate(value);
          return result.isValid || result.error;
        }
      },
      firstName: {
        required: VALIDATION_MESSAGES.REQUIRED,
        validate: (value: string) => {
          const result = NameValidator.validate(value, 'First name');
          return result.isValid || result.error;
        }
      },
      lastName: {
        required: VALIDATION_MESSAGES.REQUIRED,
        validate: (value: string) => {
          const result = NameValidator.validate(value, 'Last name');
          return result.isValid || result.error;
        }
      },
      businessName: {
        required: VALIDATION_MESSAGES.REQUIRED,
        validate: (value: string) => {
          const result = BusinessNameValidator.validate(value);
          return result.isValid || result.error;
        }
      }
    };
  }
}

// All validators are already exported as classes above
// No need for additional export block