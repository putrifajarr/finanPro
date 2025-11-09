export default function CardStat({ title, value, change, positive }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-xl font-semibold mt-2">{value}</h2>
      <p
        className={`text-sm mt-1 ${
          positive ? "text-lime-600" : "text-red-500"
        }`}
      >
        {change} {positive ? "↑" : "↓"}
      </p>
    </div>
  );
}
