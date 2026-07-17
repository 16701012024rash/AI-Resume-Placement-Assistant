function DashboardCard({ title, value, status, growth }) {
  return (
    <div className="card">
      <h3>{title}</h3>

      <h2>{value}</h2>

      <p className="status">{status}</p>

      <small>{growth}</small>
    </div>
  );
}

export default DashboardCard;