import { ChangeEvent, useEffect, useRef } from "react";

type ReadingInputProps = {
    val?: string,
    className?: string,
    placeholder?: string,
    rows?: number,
    readOnly?: boolean,
    onChange?: (e: string) => void
}

export const ReadingInput = ({ val, className, placeholder, rows = 1, readOnly, onChange }: ReadingInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            // Reset height to auto first to handle text deletion
            textareaRef.current.style.height = 'auto';
            // Set new height based on scrollHeight
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [val]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <div className="w-full">
            <textarea
                ref={textareaRef}
                value={val}
                onChange={handleChange}
                className={`w-full min-h-[40px] px-3 py-2 text-base bg-[#F4F6F8] dark:bg-[#162C49] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md resize-none overflow-hidden ${className ?? ""}`}
                placeholder={placeholder ?? ""}
                rows={rows}
                readOnly={readOnly}
            />
        </div>
    );
};