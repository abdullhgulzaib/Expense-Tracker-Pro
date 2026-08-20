import CategoryBarChart from '../components/charts/CategoryBarChart';
import SpendingLineChart from '../components/charts/SpendingLineChart';
import useAnalytics from '../hooks/useAnalytics';

function Analytics() {
  const { categoryData, monthlyData, loading, error } = useAnalytics();

  if (loading) {
    return <div className="page"><div className="panel empty-panel"><p>Loading analytics...</p></div></div>;
  }

  if (error) {
    return <div className="page"><div className="panel empty-panel"><p>Error: {error}</p></div></div>;
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Analytics</h1>
      </div>

      <div className="content-grid content-grid--two-cols">
        <SpendingLineChart data={monthlyData} />
        <CategoryBarChart data={categoryData} />
      </div>
    </div>
  );
}

export default Analytics;
