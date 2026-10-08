import { useState } from "react";
import RecruiterDashboard from "./RecruiterDashboard";
import "./App.css";

function CandidateForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSubmitted(false);

    const form = event.target;
    const formData = new FormData(form);

    const candidateData = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      location: formData.get("location"),

      qualification: formData.get("qualification"),
      institution: formData.get("institution"),
      year: formData.get("year"),

      company: formData.get("company"),
      jobTitle: formData.get("jobTitle"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      experience: formData.get("experience"),

      achievements: formData.get("achievements"),
      additionalInfo: formData.get("additionalInfo"),
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/candidates",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(candidateData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to submit information"
        );
      }

      form.reset();

      setSubmitted(true);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page">
        <div className="form-container success-container">

          <div className="success">

            <h2>
              CV Information Submitted
            </h2>

            <p>
              Your information has been submitted
              successfully. Your CV is now being
              prepared for review.
            </p>

            <button
              className="submit-button"
              onClick={() =>
                setSubmitted(false)
              }
            >
              Submit Another Response
            </button>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="page">

      <div className="form-container">

        <div className="header">

          <h1>
            CV Maker
          </h1>

          <p>
            Enter your information to create your CV.
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          {/* PERSONAL INFORMATION */}

          <section className="section">

            <h2>
              Personal Information
            </h2>

            <div className="field">
              <label>
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                required
              />
            </div>

            <div className="field">
              <label>
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                required
              />
            </div>

            <div className="field">
              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                required
              />
            </div>

            <div className="field">
              <label>
                Location
              </label>

              <input
                type="text"
                name="location"
                required
              />
            </div>

          </section>

          {/* EDUCATION */}

          <section className="section">

            <h2>
              Education
            </h2>

            <div className="field">
              <label>
                Qualification
              </label>

              <input
                type="text"
                name="qualification"
                required
              />
            </div>

            <div className="field">
              <label>
                Institution
              </label>

              <input
                type="text"
                name="institution"
                required
              />
            </div>

            <div className="field">
              <label>
                Year of Passing
              </label>

              <input
                type="text"
                name="year"
                required
              />
            </div>

          </section>

          {/* WORK EXPERIENCE */}

          <section className="section">

            <h2>
              Work Experience
            </h2>

            <div className="field">
              <label>
                Company
              </label>

              <input
                type="text"
                name="company"
              />
            </div>

            <div className="field">
              <label>
                Job Title
              </label>

              <input
                type="text"
                name="jobTitle"
              />
            </div>

            <div className="date-row">

              <div className="field">
                <label>
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                />
              </div>

              <div className="field">
                <label>
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                />
              </div>

            </div>

            <div className="field">

              <label>
                Experience / Description
              </label>

              <textarea
                name="experience"
                rows="5"
              />

            </div>

          </section>

          {/* ACHIEVEMENTS */}

          <section className="section">

            <h2>
              Achievements
            </h2>

            <div className="field">

              <textarea
                name="achievements"
                rows="4"
              />

            </div>

          </section>

          {/* ADDITIONAL INFORMATION */}

          <section className="section">

            <h2>
              Additional Information
            </h2>

            <div className="field">

              <textarea
                name="additionalInfo"
                rows="4"
              />

            </div>

          </section>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading
              ? "Submitting..."
              : "Submit Information"}
          </button>

        </form>

      </div>

    </div>
  );
}

function App() {
  const [page, setPage] =
    useState("candidate");

  return (
    <>
      <nav className="main-nav">

        <div className="nav-title">
          CV Maker
        </div>

        <div className="nav-buttons">

          <button
            className={
              page === "candidate"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              setPage("candidate")
            }
          >
            Candidate Form
          </button>

          <button
            className={
              page === "recruiter"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              setPage("recruiter")
            }
          >
            Recruiter Dashboard
          </button>

        </div>

      </nav>

      {page === "candidate" ? (
        <CandidateForm />
      ) : (
        <RecruiterDashboard />
      )}
    </>
  );
}

export default App;