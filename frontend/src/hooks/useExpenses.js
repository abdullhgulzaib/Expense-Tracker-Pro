import { useEffect } from 'react';
import api from '../services/api';
import { useExpenses as useExpenseContext } from '../context/ExpenseContext';

function useExpenseData() {
  const { dispatch } = useExpenseContext();

  useEffect(() => {
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
  }, [dispatch]);
}

export default useExpenseData;
