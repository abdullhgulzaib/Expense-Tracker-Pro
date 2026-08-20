import { createContext, useContext, useReducer } from 'react';

const ExpenseContext = createContext();

const initialState = {
  expenses: [],
  summary: {
    totalExpenses: 0,
    highestExpense: 0,
    averageExpense: 0,
    transactionCount: 0,
  },
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload, loading: false, error: null };
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload, loading: false, error: null };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense._id === action.payload._id ? action.payload : expense
        ),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((expense) => expense._id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ExpenseContext.Provider value={{ state, dispatch }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);

  if (!context) {
    throw new Error('useExpenses must be used inside ExpenseProvider');
  }

  return context;
}

export default ExpenseContext;
