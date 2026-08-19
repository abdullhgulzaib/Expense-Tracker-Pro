import { useEffect } from 'react';
import api from '../services/api';
import { useExpenses as useExpenseContext } from '../context/ExpenseContext';

function useExpenses() {
  const { dispatch } = useExpenseContext();

  useEffect(() => {
    const fetchExpenses = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const { data } = await api.get('/expenses');
        dispatch({ type: 'SET_EXPENSES', payload: data });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };

    fetchExpenses();
  }, [dispatch]);
}

export default useExpenses;
