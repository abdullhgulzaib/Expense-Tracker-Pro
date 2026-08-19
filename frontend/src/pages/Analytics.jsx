import CategoryBarChart from '../components/charts/CategoryBarChart';

function Analytics() {
  return (
    <div className="page">
      <div className="page__header">
        <h1>Analytics</h1>
      </div>

      <div className="content-grid content-grid--one-col">
        <CategoryBarChart />
      </div>
    </div>
  );
}

export default Analytics;
