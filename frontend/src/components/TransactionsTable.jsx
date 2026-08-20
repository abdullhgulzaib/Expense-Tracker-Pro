function formatDisplayDate(dateString) {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function TransactionsTable({ rows = [] }) {
  const visibleRows = rows.slice(0, 5);

  return (
    <div className="panel table-panel">
      <div className="panel__header">
        <h3>Recent Transactions</h3>
        <button className="btn btn--primary">Add Expense</button>
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
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">No transactions yet. Add your first expense.</td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr key={row._id || `${row.title}-${row.date}`}>
                  <td>{row.title}</td>
                  <td><span className="tag tag--category">{row.category}</span></td>
                  <td>{formatDisplayDate(row.date)}</td>
                  <td className="amount amount--expense">-${Number(row.amount || 0).toFixed(2)}</td>
                  <td>
                    <span className={`status-pill ${row.status === 'Pending' ? 'pending' : 'completed'}`}>
                      {row.status || 'Completed'}
                    </span>
                  </td>
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
