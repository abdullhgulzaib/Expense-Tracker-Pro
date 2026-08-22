import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useSettings } from "../../context/SettingsContext";

const fallbackData = [
  { name: "Jan", total: 580 },
  { name: "Feb", total: 420 },
  { name: "Mar", total: 610 },
  { name: "Apr", total: 530 },
  { name: "May", total: 680 },
  { name: "Jun", total: 640 },
];

function SpendingLineChart({ data = fallbackData }) {
  const { formatCurrency } = useSettings();

  return (
    <div className="panel chart-panel">
      <div className="panel__header">
        <h3>Monthly Spending</h3>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SpendingLineChart;
