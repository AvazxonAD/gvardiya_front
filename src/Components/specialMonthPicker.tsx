import Icon from "@/assets/icons";
import { cn } from "@/lib/utils";
import { tt } from "@/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const uzbekMonths = [
  "yan",
  "fev",
  "mart",
  "apr",
  "may",
  "iyun",
  "iyul",
  "avg",
  "sent",
  "okt",
  "noy",
  "dek",
];

const russianMonths = [
  "янв",
  "фев",
  "мар",
  "апр",
  "май",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

function formatMonthYear(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function SpecialMonthPicker({
  ru,
  label,

  defaultValue,

  onChange,
  error = false,
}: {
  label?: string;
  ru?: string;
  defaultValue?: string;
  onChange?: (date: string) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  name?: string;
  error?: any;
}) {
  const initialDate = defaultValue ? new Date(defaultValue) : new Date();
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    initialDate
  );
  const [open, setOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = React.useState(
    initialDate.getFullYear()
  );

  const langType = Number(localStorage.getItem("lang") || "0");
  const isRussian = langType > 1;

  const handleYearChange = (increment: number) => {
    setCurrentYear((prev) => prev + increment);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentYear, monthIndex, 1);
    setSelectedDate(newDate);
    if (onChange) {
      onChange(formatMonthYear(newDate));
    }
    setOpen(false);
  };

  // Sync defaultValue changes
  React.useEffect(() => {
    if (defaultValue) {
      const newDate = new Date(defaultValue);
      setSelectedDate(newDate);
      setCurrentYear(newDate.getFullYear());
    }
  }, [defaultValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="grid gap-1 items-start">
          {label && (
            <Label
              className={cn(
                "font-bold text-xs",
                error && !selectedDate ? "text-[#F23D53]" : "text-[#636566]"
              )}>
              {tt(label, ru ?? "")}
            </Label>
          )}
          <Button
            type="button"
            variant="outline"
            className={cn(
              " w-full text-mytextcolor border-mynavactiveborder bg-mycalendarbg max-w-full justify-start text-left font-normal h-10",
              !selectedDate && "text-muted-foreground",
              error && !selectedDate ? "border-[#F23D53]" : ""
            )}>
            {selectedDate ? (
              `${
                isRussian
                  ? russianMonths[selectedDate.getMonth()]
                  : uzbekMonths[selectedDate.getMonth()]
              }, ${selectedDate.getFullYear()}`
            ) : (
              <span>{tt("Oyni tanlang", "Выберите месяц")}</span>
            )}
            <Icon name="calendar" />
          </Button>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-2">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleYearChange(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-semibold">{currentYear}</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleYearChange(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(isRussian ? russianMonths : uzbekMonths).map((month, index) => (
            <Button
              key={month}
              variant="outline"
              className={cn(
                "h-9",
                selectedDate?.getMonth() === index &&
                  selectedDate?.getFullYear() === currentYear
                  ? "bg-primary text-primary-foreground"
                  : ""
              )}
              onClick={() => handleMonthSelect(index)}>
              {month}
            </Button>
          ))}
        </div>
      </PopoverContent>

      {error && !selectedDate && (
        <div className="text-[12px] leading-[14.52px] font-[600] flex justify-start items-end text-[#F23D53]">
          {error}
        </div>
      )}
    </Popover>
  );
}

export default SpecialMonthPicker;
