interface CardStatProps {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
}

export default function CardStat({
  title,
  value,
  change,
  positive = false,
}: CardStatProps) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border">
      <p className="text-gray-500 text-sm">{title}</p>

      <h2 className="text-xl font-semibold mt-1">{value}</h2>

      <p
        className={`text-sm mt-1 flex items-center gap-1 ${
          positive ? "text-lime-600" : "text-red-500"
        }`}
      >
        {change}
        <span>{positive ? "↑" : "↓"}</span>
      </p>
    </div>
  );
}
