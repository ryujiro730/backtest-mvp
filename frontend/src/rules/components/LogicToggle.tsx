"use client";

type Logic = "AND" | "OR";

export function LogicToggle({
  value,
  onChange,
}: {
  value: Logic;
  onChange: (v: Logic) => void;
}) {
  const isAnd = value === "AND";

  return (
    <div className="flex items-center gap-4 flex-shrink-0">
      <span className="text-xs text-gray-600">
        {isAnd ? "すべて満たす" : "いずれか"}
      </span>
<button
  type="button"
  onClick={() => onChange(isAnd ? "OR" : "AND")}
  style={{
    backgroundColor: "red",
    border: "2px solid blue",
    width: 40,
    height: 20,
  }}
>
  X
</button>


      <span className="text-xs font-medium text-gray-800">
        {isAnd ? "AND" : "OR"}
      </span>
    </div>
  );
}
