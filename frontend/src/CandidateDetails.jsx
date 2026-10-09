import React, { useState } from "react";
import "./CandidateDetails.css";

function CandidateDetails({
  candidate,
  onBack,
  onSaved,
}) {
  const [formData, setFormData] = useState({
    fullName: candidate.fullName || "",
    phone: candidate.phone || "",
    email: candidate.email || "",
    location: candidate.location || "",

    qualification: candidate.qualification || "",
    institution: candidate.institution || "",
    year: candidate.year || "",

    company: candidate.company || "",
    jobTitle: candidate.jobTitle || "",
    startDate: candidate.startDate || "",
    endDate: candidate.endDate || "",
    experience: candidate.experience || "",

    achievements: candidate.achievements || "",
    additionalInfo: candidate.additionalInfo || "",

    status: candidate.status || "Pending",
    recruiterNotes: candidate.recruiterNotes || "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Handle form changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  // Save candidate changes
  const handleSave = async (event) => {
    event.preventDefault();

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/candidates/${candidate.candidateId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update candidate."
        );
      }

      const updatedCandidate = {
        ...candidate,
        ...formData,
        candidateId: candidate.candidateId,
        submissionDate: candidate.submissionDate || "",
      };

      setSuccess("Candidate updated successfully.");

      if (onSaved) {
        onSaved(updatedCandidate);
      }
    } catch (error) {
      console.error("Error updating candidate:", error);

      setError(
        error.message || "Failed to update candidate."
      );
    } finally {
      setSaving(false);
    }
  };

  // Return to CV preview
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="candidate-details-page">
      {/* Header */}
      <div className="details-header">
        <div>
          <h1>Edit Candidate</h1>
          <p>Candidate #{candidate.candidateId}</p>
        </div>

        {/* Candidate status */}
        <div className="details-status">
          <label htmlFor="status">Status</label>

          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Pending">Pending</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Success and error messages */}
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Personal Information */}
        <section className="details-section">
          <h2>Personal Information</h2>

          <div className="details-grid">
            <Field
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />

            <Field
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <Field
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />

            <Field
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Education */}
        <section className="details-section">
          <h2>Education</h2>

          <div className="details-grid">
            <Field
              label="Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
            />

            <Field
              label="Institution"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
            />

            <Field
              label="Year of Passing"
              name="year"
              value={formData.year}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Work Experience */}
        <section className="details-section">
          <h2>Work Experience</h2>

          <div className="details-grid">
            <Field
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
            />

            <Field
              label="Job Title"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
            />

            <Field
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
            />

            <Field
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <TextAreaField
            label="Experience / Description"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            rows={5}
          />
        </section>

        {/* Achievements */}
        <section className="details-section">
          <h2>Achievements</h2>

          <TextAreaField
            label="Achievements"
            name="achievements"
            value={formData.achievements}
            onChange={handleChange}
            rows={5}
          />
        </section>

        {/* Additional Information */}
        <section className="details-section">
          <h2>Additional Information</h2>

          <TextAreaField
            label="Additional Information"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            rows={5}
          />
        </section>

        {/* Recruiter Notes */}
        <section className="details-section">
          <h2>Recruiter Notes</h2>

          <TextAreaField
            label="Notes"
            name="recruiterNotes"
            value={formData.recruiterNotes}
            onChange={handleChange}
            rows={5}
          />
        </section>

        {/* Action Buttons */}
        <div className="details-actions">
          <button
            type="button"
            className="back-button"
            onClick={handleBack}
            disabled={saving}
          >
            ← Back to CV
          </button>

          <button
            type="submit"
            className="save-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* Reusable input component */
function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
}) {
  return (
    <div className="details-field">
      <label htmlFor={name}>{label}</label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

/* Reusable textarea component */
function TextAreaField({
  label,
  name,
  value,
  onChange,
  rows = 4,
}) {
  return (
    <div className="details-field full-width">
      <label htmlFor={name}>{label}</label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
      />
    </div>
  );
}

export default CandidateDetails;