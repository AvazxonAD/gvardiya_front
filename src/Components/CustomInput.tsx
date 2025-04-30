/** @format */

import { tt } from "@/utils";
import {
  ChangeEventHandler,
  FocusEventHandler,
  HTMLInputTypeAttribute,
} from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const CustomInput = ({
  t,
  label,
  onChange,
  onBlur,
  name,
  defaultValue,
  ru,
}: {
  ru?: string;
  t?: HTMLInputTypeAttribute;
  label?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  name?: string;
  defaultValue?: any;
}) => {
  return (
    <div className="grid gap-3">
      {label && ru && <Label>{tt(label, ru)}</Label>}
      {t === "number" ? (
        <Input
          name={name}
          className="h-10 w-full"
          type={t || "text"}
          onChange={onChange}
          onBlur={onBlur}
          value={defaultValue}
        />
      ) : (
        <Input
          name={name}
          className="h-10 w-full"
          type={t || "text"}
          onChange={onChange}
          onBlur={onBlur}
          defaultValue={defaultValue}
        />
      )}
    </div>
  );
};

export default CustomInput;
