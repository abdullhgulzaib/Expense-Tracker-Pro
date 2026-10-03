import { ArrowDownRight, ArrowUpRight, Calendar, Clock } from 'lucide-react';

function StatCard({ icon: Icon, title, value, change, trend = 'up', footer }) {
  const isPositive = trend === 'up';
  const isDown = trend === 'down';
  const isDay = trend === 'day';
  const isToday = trend === 'today';

  const getTrendIcon = () => {
    if (isPositive) return <ArrowUpRight size={14} />;
    if (isDown) return <ArrowDownRight size={14} />;
    if (isToday) return <Calendar size={13} />;
    if (isDay) return <Clock size={13} />;
    return null;
  };

  const getTrendClass = () => {
    if (isPositive) return 'up';
    if (isDown) return 'down';
    if (isToday) return 'today';
    if (isDay) return 'day';
    return '';
  };

  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <div className="stat-card__icon">
          <Icon size={18} />
        </div>
        {change && (
          <div className={`stat-card__trend ${getTrendClass()}`}>
            {getTrendIcon()}
            <span>{change}</span>
          </div>
        )}
      </div>

      <div className="stat-card__body">
        <h3>{value}</h3>
        <p>{title}</p>
        {footer && <div className="stat-card__footer">{footer}</div>}
      </div>
    </div>
  );
}

export default StatCard;
