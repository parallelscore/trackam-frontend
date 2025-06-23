import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';

interface PhoneFormData {
  phoneNumber: string;
}

interface PhoneValidationResult {
  isValid: boolean;
  message?: string;
}

interface UsePhoneFormReturn {
  phoneNumber: string;
  register: ReturnType<typeof useForm<PhoneFormData>>['register'];
  handleSubmit: ReturnType<typeof useForm<PhoneFormData>>['handleSubmit'];
  errors: ReturnType<typeof useForm<PhoneFormData>>['formState']['errors'];
  isValid: boolean;
  validationMessage: string;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setValue: ReturnType<typeof useForm<PhoneFormData>>['setValue'];
  trigger: ReturnType<typeof useForm<PhoneFormData>>['trigger'];
}

// Mock phone validation utilities - replace with actual implementation
const PhoneValidator = {
  validate: (phone: string): PhoneValidationResult => {
    if (!phone) return { isValid: false };
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      return { isValid: false, message: 'Phone number too short' };
    }
    
    if (cleanPhone.length > 15) {
      return { isValid: false, message: 'Phone number too long' };
    }
    
    // Nigerian phone validation example
    if (cleanPhone.startsWith('234') || cleanPhone.startsWith('0')) {
      return { isValid: true, message: 'Valid Nigerian number' };
    }
    
    return { isValid: true };
  }
};

const PhoneSanitizer = {
  sanitize: (phone: string): string => {
    // Remove non-numeric characters except + and spaces
    return phone.replace(/[^\d+\s-()]/g, '');
  }
};

export const usePhoneForm = (defaultValue = ''): UsePhoneFormReturn => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger
  } = useForm<PhoneFormData>({
    defaultValues: { phoneNumber: defaultValue }
  });

  const phoneNumber = watch('phoneNumber');
  const [validation, setValidation] = useState<PhoneValidationResult>({ isValid: false });

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = PhoneSanitizer.sanitize(e.target.value);
    setValue('phoneNumber', sanitized);
    
    const validationResult = PhoneValidator.validate(sanitized);
    setValidation(validationResult);
    
    trigger('phoneNumber');
  }, [setValue, trigger]);

  return {
    phoneNumber,
    register,
    handleSubmit,
    errors,
    isValid: validation.isValid,
    validationMessage: validation.message || '',
    handlePhoneChange,
    setValue,
    trigger
  };
};