import { Input, Select } from "@/ui";

/**
 * Shartnoma/kirim sahifalaridagi "yorliq — qiymat" qatori.
 *
 * `selectData` loyihada `{ id, name }` shaklida keladi, `onChange` esa
 * to'g'ridan-to'g'ri `id` kutadi. Dizayn tizimidagi `Select` native
 * element bo'lgani uchun moslashtirish shu yerda — chaqiruvchi
 * fayllarni (`recipientData`) o'zgartirmaslik uchun.
 */
const Recipient = ({
  txt,
  value,
  onDoubleClick,
  type,
  selectData,
  onChange,
}: {
  txt: string;
  value: string;
  onDoubleClick?: any;
  type?: string;
  selectData?: any;
  onChange?: any;
}) => {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="flex w-1/3 shrink-0 justify-end sm:w-1/4">
        <h3 className="text-right text-[13px] font-medium text-muted-foreground">
          {txt}
        </h3>
      </div>

      <div className="min-w-0 flex-1">
        {type === "select" ? (
          <Select
            value={value ?? ""}
            onChange={(e) => onChange?.(e.target.value ? +e.target.value : "")}
            options={(selectData ?? []).map((d: any) => ({
              value: d.id,
              label: d.name,
            }))}
            placeholder="—"
          />
        ) : (
          <Input
            readOnly
            onDoubleClick={onDoubleClick}
            value={value ?? ""}
            className="cursor-default"
          />
        )}
      </div>
    </div>
  );
};

export default Recipient;
