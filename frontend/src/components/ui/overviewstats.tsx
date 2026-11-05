import { useEffect, useState } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
);

type Point = { label: string; count: number };

const COLORS = [
  "#4169E1",
  "#8DB3F2",
  "#4CC38A",
  "#F6B832",
  "#9B6EDB",
  "#E46BA7",
  "#5CC8D7",
  "#F17C67",
];

const percentagePlugin = {
  id: "percentagePlugin",
  afterDraw(chart: any) {
    const { ctx } = chart;
    const dataset = chart.data.datasets[0];
    const total = dataset.data.reduce((s: number, v: number) => s + v, 0);
    if (total === 0) return;

    chart.getDatasetMeta(0).data.forEach((arc: any, i: number) => {
      const pct = ((dataset.data[i] / total) * 100).toFixed(0);
      const angle = (arc.startAngle + arc.endAngle) / 2;
      const radius = (arc.innerRadius + arc.outerRadius) / 2;

      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${pct}%`,
        arc.x + Math.cos(angle) * radius,
        arc.y + Math.sin(angle) * radius,
      );
      ctx.restore();
    });
  },
};

export default function OverviewStats() {
  const [admissions, setAdmissions] = useState<Point[]>([]);
  const [classes, setClasses] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    Promise.all([
      fetch("/api/stats/admissions", { headers }).then((r) => r.json()),
      fetch("/api/stats/class-distribution", { headers }).then((r) => r.json()),
    ])
      .then(([a, c]) => {
        setAdmissions(a);
        setClasses(
          Array.isArray(c)
            ? c.map((item: any) => ({
                label: `Class ${item.name}`,
                count: item._count?.students ?? 0,
              }))
            : [],
        );
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4">
        <div className="flex-1 my-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="h-5 w-40 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-56 rounded bg-gray-100" />
            <div className="mt-8 h-70 rounded bg-gray-50" />
          </div>
        </div>
        <div className="w-[40%] my-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-72 items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4 rounded-2xl border border-red-100 bg-white p-6">
        <p className="text-sm text-red-500">Failed to load statistics.</p>
      </div>
    );
  }

  // ---------- Admissions (line) ----------
  const labels = admissions.map((a) => a.label);
  const values = admissions.map((a) => a.count);
  const current = values.at(-1) ?? 0;
  const previous = values.at(-2) ?? 0;
  const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0;

  const lineData = {
    labels,
    datasets: [
      {
        label: "Admissions",
        data: values,
        borderColor: "#6366F1",
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
        pointHoverBackgroundColor: "#ffffff",
        pointHoverBorderColor: "#6366F1",
        tension: 0.4,
        fill: true,
        backgroundColor: (context: any) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return "rgba(99, 102, 241, 0.08)";
          const g = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );
          g.addColorStop(0, "rgba(99, 102, 241, 0.25)");
          g.addColorStop(1, "rgba(99, 102, 241, 0)");
          return g;
        },
      },
    ],
  };

  const lineOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#ffffff",
        bodyColor: "#E5E7EB",
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        titleFont: { size: 12, weight: "600" },
        bodyFont: { size: 13, weight: "500" },
        callbacks: { label: (c: any) => `${c.parsed.y} Admissions` },
      },
    },
    scales: {
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: { color: "#9CA3AF", font: { size: 11 }, padding: 8 },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: "rgba(229, 231, 235, 0.6)", drawTicks: false },
        ticks: {
          color: "#9CA3AF",
          font: { size: 11 },
          padding: 10,
          precision: 0,
        },
      },
    },
  };

  // ---------- Class & section (doughnut) ----------
  const donutData = {
    labels: classes.map((c) => c.label),
    datasets: [
      {
        data: classes.map((c) => c.count),
        backgroundColor: classes.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 6,
      },
    ],
  };

  const donutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "48%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 14,
          color: "#4b5563",
          font: { size: 12, weight: "500" as const },
          generateLabels: (chart: any) => {
            const ds = chart.data.datasets[0];
            return chart.data.labels.map((label: string, i: number) => ({
              text: `${label}          ${ds.data[i]}`,
              fillStyle: ds.backgroundColor[i],
              strokeStyle: ds.backgroundColor[i],
              hidden: false,
              index: i,
            }));
          },
        },
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (c: any) => {
            const total = c.dataset.data.reduce(
              (s: number, v: number) => s + v,
              0,
            );
            const pct = total > 0 ? ((c.raw / total) * 100).toFixed(0) : "0";
            return ` ${c.raw} students (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Admissions */}
      <div className="min-w-0 flex-1 my-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Students Admitted
            </h2>
            <p className="mt-1 text-sm text-gray-400">Last 6 months</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-medium text-gray-900">{current}</div>
            <div
              className={`mt-1 text-xs font-medium ${
                growth >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {growth >= 0 ? "+" : ""}
              {growth.toFixed(1)}%
              <span className="ml-1 text-gray-400">vs last month</span>
            </div>
          </div>
        </div>

        <div className="mt-6 h-70">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Class & Section */}
      <div className="my-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:w-[40%]">
        <div className="mb-2">
          <h2 className="text-sm font-semibold text-gray-800">
            Students by Class & Section
          </h2>
        </div>

        {classes.length === 0 ? (
          <div className="flex h-72 items-center justify-center">
            <p className="text-sm text-gray-400">No student data available</p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <Doughnut
              data={donutData}
              options={donutOptions}
              plugins={[percentagePlugin]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
