"use client";

import * as React from "react";
import { useState, useCallback, FormEvent } from "react";
import { Label } from "./label";

type ValidationSchema = Record<string, (value: any) => string | undefined>;

type FormOptions = {
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  validateOnChange?: boolean;
};

type FormProps = {
  schema: ValidationSchema;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  initialValues: Record<string, unknown>;
  options?: FormOptions;
  children: React.ReactNode;
  className?: string;
};

type FormContextValue = {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setValue: (name: string, value: unknown) => void;
  setError: (name: string, error: string) => void;
  setTouched: (name: string) => void;
  validateField: (name: string) => boolean;
  options: FormOptions;
};

const FormContext = React.createContext<FormContextValue | null>(null);

export const Form: React.FC<FormProps> = ({
  schema,
  onSubmit,
  initialValues,
  options = {},
  children,
  className,
}) => {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (name: string): boolean => {
      const validator = schema[name];
      if (!validator) return true;

      const error = validator(values[name]);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
        return false;
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
        return true;
      }
    },
    [schema, values]
  );

  const setValue = useCallback(
    (name: string, value: unknown) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      if (options.validateOnChange) {
        setTimeout(() => validateField(name), 0);
      }
    },
    [options.validateOnChange, validateField]
  );

  const setError = useCallback((name: string, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setTouchedField = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (options.validateOnSubmit !== false) {
      let isValid = true;
      const newErrors: Record<string, string> = {};

      Object.keys(schema).forEach((fieldName) => {
        const validator = schema[fieldName];
        const error = validator(values[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      setTouched(
        Object.keys(schema).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );

      if (!isValid) return;
    }

    await onSubmit(values);
  };

  const contextValue: FormContextValue = {
    values,
    errors,
    touched,
    setValue,
    setError,
    setTouched: setTouchedField,
    validateField,
    options: {
      validateOnBlur: options.validateOnBlur !== false,
      validateOnSubmit: options.validateOnSubmit !== false,
      validateOnChange: options.validateOnChange || false,
    },
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={className}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

const useFormContext = () => {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error("Form components must be used within a Form");
  }
  return context;
};

type FormFieldProps = {
  name: string;
  children: (props: {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    hasError: boolean;
  }) => React.ReactNode;
};

export const FormField: React.FC<FormFieldProps> = ({ name, children }) => {
  const { values, errors, touched, setValue, setTouched, validateField, options } =
    useFormContext();

  const handleBlur = useCallback(() => {
    setTouched(name);
    if (options.validateOnBlur) {
      validateField(name);
    }
  }, [name, setTouched, validateField, options.validateOnBlur]);

  return (
    <>
      {children({
        value: values[name],
        onChange: (value: unknown) => setValue(name, value),
        onBlur: handleBlur,
        hasError: touched[name] && !!errors[name],
      })}
    </>
  );
};

type FormErrorProps = {
  name: string;
  className?: string;
};

export const FormError: React.FC<FormErrorProps> = ({ name, className }) => {
  const { errors, touched } = useFormContext();

  if (!touched[name] || !errors[name]) {
    return null;
  }

  return (
    <p className={`text-sm text-red-600 dark:text-red-400 mt-1 ${className || ""}`}>
      {errors[name]}
    </p>
  );
};
