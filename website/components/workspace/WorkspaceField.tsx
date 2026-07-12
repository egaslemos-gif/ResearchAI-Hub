import React from "react";
import styles from "./WorkspaceField.module.css";
import { Icon } from "@/components/ui/Icon";

interface BaseFieldProps {
  label: string;
  id: string;
  error?: string;
  disabled?: boolean;
}

interface TextFieldProps extends BaseFieldProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  type?: "text" | "number" | "email" | "date" | "search";
}

export function TextField({ label, id, error, disabled, className, type = "text", ...props }: TextFieldProps) {
  return (
    <div className={`${styles.field} ${disabled ? styles.disabled : ""} ${error ? styles.hasError : ""} ${className || ""}`}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        <input 
          id={id} 
          type={type}
          disabled={disabled}
          className={styles.input} 
          {...props} 
        />
        <div className={styles.underline}></div>
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

interface SelectFieldProps extends BaseFieldProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  options: { label: string; value: string }[];
}

export function SelectField({ label, id, error, disabled, className, options, ...props }: SelectFieldProps) {
  return (
    <div className={`${styles.field} ${disabled ? styles.disabled : ""} ${error ? styles.hasError : ""} ${className || ""}`}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        <select 
          id={id} 
          disabled={disabled}
          className={`${styles.input} ${styles.select}`} 
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className={styles.selectIcon}>
          <Icon name="chevron-down" size={14} />
        </div>
        <div className={styles.underline}></div>
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
