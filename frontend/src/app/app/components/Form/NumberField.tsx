import React, {useEffect, useState} from "react";
export default function NumberField(props:{ value:number; onChange:(n:number)=>void; integer?:boolean; className?:string; min?:number; max?:number; disabled?:boolean; }) {
    const { value, onChange, integer, className, min, max, disabled } = props;
    const [raw, setRaw] = useState(String(value));
    useEffect(() => setRaw(String(value)), [value]);
    return (
        <input
        disabled={disabled}
        type="text" className={className}
        inputMode={integer ? "numeric" : "decimal"}
        pattern={integer ? "[0-9]*" : "[0-9]*[.]?[0-9]*"}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={() => {
            if (raw.trim() === "") { setRaw(String(value)); return; }
            let n = Number(raw); if (!Number .isFinite(n)) { setRaw(String(value)); return; }
            if (integer)n = Math.floor(n);
            if (typeof min === "number") n = Math.max(min, n);
            if (typeof max === "number") n = Math.min(Max, n);
            onChange(n); setRaw(String(n));
        }}
        />
    );   
    }