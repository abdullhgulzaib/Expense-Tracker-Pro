import { useEffect, useState } from "react";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "../utils/constants";

const defaultForm = {
  title: "",
  amount: "",
  category: "Food",
  date: new Date().toISOString().split("T")[0],
  paymentMethod: "Card",
  notes: "",
  status: "Completed",
};

function AddExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = "add",
  submitting = false,
}) {
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        amount: initialData.amount || "",
        category: initialData.category || "Food",
        date: initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        paymentMethod: initialData.paymentMethod || "Card",
        notes: initialData.notes || "",
        status: initialData.status || "Completed",
      });
    } else {
      setFormData(defaultForm);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{mode === "edit" ? "Edit Expense" : "Add Expense"}</h2>
          <button className="modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="expense-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              <span>Title</span>
              <input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Groceries"
                required
              />
            </label>
            <label>
              <span>Amount</span>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </label>

            <label>
              <span>Category</span>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Date</span>
              <input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <span>Payment Method</span>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method}>{method}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Status</span>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option>Completed</option>
                <option>Pending</option>
              </select>
            </label>
            <label className="full-width">
              <span>Notes</span>
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notes about this expense"
              />
            </label>
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : mode === "edit"
                  ? "Update Expense"
                  : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseModal;
