import { useMemo, useState } from 'react';
import AddExpenseModal from '../components/AddExpenseModal';
import TransactionsTable from '../components/TransactionsTable';
import Toast from '../components/Toast';
import { useExpenses } from '../context/ExpenseContext';
import api from '../services/api';

const categoryOptions = ['All', 'Food', 'Shopping', 'Travel', 'Bills', 'Health', 'Education'];
const statusOptions = ['All', 'Completed', 'Pending'];
const sortOptions = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'amount-desc', label: 'Highest amount' },
  { value: 'amount-asc', label: 'Lowest amount' },
  { value: 'title-asc', label: 'Title A-Z' },
];

const emptyForm = {
  title: '',
  amount: '',
  category: 'Food',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'Card',
  notes: '',
  status: 'Completed',
};

function Transactions() {
  const { state, dispatch } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  const filteredExpenses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const result = [...state.expenses].filter((expense) => {
      const matchesSearch = !query || [
        expense.title,
        expense.category,
        expense.paymentMethod,
        expense.notes,
      ].some((value) => String(value || '').toLowerCase().includes(query));

      const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || expense.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    switch (sortBy) {
      case 'date-asc':
        return result.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'amount-desc':
        return result.sort((a, b) => Number(b.amount) - Number(a.amount));
      case 'amount-asc':
        return result.sort((a, b) => Number(a.amount) - Number(b.amount));
      case 'title-asc':
        return result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'date-desc':
      default:
        return result.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  }, [categoryFilter, searchTerm, sortBy, state.expenses, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    const payload = {
      ...formData,
      amount: Number(formData.amount),
    };

    setSubmitting(true);

    try {
      if (editingExpense) {
        const { data } = await api.put(`/expenses/${editingExpense._id}`, payload);
        dispatch({ type: 'UPDATE_EXPENSE', payload: data });
        setToast('Expense updated successfully');
      } else {
        const { data } = await api.post('/expenses', payload);
        dispatch({ type: 'ADD_EXPENSE', payload: data });
        setToast('Expense added successfully');
      }

      setIsModalOpen(false);
      setEditingExpense(null);
    } catch (error) {
      setToast(error?.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(''), 2200);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;

    try {
      await api.delete(`/expenses/${id}`);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
      setToast('Expense deleted');
    } catch (error) {
      setToast(error?.response?.data?.error || 'Delete failed');
    } finally {
      setTimeout(() => setToast(''), 2200);
    }
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1>Transactions</h1>
        <button className="btn btn--primary" onClick={handleOpenAddModal}>+ Add Expense</button>
      </div>

      <div className="panel toolbar-panel">
        <div className="toolbar">
          <div className="toolbar__field toolbar__field--wide">
            <label htmlFor="transaction-search">Search</label>
            <input
              id="transaction-search"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title, category, notes..."
            />
          </div>

          <div className="toolbar__field">
            <label htmlFor="category-filter">Category</label>
            <select id="category-filter" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="toolbar__field">
            <label htmlFor="status-filter">Status</label>
            <select id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="toolbar__field">
            <label htmlFor="sort-by">Sort</label>
            <select id="sort-by" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {state.loading ? (
        <div className="panel empty-panel"><p>Loading transactions...</p></div>
      ) : (
        <>
          <div className="toolbar__summary">
            Showing {filteredExpenses.length} of {state.expenses.length} transactions
          </div>

          <TransactionsTable
            rows={filteredExpenses}
            onEdit={handleOpenEditModal}
            onDelete={handleDelete}
            showActions
            title="All Transactions"
          />
        </>
      )}

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingExpense}
        mode={editingExpense ? 'edit' : 'add'}
        submitting={submitting}
      />

      <Toast message={toast} visible={Boolean(toast)} />
    </div>
  );
}

export default Transactions;
