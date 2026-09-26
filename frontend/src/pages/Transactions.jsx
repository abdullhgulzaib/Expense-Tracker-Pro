import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, SlidersHorizontal, ChevronDown, ChevronUp, RotateCcw, Search, X } from 'lucide-react';
import AddExpenseModal from '../components/AddExpenseModal';
import ExpenseDetailsModal from '../components/ExpenseDetailsModal';
import ExportModal from '../components/ExportModal';
import TransactionsTable from '../components/TransactionsTable';
import Toast from '../components/Toast';
import { useExpenses } from '../context/ExpenseContext';
import { useNotifications } from '../context/NotificationContext';
import { useSettings } from '../context/SettingsContext';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import api from '../services/api';

const categoryOptions = ['All', ...EXPENSE_CATEGORIES];
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
  const { addNotification } = useNotifications();
  const { formatCurrency } = useSettings();
  const [searchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFilterCount =
    (categoryFilter !== 'All' ? 1 : 0) +
    (statusFilter !== 'All' ? 1 : 0) +
    (sortBy !== 'date-desc' ? 1 : 0);

  const handleResetFilters = () => {
    setCategoryFilter('All');
    setStatusFilter('All');
    setSortBy('date-desc');
    setSearchTerm('');
  };

  useEffect(() => {
    const paramSearch = searchParams.get('search');
    if (paramSearch !== null) {
      setSearchTerm(paramSearch);
    }
  }, [searchParams]);
  
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
        addNotification({
          title: 'Expense Updated',
          message: `"${payload.title}" was updated to ${formatCurrency(payload.amount)}.`,
          type: 'expense-edit',
        });
      } else {
        const { data } = await api.post('/expenses', payload);
        dispatch({ type: 'ADD_EXPENSE', payload: data });
        setToastType('success');
        setToast('Expense added successfully');
        addNotification({
          title: 'Expense Added',
          message: `"${payload.title}" (${formatCurrency(payload.amount)}) recorded.`,
          type: 'expense-add',
        });
      }

      setIsModalOpen(false);
      setEditingExpense(null);
     } catch (error) {
      setToastType('error');
      setToast(error?.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(''), 2200);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;

    const itemToDelete = state.expenses.find((item) => item._id === id);

    try {
      await api.delete(`/expenses/${id}`);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
      setToast('Expense deleted');
      addNotification({
        title: 'Expense Deleted',
        message: itemToDelete
          ? `"${itemToDelete.title}" (${formatCurrency(itemToDelete.amount)}) was removed.`
          : 'An expense was removed.',
        type: 'expense-delete',
      });
    } catch (error) {
      setToast(error?.response?.data?.error || 'Delete failed');
    } finally {
      setTimeout(() => setToast(''), 2200);
    }
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <p className="eyebrow">Financial Records</p>
          <h1>Transactions</h1>
        </div>
        <div className="page__actions">
          <button
            type="button"
            className="btn btn--secondary btn--export"
            onClick={() => setIsExportModalOpen(true)}
          >
            <Download size={15} />
            <span>Export Data</span>
          </button>
          <button className="btn btn--primary" onClick={handleOpenAddModal}>
            + Add Expense
          </button>
        </div>
      </div>

      <div className="panel toolbar-panel">
        <div className="toolbar-header-row">
          <div className="toolbar__field toolbar__field--search">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                id="transaction-search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, category, notes..."
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            className={`btn btn--filter-toggle ${showMobileFilters || activeFilterCount > 0 ? 'active' : ''}`}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            title="Toggle filters"
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
            {showMobileFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        <div className={`toolbar-collapsible ${showMobileFilters ? 'open' : ''}`}>
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

          {(activeFilterCount > 0 || searchTerm) && (
            <div className="toolbar__field" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                className="btn btn--reset-filters"
                onClick={handleResetFilters}
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>
          )}
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
            onRowClick={setViewingExpense}
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

      <ExpenseDetailsModal
        isOpen={Boolean(viewingExpense)}
        expense={viewingExpense}
        onClose={() => setViewingExpense(null)}
        onEdit={(expense) => {
          setViewingExpense(null);
          handleOpenEditModal(expense);
        }}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        allExpenses={state.expenses}
        currentFilteredExpenses={filteredExpenses}
        onExportSuccess={(msg) => {
          setToastType('success');
          setToast(msg);
          setTimeout(() => setToast(''), 3000);
          addNotification({
            title: 'Data Exported',
            message: msg,
            type: 'export',
          });
        }}
      />

      <Toast message={toast} visible={Boolean(toast)} type={toastType} />
    </div>
  );
}

export default Transactions;
