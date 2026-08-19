function AddExpenseModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Add Expense</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>

        <form className="expense-form">
          <div className="form-grid">
            <label>
              <span>Title</span>
              <input type="text" placeholder="Groceries" defaultValue="Groceries" />
            </label>
            <label>
              <span>Amount</span>
              <input type="number" placeholder="0.00" defaultValue={125.5} />
            </label>
            <label>
              <span>Category</span>
              <select defaultValue="Food">
                <option>Food</option>
                <option>Shopping</option>
                <option>Travel</option>
                <option>Bills</option>
                <option>Health</option>
                <option>Education</option>
              </select>
            </label>
            <label>
              <span>Date</span>
              <input type="date" defaultValue="2026-08-18" />
            </label>
            <label>
              <span>Payment Method</span>
              <select defaultValue="Card">
                <option>Card</option>
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>Auto-debit</option>
              </select>
            </label>
            <label className="full-width">
              <span>Notes</span>
              <textarea rows="3" defaultValue="Weekly groceries and household essentials" />
            </label>
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary">Save Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseModal;
