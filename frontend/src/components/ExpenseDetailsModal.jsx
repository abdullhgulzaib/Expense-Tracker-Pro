import { useSettings } from '../context/SettingsContext';

function formatDisplayDate(dateString) {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function ExpenseDetailsModal({ isOpen, onClose, expense, onEdit }) {
  const { formatCurrency } = useSettings();

  if (!isOpen || !expense) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <h2>Expense Details</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>

        <div className="expense-details">
          <div className="expense-details__row">
            <span>Title</span>
            <strong>{expense.title}</strong>
          </div>
          <div className="expense-details__row">
            <span>Amount</span>
            <strong>{formatCurrency(expense.amount)}</strong>
          </div>
          <div className="expense-details__row">
            <span>Category</span>
            <strong>{expense.category}</strong>
          </div>
          <div className="expense-details__row">
            <span>Date</span>
            <strong>{formatDisplayDate(expense.date)}</strong>
          </div>
          <div className="expense-details__row">
            <span>Payment Method</span>
            <strong>{expense.paymentMethod || '—'}</strong>
          </div>
          <div className="expense-details__row">
            <span>Status</span>
            <strong>{expense.status || 'Completed'}</strong>
          </div>
          <div className="expense-details__row expense-details__row--notes">
            <span>Notes</span>
            <p>{expense.notes?.trim() ? expense.notes : 'No notes added.'}</p>
          </div>
        </div>

        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Close</button>
          {onEdit ? (
            <button type="button" className="btn btn--primary" onClick={() => onEdit(expense)}>
              Edit
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ExpenseDetailsModal;