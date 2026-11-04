"use client";
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/** Palet chart dibaca dari token CSS (--chart-1..5). */
export function chartPalette() {
  if (typeof window === "undefined") return ["#dc2626", "#27272a", "#f59e0b", "#2563eb", "#16a34a"];
  const s = getComputedStyle(document.documentElement);
  return [1, 2, 3, 4, 5].map((i) => s.getPropertyValue(`--chart-${i}`).trim());
}

ChartJS.defaults.font.family = "Inter, sans-serif";
ChartJS.defaults.color = "#71717a";
ChartJS.defaults.borderColor = "#f4f4f5";
ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
ChartJS.defaults.plugins.legend.labels.boxWidth = 8;
ChartJS.defaults.plugins.tooltip.backgroundColor = "#18181b";
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
ChartJS.defaults.animation.duration = 900;
ChartJS.defaults.maintainAspectRatio = false;

export default ChartJS;
