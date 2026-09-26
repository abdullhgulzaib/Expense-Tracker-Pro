import { useEffect, useRef } from 'react';
import api from '../services/api';
import { useExpenses as useExpenseContext } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';

function useExpenseData() {
  const { dispatch } = useExpenseContext();
  const { isAuthenticated } = useAuth();
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch({ type: 'SET_EXPENSES', payload: [] });
      dispatch({
        type: 'SET_SUMMARY',
        payload: {
          totalExpenses: 0,
          highestExpense: 0,
          averageExpense: 0,
          transactionCount: 0,
        },
      });
      return;
    }

    const fetchData = async (isInitial = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      if (isInitial) {
        dispatch({ type: 'SET_LOADING', payload: true });
      }

      try {
        const [expensesRes, summaryRes] = await Promise.all([
          api.get('/expenses'),
          api.get('/analytics/summary'),
        ]);

        dispatch({ type: 'SET_EXPENSES', payload: expensesRes.data });
        dispatch({ type: 'SET_SUMMARY', payload: summaryRes.data });
      } catch (error) {
        if (isInitial) {
          dispatch({
            type: 'SET_ERROR',
            payload: error?.response?.data?.error || error.message,
          });
        }
      } finally {
        isFetchingRef.current = false;
      }
    };

    // Initial load
    fetchData(true);

    // Auto-sync in background every 5 seconds so any mutual split expense or proof approval shows up instantly
    const interval = setInterval(() => {
      fetchData(false);
    }, 5000);

    // Also auto-refresh when tab/window regains focus or visibility
    const handleSync = () => {
      fetchData(false);
    };

    window.addEventListener('focus', handleSync);
    document.addEventListener('visibilitychange', handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleSync);
    };
  }, [dispatch, isAuthenticated]);
}

export default useExpenseData;
