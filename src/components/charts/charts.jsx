"use client";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Filler, Tooltip, Legend);

const VARS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"];

/** Baca palet chart dari design tokens (ikut berubah saat dark mode). */
export function useChartTheme() {
  const [theme, setTheme] = useState({ colors: ["#dc2626", "#27272a", "#f87171", "#a1a1aa", "#2563eb"], text: "#71717a", grid: "#e4e4e7" });
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    setTheme({
      colors: VARS.map((v) => css.getPropertyValue(v).trim()),
      text: css.getPropertyValue("--muted-foreground").trim(),
      grid: css.getPropertyValue("--border").trim(),
    });
  }, []);
  return theme;
}

function baseOptions(t, extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { labels: { color: t.text, usePointStyle: true, boxWidth: 8, font: { family: "Inter" } } },
      tooltip: { backgroundColor: "#18181b", padding: 10, cornerRadius: 8, titleFont: { family: "Inter" }, bodyFont: { family: "Inter" } },
    },
    ...extra,
  };
}

const axes = (t) => ({
  x: { ticks: { color: t.text }, grid: { display: false } },
  y: { ticks: { color: t.text }, grid: { color: t.grid }, border: { display: false }, beginAtZero: true },
});

/** data: { labels: [], datasets: [{ label, data }] } — warna diisi otomatis dari token. */
export function BarChart({ data, height = 280, options }) {
  const t = useChartTheme();
  const ds = data.datasets.map((d, i) => ({ borderRadius: 6, backgroundColor: t.colors[i % 5], ...d }));
  return (
    <div style={{ height }}>
      <Bar data={{ ...data, datasets: ds }} options={baseOptions(t, { scales: axes(t), ...options })} />
    </div>
  );
}

export function LineChart({ data, height = 280, options }) {
  const t = useChartTheme();
  const ds = data.datasets.map((d, i) => ({
    borderColor: t.colors[i % 5],
    backgroundColor: t.colors[i % 5] + "22",
    fill: true,
    tension: 0.35,
    pointRadius: 3,
    ...d,
  }));
  return (
    <div style={{ height }}>
      <Line data={{ ...data, datasets: ds }} options={baseOptions(t, { scales: axes(t), ...options })} />
    </div>
  );
}

export function DoughnutChart({ data, height = 280, options }) {
  const t = useChartTheme();
  const ds = data.datasets.map((d) => ({ backgroundColor: t.colors, borderWidth: 0, ...d }));
  return (
    <div style={{ height }}>
      <Doughnut data={{ ...data, datasets: ds }} options={baseOptions(t, { cutout: "68%", ...options })} />
    </div>
  );
}
