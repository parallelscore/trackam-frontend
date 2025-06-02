import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-white px-3 py-1.5 text-sm text-gray-900 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Modified Tooltip component
const Tooltip = ({
  children,
  content,
  ...props
}: {
  children: React.ReactNode;
  content: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) => {
  // Check if children is a single element or multiple
  // If it's a single element, pass it directly to TooltipTrigger with asChild
  // If multiple elements, we need a different approach
  
  if (React.Children.count(children) === 1) {
    // Single child element case - we can use asChild
    return (
      <TooltipPrimitive.Root {...props}>
        <TooltipTrigger asChild>
          {React.Children.only(children)}
        </TooltipTrigger>
        <TooltipPrimitive.Portal>
          <TooltipContent>{content}</TooltipContent>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    );
  }
  
  // Multiple children case - wrap in a span instead of Fragment
  return (
    <TooltipPrimitive.Root {...props}>
      <TooltipTrigger>
        <span className="inline-flex items-center">{children}</span>
      </TooltipTrigger>
      <TooltipPrimitive.Portal>
        <TooltipContent>{content}</TooltipContent>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};
Tooltip.displayName = TooltipPrimitive.Root.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
