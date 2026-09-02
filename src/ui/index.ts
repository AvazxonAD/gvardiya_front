/**
 * Tadbir-Hisob design system.
 *
 * Yangi ekranlar faqat shu yerdan import qiladi:
 *   import { Button, Card, Input } from "@/ui";
 *
 * Eski `@/Components/*` to'plami ko'chirish tugagunicha saqlanadi,
 * lekin yangi kodda ishlatilmaydi.
 */
export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";

export { Input, Textarea, Label, Field, inputVariants } from "./input";
export type { InputProps } from "./input";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";

export { Badge, badgeVariants } from "./badge";
export { Skeleton } from "./skeleton";
export { Modal } from "./modal";
export type { ModalProps } from "./modal";

export {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
} from "./menu";

export { useTheme, ThemeSync } from "./theme";
export type { Theme } from "./theme";

export {
  BarList,
  Donut,
  ColumnChart,
  Legend,
  chartColor,
  CHART_TONES,
} from "./chart";
export type { BarListItem, DonutSlice, LegendItem, Column } from "./chart";

export {
  StatCard,
  PageHeader,
  EmptyState,
  DataTable,
  MiniBar,
} from "./patterns";
export type { Column as TableColumn } from "./patterns";

export { Select } from "./select";
export type { SelectOption, SelectProps } from "./select";

export {
  ListCard,
  Toolbar,
  ToolbarSpacer,
  SummaryTile,
  SummaryRow,
} from "./list";
