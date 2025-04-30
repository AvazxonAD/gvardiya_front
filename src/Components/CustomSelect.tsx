/** @format */

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { tt } from "@/utils";
import { useEffect, useState } from "react";

const CustomSelect = ({
	data,
	defaultValue,
	label,
	ru,
	onChange,
}: {
	data: any[];
	defaultValue?: string;
	label?: string;
	ru?: string;
	property?: string;
	name?: string;
	onChange?: (value: string) => void;
}) => {
	const [value, setValue] = useState(String(defaultValue));

	useEffect(() => {
		setValue(String(defaultValue));
	}, [data]);
	return (
		<div className='grid gap-3'>
			{ru && label && <Label>{tt(label, ru)}</Label>}
			<Select
				value={value}
				onValueChange={(value) => {
					setValue(value);
					if (onChange) onChange(value);
				}}>
				<SelectTrigger>
					<SelectValue placeholder='Kerakli qiymatni tanlang!' />
				</SelectTrigger>
				<SelectContent>
					{data.length > 0 &&
						data.map((e, i) => {
							return (
								<SelectItem
									key={i}
									value={e.id + ""}>
									{e.name}
								</SelectItem>
							);
						})}
				</SelectContent>
			</Select>
		</div>
	);
};

export default CustomSelect;
