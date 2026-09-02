import { useNavigate } from "react-router-dom";
import { Compass, Home } from "lucide-react";

import { tt } from "@/utils";
import { Button } from "@/ui";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-none bg-muted text-muted-foreground">
        <Compass className="size-6" />
      </span>

      <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="text-xl font-semibold text-foreground">
        {tt("Sahifa mavjud emas", "Страница не существует")}
      </h1>
      <p className="max-w-sm text-[13px] text-muted-foreground">
        {tt(
          "Kechirasiz, siz izlayotgan sahifa topilmadi.",
          "Извините, страница не найдена."
        )}
      </p>

      <Button className="mt-2" onClick={() => navigate("/")}>
        <Home />
        {tt("Bosh sahifa", "На главную")}
      </Button>
    </div>
  );
};

export default ErrorPage;
