import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { useSettings } from "../../context/SettingsContext";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

function CategoryBarChart({ data = [] }) {
  const { formatCurrency } = useSettings();

  if (data.length === 0) {
    return (
      <div className="panel chart-panel">
        <div className="panel__header">
          <h3>Category Comparison</h3>
        </div>
        <div className="chart-box chart-box--empty">
          <p>No expenses yet — add your first one to see this chart.</p>
        </div>
      </div>
    );
  }

  const chartData = data;

  return (
    <div className="panel chart-panel">
      <div className="panel__header">
        <h3>Category Comparison</h3>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="total" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CategoryBarChart;
