import React from "react";
import "./CVPreview.css";

function CVPreview({
  candidate,
  onBack,
  onEdit,
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cv-preview-page">
      {/* Preview Toolbar */}
      <div className="cv-toolbar">
        <button onClick={onBack}>
          ← Back to Candidates
        </button>

        <div className="cv-toolbar-right">
          <button onClick={onEdit}>
            Edit Candidate
          </button>

          <button onClick={handlePrint}>
            Generate PDF
          </button>
        </div>
      </div>

      {/* CV Paper */}
      <div className="cv-paper">
        {/* Header */}
        <header className="cv-header">
          <h1 className="cv-name">
            {candidate.fullName || "Candidate Name"}
          </h1>

          {candidate.jobTitle && (
            <div className="cv-job-title">
              {candidate.jobTitle}
            </div>
          )}

          <div className="cv-contact">
            {candidate.phone && (
              <span>{candidate.phone}</span>
            )}

            {candidate.email && (
              <span>{candidate.email}</span>
            )}

            {candidate.location && (
              <span>{candidate.location}</span>
            )}
          </div>
        </header>

        {/* Experience */}
        {(candidate.company ||
          candidate.jobTitle ||
          candidate.experience) && (
          <section className="cv-section">
            <h2 className="cv-section-title">
              Experience
            </h2>

            <div className="cv-experience">
              <div className="cv-experience-header">
                {candidate.jobTitle && (
                  <div className="cv-job-title">
                    {candidate.jobTitle}
                  </div>
                )}

                {candidate.company && (
                  <div className="cv-company">
                    {candidate.company}
                  </div>
                )}

                {(candidate.startDate ||
                  candidate.endDate) && (
                  <div className="cv-dates">
                    {candidate.startDate || ""}

                    {candidate.startDate &&
                    candidate.endDate
                      ? " – "
                      : ""}

                    {candidate.endDate || ""}
                  </div>
                )}
              </div>

              {candidate.experience && (
                <div className="cv-description">
                  {candidate.experience}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Education */}
        {(candidate.qualification ||
          candidate.institution ||
          candidate.year) && (
          <section className="cv-section">
            <h2 className="cv-section-title">
              Education
            </h2>

            <div className="cv-education">
              {candidate.qualification && (
                <div className="cv-qualification">
                  {candidate.qualification}
                </div>
              )}

              {candidate.institution && (
                <div className="cv-institution">
                  {candidate.institution}
                </div>
              )}

              {candidate.year && (
                <div className="cv-year">
                  {candidate.year}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Achievements */}
        {candidate.achievements && (
          <section className="cv-section">
            <h2 className="cv-section-title">
              Achievements
            </h2>

            <div className="cv-achievements">
              {candidate.achievements}
            </div>
          </section>
        )}

        {/* Additional Information */}
        {candidate.additionalInfo && (
          <section className="cv-section">
            <h2 className="cv-section-title">
              Additional Information
            </h2>

            <div className="cv-additional">
              {candidate.additionalInfo}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default CVPreview;