import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

function StatCard({ icon: Icon, title, value, change, trend = 'up' }) {
  const isPositive = trend === 'up';

  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <div className="stat-card__icon">
          <Icon size={18} />
        </div>
        <div className={`stat-card__trend ${isPositive ? 'up' : 'down'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{change}</span>
        </div>
      </div>

      <div className="stat-card__body">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
}

export default StatCard;
