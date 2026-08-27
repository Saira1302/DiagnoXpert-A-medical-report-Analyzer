type ValidationRule<T = any> = {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean | string;
};

export const string = (rules: ValidationRule<string> = {}) => {
  return (value: any): string | undefined => {
    if (rules.required && (!value || String(value).trim() === "")) {
      return rules.message || "This field is required";
    }

    if (value) {
      const strValue = String(value);
      
      if (rules.min && strValue.length < rules.min) {
        return rules.message || `Minimum length is ${rules.min}`;
      }

      if (rules.max && strValue.length > rules.max) {
        return rules.message || `Maximum length is ${rules.max}`;
      }

      if (rules.pattern && !rules.pattern.test(strValue)) {
        return rules.message || "Invalid format";
      }

      if (rules.custom) {
        const result = rules.custom(strValue);
        if (typeof result === "string") return result;
        if (result === false) return rules.message || "Validation failed";
      }
    }

    return undefined;
  };
};

export const number = (rules: ValidationRule<number> = {}) => {
  return (value: any): string | undefined => {
    if (rules.required && (value === undefined || value === null || value === "")) {
      return rules.message || "This field is required";
    }

    if (value !== undefined && value !== null && value !== "") {
      const numValue = Number(value);

      if (isNaN(numValue)) {
        return "Must be a valid number";
      }

      if (rules.min !== undefined && numValue < rules.min) {
        return rules.message || `Minimum value is ${rules.min}`;
      }

      if (rules.max !== undefined && numValue > rules.max) {
        return rules.message || `Maximum value is ${rules.max}`;
      }

      if (rules.custom) {
        const result = rules.custom(numValue);
        if (typeof result === "string") return result;
        if (result === false) return rules.message || "Validation failed";
      }
    }

    return undefined;
  };
};

export const email = (rules: ValidationRule<string> = {}) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return string({
    ...rules,
    pattern: emailPattern,
    message: rules.message || "Please enter a valid email address",
  });
};

export const url = (rules: ValidationRule<string> = {}) => {
  const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  return string({
    ...rules,
    pattern: urlPattern,
    message: rules.message || "Please enter a valid URL",
  });
};
