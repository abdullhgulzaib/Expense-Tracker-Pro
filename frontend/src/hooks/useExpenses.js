import { useEffect } from 'react';
import api from '../services/api';
import { useExpenses as useExpenseContext } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';

function useExpenseData() {
  const { dispatch } = useExpenseContext();
  const { isAuthenticated } = useAuth();

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

    const fetchData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const [expensesRes, summaryRes] = await Promise.all([
          api.get('/expenses'),
          api.get('/analytics/summary'),
        ]);

        dispatch({ type: 'SET_EXPENSES', payload: expensesRes.data });
        dispatch({ type: 'SET_SUMMARY', payload: summaryRes.data });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error?.response?.data?.error || error.message,
        });
      }
    };

    fetchData();
  }, [dispatch, isAuthenticated]);
}

export default useExpenseData;
