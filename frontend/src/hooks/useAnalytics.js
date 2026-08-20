import { useEffect, useState } from 'react';
import api from '../services/api';

function useAnalytics() {
  const [analytics, setAnalytics] = useState({
    categoryData: [],
    monthlyData: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [categoryRes, monthlyRes] = await Promise.all([
          api.get('/analytics/by-category'),
          api.get('/analytics/monthly-trend'),
        ]);

        const categoryData = categoryRes.data.map((item) => ({
          name: item.category,
          total: Number(item.totalAmount || 0),
        }));

        const monthlyData = monthlyRes.data.map((item) => ({
          name: `${new Date(item.year, item.month - 1, 1).toLocaleString('en-US', {
            month: 'short',
          })}`,
          total: Number(item.totalAmount || 0),
        }));

        setAnalytics({
          categoryData,
          monthlyData,
          loading: false,
          error: null,
        });
      } catch (error) {
        setAnalytics({
          categoryData: [],
          monthlyData: [],
          loading: false,
          error: error?.response?.data?.error || error.message,
        });
      }
    };

    fetchAnalytics();
  }, []);

  return analytics;
}

export default useAnalytics;
