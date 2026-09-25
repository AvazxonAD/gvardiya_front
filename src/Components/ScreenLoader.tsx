import { Loader2 } from "lucide-react";

type Props = {
  title?: string;
};

/** Butun ekranni to'sadigan yuklanish holati */
const ScreenLoader = ({ title }: Props) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-3 bg-foreground/40 backdrop-blur-[2px]"
    >
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-6 py-5 shadow-lg">
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
        {title && (
          <p className="text-[0.8125rem] font-medium text-foreground">{title}</p>
        )}
      </div>
    </div>
  );
};

export default ScreenLoader;
