import Input from "@/Components/Input";
import Select from "@/Components/Select";

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
    <div className="flex items-center my-3">
      <div className="flex justify-end w-1/4">
        <h3 className="font-[500] text-mytextcolor">{txt}</h3>
      </div>
      <div className="w-3/4 ms-2">
        {type === "select" ? (
          <Select
            className="w-full border"
            value={value}
            onChange={onChange}
            data={selectData}
          />
        ) : (
          <Input
            onDoubleClick={onDoubleClick}
            readonly
            className="w-full border"
            v={value ?? ""}
          />
        )}
      </div>
    </div>
  );
};

export default Recipient;
