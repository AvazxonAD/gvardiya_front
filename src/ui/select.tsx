import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "@/utils";

export type SelectOption = {
  value: string | number;
  label: string;
};

export type SelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  options: SelectOption[];
  /** Bo'sh qiymat uchun band — masalan "Barchasi" */
  placeholder?: string;
  selectSize?: "sm" | "md";
};

/*
 * Loyihadagi barcha ochiluvchi ro'yxatlar shu qismlardan yig'iladi
 * (`@/ui` dagi `Select` ham, eski `Components/Select` ham), shuning uchun
 * hamma joyda bir xil ko'rinadi.
 *
 * Ilgari uch xil edi: brauzerning o'z `<select>` i (ro'yxati operatsion
 * tizim uslubida ochilardi), qo'lda yozilgan ro'yxat va ishlatilmagan Radix
 * varianti. Uslub `clothes` loyihasidagi tanlagichdan olingan: ko'k chegara,
 * ko'k belgilash va o'ng tomonda belgi katakchasi.
 */

const SelectRoot = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

type SelectTriggerProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Trigger
> & {
  size?: "sm" | "md";
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger({ className, children, size = "md", ...props }, ref) {
    return (
      <SelectPrimitive.Trigger
        ref={ref}
        data-slot="select-trigger"
        className={cn(
          "group flex w-full min-w-0 items-center justify-between gap-2 rounded-md border border-primary/40 bg-card text-left text-foreground shadow-xs",
          "outline-none transition-[border-color,box-shadow,transform] duration-200",
          "hover:border-primary hover:shadow-md active:scale-[0.98]",
          "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/25",
          "data-[state=open]:border-primary data-[state=open]:ring-[3px] data-[state=open]:ring-primary/20",
          "data-[empty]:text-muted-foreground data-[placeholder]:text-muted-foreground",
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/25",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-white/15 dark:bg-white/5 dark:hover:border-primary/60 dark:hover:bg-white/10",
          size === "sm" ? "h-8 px-2.5 text-[0.8125rem]" : "h-9 px-3 text-sm",
          className
        )}
        {...props}
      >
        <span className="min-w-0 flex-1 truncate">{children}</span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            aria-hidden
            className="size-4 shrink-0 text-primary/70 transition-transform duration-200 group-data-[state=open]:rotate-180 dark:text-white/50"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  }
);

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent(
  { className, children, position = "popper", sideOffset = 4, onEscapeKeyDown, ...props },
  ref
) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        // Escape faqat ro'yxatni yopsin. Modal oynalar `document` dagi
        // `keydown` ni tinglaydi — to'xtatilmasa, ro'yxat bilan birga
        // modal ham yopilib qolardi.
        onEscapeKeyDown={(e) => {
          e.stopPropagation();
          onEscapeKeyDown?.(e);
        }}
        className={cn(
          // z-[130]: modal oynalar (z-[100]) ustida ochilsin
          "relative z-[130] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg",
          "max-h-[min(24rem,var(--radix-select-content-available-height))]",
          "min-w-[max(8rem,var(--radix-select-trigger-width))] max-w-[min(28rem,var(--radix-select-content-available-width))]",
          "origin-[var(--radix-select-content-transform-origin)]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          "dark:border-white/10 dark:shadow-[0_10px_40px_rgba(79,70,229,0.25)]",
          className
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1 text-muted-foreground">
          <ChevronUp className="size-4" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1 text-muted-foreground">
          <ChevronDown className="size-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn(
        "group/item relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md py-2 pl-3 pr-2 outline-none transition-colors duration-150",
        "data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary",
        "dark:text-white/80 dark:data-[highlighted]:bg-primary dark:data-[highlighted]:text-primary-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {/* Uzun nom kesilmaydi — keyingi qatorga o'tadi. `ItemText` ga
          `className` berib bo'lmaydi (Radix uni tashlab yuboradi), shuning
          uchun katakcha `ml-auto` bilan o'ngga suriladi. */}
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span
        aria-hidden
        className={cn(
          "ml-auto flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary",
          "group-data-[state=checked]/item:bg-primary",
          "dark:group-data-[highlighted]/item:border-primary-foreground/70"
        )}
      >
        <SelectPrimitive.ItemIndicator>
          <Check className="size-3 text-primary-foreground" strokeWidth={3} />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
});

function SelectEmpty({ children }: { children?: React.ReactNode }) {
  return (
    <div className="px-3 py-6 text-center text-muted-foreground">
      {children ?? tt("Ma'lumot yo'q", "Нет данных")}
    </div>
  );
}

/*
 * Radix `Select.Item` bo'sh qiymat ("") qabul qilmaydi — berilsa, butun
 * sahifa xato bilan yiqiladi (native `<select>` esa ko'taradi). Placeholder
 * bandi ("Barchasi" kabi — tanlovni bekor qiladi) va qiymati "" bo'lgan
 * band shu kalit bilan chiziladi, tashqariga yana "" bo'lib chiqadi.
 */
const EMPTY = "__empty__";
const selectItemKey = (v: unknown) => (v == null || v === "" ? EMPTY : String(v));

/**
 * `options` ro'yxatidan yig'iladigan tanlagich.
 *
 * Interfeysi native `<select>` niki bilan bir xil qoldirilgan: `value`,
 * `placeholder` va `onChange={(e) => e.target.value}` — chaqiruvchilarni
 * o'zgartirish shart emas. Qiymat native dagidek satr bo'lib qaytadi.
 */
const Select = React.forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    className,
    options,
    placeholder,
    selectSize = "md",
    value,
    defaultValue,
    onChange,
    disabled,
    name,
    required,
    id,
    title,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
  },
  ref
) {
  const items = options.map((o) => ({ key: selectItemKey(o.value), label: o.label }));
  const emptyItem = items.find((i) => i.key === EMPTY);
  const hasEmpty = Boolean(placeholder || emptyItem);
  const toKey = (v: unknown) => (v == null || v === "" ? (hasEmpty ? EMPTY : "") : String(v));

  // `value` berilmasa — native dagidek o'z holatini saqlaydi
  const isControlled = value !== undefined;
  const [inner, setInner] = React.useState(() => toKey(defaultValue));
  const current = isControlled ? toKey(value) : inner;

  const isEmpty = current === "" || current === EMPTY;
  const label = isEmpty
    ? emptyItem?.label ?? placeholder
    : items.find((i) => i.key === current)?.label;

  const handleValueChange = (key: string) => {
    if (!isControlled) setInner(key);
    const target = { value: key === EMPTY ? "" : key, name: name ?? "" };
    onChange?.({
      target,
      currentTarget: target,
      type: "change",
      preventDefault() {},
      stopPropagation() {},
      persist() {},
    } as unknown as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <SelectRoot
      value={current}
      onValueChange={handleValueChange}
      disabled={disabled}
      name={name}
      required={required}
    >
      <SelectTrigger
        ref={ref}
        id={id}
        size={selectSize}
        className={className}
        title={title ?? label}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        data-empty={isEmpty || undefined}
      >
        <SelectValue placeholder={placeholder}>{label}</SelectValue>
      </SelectTrigger>
      <SelectContent className={selectSize === "sm" ? "text-[0.8125rem]" : "text-sm"}>
        {placeholder && !emptyItem && <SelectItem value={EMPTY}>{placeholder}</SelectItem>}
        {items.map((i) => (
          <SelectItem key={i.key} value={i.key}>
            {i.label}
          </SelectItem>
        ))}
        {!placeholder && !items.length && <SelectEmpty />}
      </SelectContent>
    </SelectRoot>
  );
});

export {
  Select,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectEmpty,
  selectItemKey,
};
