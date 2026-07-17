import "../styles/ResumeUpload.css";

function ResumeUpload(){

    return(

        <div className="resume-page">

            <h1>Upload Resume</h1>

            <p>Upload your resume for AI Analysis.</p>

            <div className="upload-card">

                <div className="upload-icon">
                    📄
                </div>

                <h2>Drag & Drop Resume</h2>

                <p>PDF only (Max 5 MB)</p>

                <input type="file"/>

                <button onClick={() => window.location.href="/analysis"}>
    Analyze Resume
</button>

            </div>

        </div>

    )

}

export default ResumeUpload;