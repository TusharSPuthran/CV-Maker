import React, { useEffect, useState } from "react";
import "./RecruiterDashboard.css";
import CandidateDetails from "./CandidateDetails";
import CVPreview from "./CVPreview";

function RecruiterDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // dashboard | cv | edit
  const [currentView, setCurrentView] = useState("dashboard");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // FETCH CANDIDATES
  // ==============================

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/candidates"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch candidates"
        );
      }

      setCandidates(data.candidates || []);
    } catch (error) {
      console.error("Error fetching candidates:", error);

      setError("Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // ==============================
  // VIEW CV
  // ==============================

  const handleView = (candidate) => {
    setSelectedCandidate(candidate);
    setCurrentView("cv");
  };

  // ==============================
  // EDIT CANDIDATE
  // ==============================

  const handleEdit = () => {
    setCurrentView("edit");
  };

  // ==============================
  // BACK TO DASHBOARD
  // ==============================

  const handleBackToDashboard = () => {
    setSelectedCandidate(null);
    setCurrentView("dashboard");
  };

  // ==============================
  // BACK TO CV
  // ==============================

  const handleBackToCV = () => {
    setCurrentView("cv");
  };

  // ==============================
  // AFTER SAVING
  // ==============================

  const handleSaved = (updatedCandidate) => {
    setCandidates((previousCandidates) =>
      previousCandidates.map((candidate) =>
        String(candidate.candidateId) ===
        String(updatedCandidate.candidateId)
          ? updatedCandidate
          : candidate
      )
    );

    setSelectedCandidate(updatedCandidate);

    // Automatically return to CV
    setCurrentView("cv");
  };

  // ==============================
  // COUNTS
  // ==============================

  const totalCandidates = candidates.length;

  const pendingCandidates = candidates.filter(
    (candidate) =>
      !candidate.status ||
      candidate.status.toLowerCase() === "pending"
  ).length;

  const selectedCandidates = candidates.filter(
    (candidate) =>
      candidate.status &&
      candidate.status.toLowerCase() === "selected"
  ).length;

  // =========================================================
  // CV PREVIEW
  // =========================================================

  if (
    currentView === "cv" &&
    selectedCandidate
  ) {
    return (
      <CVPreview
        candidate={selectedCandidate}
        onBack={handleBackToDashboard}
        onEdit={handleEdit}
      />
    );
  }

  // =========================================================
  // EDIT CANDIDATE
  // =========================================================

  if (
    currentView === "edit" &&
    selectedCandidate
  ) {
    return (
      <CandidateDetails
        candidate={selectedCandidate}
        onBack={handleBackToCV}
        onSaved={handleSaved}
      />
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="dashboard-page">

      {/* =========================
          DASHBOARD HEADER
          ========================= */}

      <div className="dashboard-header">

        <div>
          <h1>CV Maker</h1>

          <p>
            Recruiter Dashboard
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchCandidates}
        >
          Refresh
        </button>

      </div>


      {/* =========================
          ERROR
          ========================= */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}


      {/* =========================
          SUMMARY CARDS
          ========================= */}

      <div className="dashboard-summary">

        <div className="summary-card">
          <span>
            Total Candidates
          </span>

          <strong>
            {totalCandidates}
          </strong>
        </div>


        <div className="summary-card">
          <span>
            Pending
          </span>

          <strong>
            {pendingCandidates}
          </strong>
        </div>


        <div className="summary-card">
          <span>
            Selected
          </span>

          <strong>
            {selectedCandidates}
          </strong>
        </div>

      </div>


      {/* =========================
          CANDIDATES
          ========================= */}

      <div className="candidates-section">

        <div className="section-header">

          <h2>
            Candidates
          </h2>

          <p>
            View and manage candidates submitted
            through the CV Maker form.
          </p>

        </div>


        {/* =========================
            LOADING
            ========================= */}

        {loading && (
          <div className="loading">
            Loading candidates...
          </div>
        )}


        {/* =========================
            EMPTY
            ========================= */}

        {!loading &&
          candidates.length === 0 && (
            <div className="empty-state">
              No candidates found.
            </div>
          )}


        {/* =========================
            TABLE
            ========================= */}

        {!loading &&
          candidates.length > 0 && (

            <div className="candidates-table-wrapper">

              <table className="candidates-table">

                <thead>

                  <tr>

                    <th>
                      ID
                    </th>

                    <th>
                      Candidate
                    </th>

                    <th>
                      Qualification
                    </th>

                    <th>
                      Job Title
                    </th>

                    <th>
                      Submitted
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {candidates.map(
                    (candidate) => (

                      <tr
                        key={
                          candidate.candidateId
                        }
                      >

                        {/* ID */}

                        <td>
                          #
                          {
                            candidate.candidateId
                          }
                        </td>


                        {/* CANDIDATE */}

                        <td>

                          <div className="candidate-name">
                            {
                              candidate.fullName
                            }
                          </div>

                          <div className="candidate-email">
                            {
                              candidate.email
                            }
                          </div>

                        </td>


                        {/* QUALIFICATION */}

                        <td>
                          {
                            candidate.qualification
                          }
                        </td>


                        {/* JOB TITLE */}

                        <td>
                          {
                            candidate.jobTitle
                          }
                        </td>


                        {/* SUBMITTED */}

                        <td>
                          {
                            candidate.submissionDate
                          }
                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`status-badge ${
                              candidate.status
                                ? candidate.status.toLowerCase()
                                : "pending"
                            }`}
                          >
                            {
                              candidate.status ||
                              "Pending"
                            }
                          </span>

                        </td>


                        {/* VIEW */}

                        <td>

                          <button
                            className="view-button"
                            onClick={() =>
                              handleView(
                                candidate
                              )
                            }
                          >
                            View
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </div>

    </div>
  );
}

export default RecruiterDashboard;