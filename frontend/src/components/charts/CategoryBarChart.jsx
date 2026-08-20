import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { useSettings } from '../../context/SettingsContext';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

function CategoryBarChart({ data = [] }) {
  const { formatCurrency } = useSettings();
  const chartData = data.length > 0 ? data : [
    { name: 'Food', total: 420 },
    { name: 'Bills', total: 310 },
    { name: 'Travel', total: 280 },
    { name: 'Shopping', total: 180 },
    { name: 'Health', total: 140 },
  ];

  return (
    <div className="panel chart-panel">
      <div className="panel__header">
        <h3>Category Comparison</h3>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
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
