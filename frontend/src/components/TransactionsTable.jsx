import { useSettings } from '../context/SettingsContext';

function formatDisplayDate(dateString) {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function TransactionsTable({ rows = [], onEdit, onDelete, onAdd, showActions = false, title = 'Recent Transactions' }) {
  const { formatCurrency } = useSettings();
  const visibleRows = rows.slice(0, showActions ? rows.length : 5);

  return (
    <div className="panel table-panel">
      <div className="panel__header">
        <h3>{title}</h3>
        {showActions ? null : <button type="button" className="btn btn--primary" onClick={onAdd}>Add Expense</button>}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              {showActions ? <th>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 6 : 5} className="empty-state">No transactions yet. Add your first expense.</td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr key={row._id || `${row.title}-${row.date}`}>
                  <td>{row.title}</td>
                  <td><span className="tag tag--category">{row.category}</span></td>
                  <td>{formatDisplayDate(row.date)}</td>
                  <td className="amount amount--expense">{formatCurrency(row.amount)}</td>
                  <td>
                    <span className={`status-pill ${row.status === 'Pending' ? 'pending' : 'completed'}`}>
                      {row.status || 'Completed'}
                    </span>
                  </td>
                  {showActions ? (
                    <td>
                      <div className="table-actions">
                        <button type="button" className="table-btn table-btn--edit" onClick={() => onEdit?.(row)}>Edit</button>
                        <button type="button" className="table-btn table-btn--delete" onClick={() => onDelete?.(row._id)}>Delete</button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionsTable;
