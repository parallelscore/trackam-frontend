import * as React from "react"
import { cn } from "../../utils/utils"

// Form component
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
    ({ className, ...props }, ref) => {
        return (
            <form
                ref={ref}
                className={cn("space-y-6", className)}
                {...props}
            />
        )
    }
)
Form.displayName = "Form"

// Form section component
export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
    ({ className, title, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("space-y-4", className)}
                {...props}
            >
                <h3 className="text-lg font-medium text-secondary">{title}</h3>
                {children}
            </div>
        )
    }
)
FormSection.displayName = "FormSection"

// Form item component
export interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("space-y-2", className)}
                {...props}
            />
        )
    }
)
FormItem.displayName = "FormItem"

// Form label component
export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
    ({ className, ...props }, ref) => {
        return (
            <label
                ref={ref}
                className={cn(
                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    className
                )}
                {...props}
            />
        )
    }
)
FormLabel.displayName = "FormLabel"

// Form control component
export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("mt-2", className)}
                {...props}
            />
        )
    }
)
FormControl.displayName = "FormControl"

// Form description component
export interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
    ({ className, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn("text-sm text-muted-foreground", className)}
                {...props}
            />
        )
    }
)
FormDescription.displayName = "FormDescription"

// Form error message component
export interface FormErrorMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormErrorMessage = React.forwardRef<HTMLParagraphElement, FormErrorMessageProps>(
    ({ className, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn("text-sm font-medium text-destructive", className)}
                {...props}
            />
        )
    }
)
FormErrorMessage.displayName = "FormErrorMessage"

export {
    Form,
    FormSection,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormErrorMessage,
}