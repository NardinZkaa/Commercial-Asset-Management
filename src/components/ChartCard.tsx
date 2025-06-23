import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  chartConfig: ChartConfiguration;
  className?: string;
}

export default function ChartCard({ title, icon, chartConfig, className = '' }: ChartCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create new chart
    chartRef.current = new Chart(canvasRef.current, chartConfig);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartConfig]);

  return (
    <div className={`bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        {icon}
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="h-64">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}