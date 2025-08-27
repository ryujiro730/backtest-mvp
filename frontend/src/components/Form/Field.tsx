import React from "react";
export default function Field ({ label, children }:{label:string; children:React.ReactNode}) {
    return(
        <label classname="flex flex-col">
            <span className="text-sm text-gray-600">{label}</span>
            {children}
        </label>
    );
}