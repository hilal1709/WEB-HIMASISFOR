"use client";
import "@/lib/chart";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CHARTS = { bar: Bar, doughnut: Doughnut, line: Line };

/**
 * Kartu chart Sisfor DS (Chart.js).
 * <ChartCard type="bar" title="Prestasi per tingkat" data={{labels, datasets}} />
 */
export default function ChartCard({ type = "bar", title, description, data, options, loading, height = 260, className }) {
  const ChartComp = CHARTS[type];
  return (
    <Card className={cn("gap-3", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="relative">
          {loading || !data ? <Skeleton className="h-full w-full" /> : <ChartComp data={data} options={options} />}
        </div>
      </CardContent>
    </Card>
  );
}
