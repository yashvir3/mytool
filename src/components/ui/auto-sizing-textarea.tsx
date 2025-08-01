
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AutoSizingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const AutoSizingTextarea = React.forwardRef<HTMLTextAreaElement, AutoSizingTextareaProps>(
  ({ className, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const combinedRef = (node: HTMLTextAreaElement) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    };
    
    const adjustHeight = React.useCallback(() => {
        const textarea = internalRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height to recalculate
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, []);

    React.useEffect(() => {
        adjustHeight();
    }, [props.value, adjustHeight]);

    return (
      <textarea
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden",
          className
        )}
        ref={combinedRef}
        onInput={adjustHeight}
        {...props}
      />
    );
  }
);
AutoSizingTextarea.displayName = "AutoSizingTextarea";

export { AutoSizingTextarea };
