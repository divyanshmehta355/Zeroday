"use client";

interface HeatmapProps {
  data: Record<string, number>;
}

export function Heatmap({ data }: HeatmapProps) {
  const today = new Date();
  const months = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const monthName = d.toLocaleString("default", { month: "short" });

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthIndex + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      days.push({
        date: dateStr,
        count: data[dateStr] || 0,
      });
    }

    months.push({ name: monthName, year, days });
  }

  const getColor = (count: number) => {
    if (count === 0) return "bg-[#161b22]";
    if (count <= 2) return "bg-[#0e4429]";
    if (count <= 5) return "bg-[#006d32]";
    if (count <= 10) return "bg-[#26a641]";
    return "bg-[#39d353]";
  };

  return (
    <div className="w-full">
      {}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {months.map((month) => {
          const monthTotal = month.days.reduce(
            (acc, curr) => acc + curr.count,
            0
          );

          return (
            <div
              key={`${month.name}-${month.year}`}
              className="flex-shrink-0 bg-[#0d1117] border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-all group"
            >
              {}
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-300">
                  {month.name}
                </span>
                <span className="text-[10px] font-mono text-gray-600">
                  {month.year}
                </span>
              </div>

              {}
              {}
              <div className="grid grid-rows-7 grid-flow-col gap-1 h-[80px] w-max">
                {month.days.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.count} solved`}
                    className={`w-[10px] h-[10px] rounded-[2px] ${getColor(
                      day.count
                    )} hover:scale-125 transition-transform`}
                  />
                ))}
              </div>

              {}
              <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">
                  Total
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    monthTotal > 0 ? "text-white" : "text-gray-600"
                  }`}
                >
                  {monthTotal}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
