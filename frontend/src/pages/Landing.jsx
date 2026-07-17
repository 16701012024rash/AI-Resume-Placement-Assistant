import "./../styles/Landing.css";

function Landing(){

return(

<div className="landing">

<nav>

<h2>AI Placement</h2>

<div>

<a href="/">Home</a>

<a href="/">Features</a>

<a href="/">About</a>

<button>Login</button>

</div>

</nav>

<section className="hero">

<div className="left">

<h1>
Prepare Smarter.
<br/>
Get Placed Faster.
</h1>

<p>

Your personal AI assistant for Resume Analysis,
ATS Score, Mock Interviews and Placement Roadmaps.

</p>

<button>

Get Started

</button>

</div>

<div className="right">

<div className="resume-card">

📄 Resume

</div>

<div className="circle"></div>

</div>

</section>

</div>

)

}

export default Landing;