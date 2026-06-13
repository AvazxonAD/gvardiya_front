/** @format */

// Eslatma: bu komponent endi yangi modal-kalendar `DateInput` ustidagi ingichka
// qatlam (wrapper). Loyiha bo'ylab barcha mavjud `SpecialDatePicker` chaqiruvlari
// o'zgarishsiz yangi date modaldan foydalanadi. Props interfeysi eski bilan bir xil.

import { DateInput } from "@/Components/ui/date-input";

interface DatePickerProps {
  label?: string;
  ru?: string;
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (date: string, formattedDate: string) => void;
  error?: string | boolean;
  className?: string;
  disabled?: boolean;
}

export function SpecialDatePicker(props: DatePickerProps) {
  return <DateInput {...props} />;
}

export default SpecialDatePicker;
