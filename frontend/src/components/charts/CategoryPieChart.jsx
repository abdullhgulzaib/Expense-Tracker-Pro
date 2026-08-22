import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useSettings } from '../../context/SettingsContext';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

function CategoryPieChart({ data = [] }) {
  const { formatCurrency } = useSettings();

  if (data.length === 0) {
    return (
      <div className="panel chart-panel">
        <div className="panel__header">
          <h3>Category Distribution</h3>
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
        <h3>Category Distribution</h3>
      </div>
      <div className="chart-box pie-box">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={80} paddingAngle={3}>
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CategoryPieChart;
