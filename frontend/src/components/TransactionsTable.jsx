const sampleRows = [
  { title: 'Groceries', category: 'Food', amount: 124.5, date: '2026-08-15', status: 'Completed' },
  { title: 'Train Pass', category: 'Travel', amount: 48.0, date: '2026-08-12', status: 'Completed' },
  { title: 'Electric Bill', category: 'Bills', amount: 96.2, date: '2026-08-10', status: 'Pending' },
  { title: 'Book Purchase', category: 'Education', amount: 32.0, date: '2026-08-08', status: 'Completed' },
];

function TransactionsTable() {
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
            {sampleRows.map((row) => (
              <tr key={`${row.title}-${row.date}`}>
                <td>{row.title}</td>
                <td><span className="tag tag--category">{row.category}</span></td>
                <td>{row.date}</td>
                <td className="amount amount--expense">-${row.amount.toFixed(2)}</td>
                <td>
                  <span className={`status-pill ${row.status === 'Pending' ? 'pending' : 'completed'}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionsTable;
