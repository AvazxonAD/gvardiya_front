import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { tt } from "@/utils";
import { Button } from "@/ui";

type Props = {
  children: ReactNode;
  /** Yo'l o'zgarganda xatolik holati tozalanishi uchun */
  resetKey?: string;
};

type State = { error: Error | null };

/**
 * Bitta sahifadagi istisno butun ilovani o'chirib qo'ymasligi uchun.
 *
 * Ilgari qobiq himoyasiz edi: masalan dashboard kutilmagan API javobiga
 * duch kelsa, React butun daraxtni yechib tashlar va foydalanuvchi oq
 * ekran ko'rardi — menyu ham, chiqish tugmasi ham qolmasdi.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Sahifada xatolik:", error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    // Boshqa sahifaga o'tilganda qaytadan urinib ko'riladi
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          {tt("Sahifani ko'rsatib bo'lmadi", "Не удалось отобразить страницу")}
        </h2>
        <p className="max-w-md text-[0.8125rem] text-muted-foreground">
          {tt(
            "Kutilmagan xatolik yuz berdi. Qaytadan urinib ko'ring — muammo takrorlansa, ma'lumotlarni tekshirish kerak.",
            "Произошла непредвиденная ошибка. Попробуйте ещё раз — если повторится, нужно проверить данные."
          )}
        </p>

        <pre className="max-w-full overflow-x-auto rounded-md border border-border bg-muted/50 px-3 py-2 text-left text-[0.6875rem] text-muted-foreground">
          {error.message}
        </pre>

        <div className="mt-1 flex gap-2">
          <Button variant="secondary" onClick={() => this.setState({ error: null })}>
            <RefreshCw />
            {tt("Qaytadan urinish", "Повторить")}
          </Button>
          <Button onClick={() => location.reload()}>
            {tt("Sahifani yangilash", "Обновить страницу")}
          </Button>
        </div>
      </div>
    );
  }
}
