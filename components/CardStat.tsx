import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface CardStatProps {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  arrow?: "up" | "down" | "neutral";
  valueClassName?: string;
}

export default function CardStat({
  title,
  value,
  change,
  positive = false,
  arrow,
  valueClassName,
}: CardStatProps) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
      <p className="text-gray-500 text-sm">{title}</p>

      <h2 className={`text-xl font-semibold mt-1 ${valueClassName || ""}`}>
        {value}
      </h2>

      <p
        className={`text-sm mt-1 flex items-center gap-1 ${
          positive ? "text-lime-600" : positive === false ? "text-red-500" : "text-gray-500"
        }`}
      >
        {change}
        <span>
          {arrow === "up" ? (
            <ArrowUp className="h-4 w-4" />
          ) : arrow === "down" ? (
            <ArrowDown className="h-4 w-4" />
          ) : arrow === "neutral" ? (
            <Minus className="h-4 w-4" />
          ) : positive ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </span>
      </p>
    </div>
  );
}
