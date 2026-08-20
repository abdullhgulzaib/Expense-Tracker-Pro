import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useSettings } from '../../context/SettingsContext';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

function CategoryPieChart({ data = [] }) {
  const { formatCurrency } = useSettings();
  const chartData = data.length > 0 ? data : [
    { name: 'Food', value: 420 },
    { name: 'Travel', value: 280 },
    { name: 'Bills', value: 310 },
    { name: 'Shopping', value: 180 },
    { name: 'Health', value: 140 },
  ];

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
