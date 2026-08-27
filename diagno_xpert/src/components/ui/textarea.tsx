import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  textareaClassName?: string;
  hasError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, textareaClassName, hasError, ...props }, ref) => {
    return (
      <textarea
        className={`${textareaClassName || ""} ${
          hasError ? "border-red-500 focus:ring-red-500 dark:border-red-500" : ""
        } ${className || ""}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
