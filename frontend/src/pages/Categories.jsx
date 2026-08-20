import { useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';

function Categories() {
  const { state } = useExpenses();

  const categoryBreakdown = useMemo(() => {
    const totals = state.expenses.reduce((acc, expense) => {
      const category = expense.category || 'Uncategorized';
      const amount = Number(expense.amount || 0);

      if (!acc[category]) {
        acc[category] = { category, total: 0, count: 0 };
      }

      acc[category].total += amount;
      acc[category].count += 1;

      return acc;
    }, {});

    const items = Object.values(totals).sort((a, b) => b.total - a.total);
    const maxTotal = items.length > 0 ? Math.max(...items.map((item) => item.total)) : 1;

    return items.map((item) => ({
      ...item,
      percentage: (item.total / maxTotal) * 100,
    }));
  }, [state.expenses]);

  const totalSpent = categoryBreakdown.reduce((sum, item) => sum + item.total, 0);

  if (state.loading) {
    return <div className="page"><div className="panel empty-panel"><p>Loading categories...</p></div></div>;
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <p className="eyebrow">Spending overview</p>
          <h1>Categories</h1>
        </div>
      </div>

      <div className="category-summary-grid">
        <div className="panel stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">Top category</span>
          </div>
          <div className="stat-card__body">
            <h3>{categoryBreakdown[0]?.category || 'No data'}</h3>
            <p>${(categoryBreakdown[0]?.total || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="panel stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">Category count</span>
          </div>
          <div className="stat-card__body">
            <h3>{categoryBreakdown.length}</h3>
            <p>active groups</p>
          </div>
        </div>

        <div className="panel stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">Total spent</span>
          </div>
          <div className="stat-card__body">
            <h3>${totalSpent.toFixed(2)}</h3>
            <p>across all categories</p>
          </div>
        </div>
      </div>

      <div className="panel category-panel">
        <div className="panel__header">
          <h3>Category breakdown</h3>
        </div>

        <div className="category-list">
          {categoryBreakdown.length === 0 ? (
            <div className="empty-panel small-empty-panel">
              <p>No categories yet. Add your first expense.</p>
            </div>
          ) : (
            categoryBreakdown.map((item) => (
              <div className="category-item" key={item.category}>
                <div className="category-item__meta">
                  <div>
                    <span className="tag tag--category">{item.category}</span>
                  </div>
                  <strong>${item.total.toFixed(2)}</strong>
                </div>

                <div className="category-item__progress">
                  <span style={{ width: `${item.percentage}%` }} />
                </div>

                <div className="category-item__footer">
                  <span>{item.count} transactions</span>
                  <span>{Math.round(item.percentage)}% of top category</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Categories;
