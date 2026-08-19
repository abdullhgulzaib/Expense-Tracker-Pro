import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const data = [
  { name: 'Food', value: 420 },
  { name: 'Travel', value: 280 },
  { name: 'Bills', value: 310 },
  { name: 'Shopping', value: 180 },
  { name: 'Health', value: 140 },
];

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

function CategoryPieChart() {
  return (
    <div className="panel chart-panel">
      <div className="panel__header">
        <h3>Category Distribution</h3>
      </div>
      <div className="chart-box pie-box">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={42} outerRadius={80} paddingAngle={3}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CategoryPieChart;
