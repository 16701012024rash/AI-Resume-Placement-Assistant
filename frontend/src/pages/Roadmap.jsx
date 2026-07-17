import "../styles/Roadmap.css";

function Roadmap() {
  return (
    <div className="roadmap-page">

      <h1>🎯 Placement Roadmap</h1>

      <div className="roadmap-container">

        <div className="roadmap-card">
          <h2>Week 1</h2>
          <p>Complete Resume</p>
        </div>

        <div className="roadmap-card">
          <h2>Week 2</h2>
          <p>Practice DSA (20 Questions)</p>
        </div>

        <div className="roadmap-card">
          <h2>Week 3</h2>
          <p>Learn SQL & DBMS</p>
        </div>

        <div className="roadmap-card">
          <h2>Week 4</h2>
          <p>Mock Interview + Aptitude</p>
        </div>

      </div>

    </div>
  );
}

export default Roadmap;