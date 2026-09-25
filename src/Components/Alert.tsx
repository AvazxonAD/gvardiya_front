import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { setClose } from "../Redux/LanguageSlice";

function Alert() {
  const dispatch = useDispatch();
  const { success, text } = useSelector((state: any) => state.lan.alert);
  const [progress, setProgress] = useState(100);
  const [hovered, setHovered] = useState(false);

  // Handle progress decrement when alert is open and not hovered
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!hovered) {
      interval = setInterval(() => {
        setProgress((prev) => (prev > 0 ? prev - 1 : 0));
      }, 20);
    }

    if (progress === 0) {
      dispatch(setClose()); // Close alert when progress reaches 0
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [open, hovered, progress, dispatch]);

  // Alert container styles based on success or error
  const alertStyles = success
    ? "bg-success" // Green for success
    : "bg-destructive"; // Red for error

  // Alert har doim eng ustida turishi kerak. Modallar `body` ga portal
  // orqali chiziladi (z-[100]); alert ham xuddi shunday `body` ga
  // chiqariladi va ulardan yuqori z-index oladi — aks holda modal
  // ochiqligida xato xabari fon ortida xiralashib qolardi.
  // `fixed` — sahifa aylantirilganda ham ekranda ko'rinib tursin.
  return createPortal(
    <div
      role="alert"
      className={`fixed bottom-6 right-6 p-3 cursor-pointer flex-col text-primary-foreground border rounded-lg shadow-md z-[10000] transition-all duration-300 ${alertStyles}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-5 px-4">
        <div className="flex flex-col">
          <div>{text}</div>
        </div>
        <button onClick={() => dispatch(setClose())} className="text-primary-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
          </svg>
        </button>
      </div>
      <div className="pt-2 rounded-b-lg">
        <div
          className="h-[4px] w-full bg-card"
          style={{
            width: `${progress}%`,
            transition: hovered ? "none" : "width 0.4s linear",
          }}
        ></div>
      </div>
    </div>,
    document.body
  );
}

export default Alert;
