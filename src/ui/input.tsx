import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const fieldBase = [
  "w-full min-w-0 rounded-md border border-input bg-card text-foreground",
  "placeholder:text-muted-foreground/70",
  "shadow-xs transition-[border-color,box-shadow] duration-150 outline-none",
  "hover:border-muted-foreground/40",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
  "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/25",
];

const inputVariants = cva(fieldBase, {
  variants: {
    inputSize: {
      sm: "h-8 px-2.5 text-[13px]",
      md: "h-9 px-3 text-sm",
      lg: "h-10 px-3.5 text-sm",
    },
  },
  defaultVariants: { inputSize: "md" },
});

export type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants> & {
    /** Chap tomonda turadigan ikonka (lucide) */
    startIcon?: React.ReactNode;
    /** O'ng tomonda turadigan element — tozalash, ko'z, birlik va h.k. */
    endIcon?: React.ReactNode;
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, inputSize, startIcon, endIcon, type, onWheel, ...props },
  ref
) {
  // Sichqoncha g'ildiragi raqamli maydon qiymatini o'zgartirmasin
  const handleWheel = React.useCallback(
    (e: React.WheelEvent<HTMLInputElement>) => {
      if (type === "number") e.currentTarget.blur();
      onWheel?.(e);
    },
    [type, onWheel]
  );

  const field = (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      onWheel={handleWheel}
      className={cn(
        inputVariants({ inputSize }),
        startIcon && "pl-9",
        endIcon && "pr-9",
        className
      )}
      {...props}
    />
  );

  if (!startIcon && !endIcon) return field;

  return (
    <div className="relative w-full">
      {startIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground [&_svg]:size-4">
          {startIcon}
        </span>
      )}
      {field}
      {endIcon && (
        <span className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground [&_svg]:size-4">
          {endIcon}
        </span>
      )}
    </div>
  );
});

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(fieldBase, "min-h-20 px-3 py-2 text-sm", className)}
      {...props}
    />
  );
});

const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<"label"> & { required?: boolean }
>(function Label({ className, children, required, ...props }, ref) {
  return (
    <label
      ref={ref}
      data-slot="label"
      className={cn(
        "flex select-none items-center gap-1 text-[13px] font-medium leading-none text-foreground",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-destructive">*</span>}
    </label>
  );
});

/**
 * Label + maydon + xato matnini bir tekis joylashtiradi.
 *
 * Bitta bola element berilsa, unga `id`, `aria-invalid` va
 * `aria-describedby` avtomatik ulanadi — label bosilganda maydon
 * fokuslanadi va skrin-riderlar xatoni o'qiydi.
 */
function Field({
  label,
  error,
  hint,
  required,
  htmlFor,
  className,
  children,
}: {
  label?: React.ReactNode;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const autoId = React.useId();
  const messageId = `${autoId}-msg`;

  const child = React.isValidElement(children) ? children : null;
  const fieldId =
    htmlFor ?? (child?.props as any)?.id ?? (child ? autoId : undefined);

  const control =
    child && !htmlFor
      ? React.cloneElement(child, {
          id: fieldId,
          "aria-invalid": error ? true : (child.props as any)["aria-invalid"],
          "aria-describedby":
            error || hint
              ? messageId
              : (child.props as any)["aria-describedby"],
        } as any)
      : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}
      {control}
      {error ? (
        <p id={messageId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export { Input, Textarea, Label, Field, inputVariants };
