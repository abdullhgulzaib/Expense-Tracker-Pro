import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useSettings } from '../../context/SettingsContext';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontSize: '11px',
        fontWeight: '700',
        pointerEvents: 'none',
        filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))',
      }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function CategoryPieChart({ data = [], title = 'Category Distribution' }) {
  const { formatCurrency } = useSettings();

  if (data.length === 0) {
    return (
      <div className="panel chart-panel">
        <div className="panel__header">
          <h3>{title}</h3>
        </div>
        <div className="chart-box chart-box--empty">
          <p>No expenses yet — add your first one to see this chart.</p>
        </div>
      </div>
    );
  }

  const chartData = data;
  const totalValue = chartData.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <div className="panel chart-panel">
      <div className="panel__header">
        <h3>{title}</h3>
      </div>
      <div className="chart-box pie-box">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={88}
              paddingAngle={3}
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => {
                const pct = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;
                return [`${formatCurrency(value)} (${pct}%)`, name];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CategoryPieChart;
