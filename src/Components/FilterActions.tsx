import { useState } from "react";
import { RotateCcw, RotateCw } from "lucide-react";

import { Button } from "@/ui";
import { cn } from "@/lib/utils";
import { tt } from "@/utils";

type Props = {
  /** Joriy filtrlar bilan ro'yxatni serverdan qayta oladi. */
  onRefresh: () => unknown;
  /** Qidiruv, filtrlar va saralashni boshlang'ich holatga qaytaradi. */
  onClear?: () => void;
};

/**
 * Filtrli har bir ro'yxat uchun "Yangilash" va "Tozalash" tugmalari.
 * Toolbar ichida filtrlardan keyin qo'yiladi.
 */
function FilterActions({ onRefresh, onClear }: Props) {
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onRefresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={refresh}
        disabled={loading}
        title={tt("Ma'lumotni yangilash", "Обновить данные")}
      >
        <RotateCw className={cn(loading && "animate-spin")} />
        {tt("Yangilash", "Обновить")}
      </Button>
      {onClear && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          title={tt("Filtrlarni tozalash", "Сбросить фильтры")}
        >
          <RotateCcw />
          {tt("Tozalash", "Очистить")}
        </Button>
      )}
    </>
  );
}

export default FilterActions;
