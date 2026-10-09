
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { google } = require("googleapis");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

app.use(cors());
app.use(express.json());

// ======================================================
// GOOGLE SHEETS AUTHENTICATION
// ======================================================

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "credentials.json"),
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

// ======================================================
// HELPERS
// ======================================================

async function getSheetRows() {
  if (!SPREADSHEET_ID) {
    throw new Error("SPREADSHEET_ID is missing from .env");
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:S",
  });

  return response.data.values || [];
}

function rowToCandidate(row, fallbackId = "") {
  return {
    candidateId: row[0] || fallbackId,
    submissionDate: row[1] || "",

    fullName: row[2] || "",
    phone: row[3] || "",
    email: row[4] || "",
    location: row[5] || "",

    qualification: row[6] || "",
    institution: row[7] || "",
    year: row[8] || "",

    company: row[9] || "",
    jobTitle: row[10] || "",
    startDate: row[11] || "",
    endDate: row[12] || "",
    experience: row[13] || "",

    achievements: row[14] || "",
    additionalInfo: row[15] || "",

    // AI summary is no longer used.
    status: row[17] || "Pending",
    recruiterNotes: row[18] || "",
  };
}

// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CV Maker backend is running",
  });
});

// ======================================================
// GET ALL CANDIDATES
// ======================================================

app.get("/api/candidates", async (req, res) => {
  try {
    const rows = await getSheetRows();

    const candidates = rows.slice(1).map((row, index) =>
      rowToCandidate(row, index + 1)
    );

    res.json({
      success: true,
      candidates,
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch candidates",
      error: error.message,
    });
  }
});

// ======================================================
// GET ONE CANDIDATE
// ======================================================

app.get("/api/candidates/:id", async (req, res) => {
  try {
    const candidateId = String(req.params.id);
    const rows = await getSheetRows();

    const rowIndex = rows.findIndex(
      (row, index) =>
        index > 0 && String(row[0]) === candidateId
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.json({
      success: true,
      candidate: rowToCandidate(rows[rowIndex]),
    });
  } catch (error) {
    console.error("Error fetching candidate:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch candidate",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE CANDIDATE
// ======================================================

app.put("/api/candidates/:id", async (req, res) => {
  try {
    const candidateId = String(req.params.id);
    const rows = await getSheetRows();

    const rowIndex = rows.findIndex(
      (row, index) =>
        index > 0 && String(row[0]) === candidateId
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const existingRow = rows[rowIndex];
    const sheetRow = rowIndex + 1;
    const body = req.body;

    // Preserve the ID, submission date and existing column Q.
    // Column Q is retained for compatibility with the current sheet.
    const updatedRow = [
      candidateId,
      existingRow[1] || "",

      body.fullName ?? existingRow[2] ?? "",
      body.phone ?? existingRow[3] ?? "",
      body.email ?? existingRow[4] ?? "",
      body.location ?? existingRow[5] ?? "",

      body.qualification ?? existingRow[6] ?? "",
      body.institution ?? existingRow[7] ?? "",
      body.year ?? existingRow[8] ?? "",

      body.company ?? existingRow[9] ?? "",
      body.jobTitle ?? existingRow[10] ?? "",
      body.startDate ?? existingRow[11] ?? "",
      body.endDate ?? existingRow[12] ?? "",
      body.experience ?? existingRow[13] ?? "",

      body.achievements ?? existingRow[14] ?? "",
      body.additionalInfo ?? existingRow[15] ?? "",

      existingRow[16] || "",
      body.status ?? existingRow[17] ?? "Pending",
      body.recruiterNotes ?? existingRow[18] ?? "",
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!A${sheetRow}:S${sheetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [updatedRow],
      },
    });

    console.log(`Candidate ${candidateId} updated`);

    res.json({
      success: true,
      message: "Candidate updated successfully",
    });
  } catch (error) {
    console.error("Candidate update error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update candidate",
      error: error.message,
    });
  }
});

// ======================================================
// SUBMIT CANDIDATE — NO AI PROCESSING
// ======================================================

app.post("/api/candidates", async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      location,

      qualification,
      institution,
      year,

      company,
      jobTitle,
      startDate,
      endDate,
      experience,

      achievements,
      additionalInfo,
    } = req.body;

    const candidate = {
      fullName: fullName ?? "",
      phone: phone ?? "",
      email: email ?? "",
      location: location ?? "",

      qualification: qualification ?? "",
      institution: institution ?? "",
      year: year ?? "",

      company: company ?? "",
      jobTitle: jobTitle ?? "",
      startDate: startDate ?? "",
      endDate: endDate ?? "",
      experience: experience ?? "",

      achievements: achievements ?? "",
      additionalInfo: additionalInfo ?? "",
    };

    // Read existing IDs.
    const idResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:A",
    });

    const idRows = idResponse.data.values || [];

    const numericIds = idRows
      .slice(1)
      .map((row) => Number(row[0]))
      .filter(
        (id) => Number.isSafeInteger(id) && id > 0
      );

    const candidateId =
      (numericIds.length > 0
        ? Math.max(...numericIds)
        : 0) + 1;

    const submissionDate = new Date().toLocaleString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
      }
    );

    // Keep the existing 19-column sheet layout.
    // Column Q is left blank; no AI summary is generated.
    const newRow = [
      candidateId,
      submissionDate,

      candidate.fullName,
      candidate.phone,
      candidate.email,
      candidate.location,

      candidate.qualification,
      candidate.institution,
      candidate.year,

      candidate.company,
      candidate.jobTitle,
      candidate.startDate,
      candidate.endDate,
      candidate.experience,

      candidate.achievements,
      candidate.additionalInfo,

      "",          // Q: Unused
      "Pending",   // R: Status
      "",          // S: Recruiter Notes
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:S",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [newRow],
      },
    });

    console.log(`Candidate ${candidateId} saved to Google Sheets`);

    res.status(201).json({
      success: true,
      message: "Candidate submitted successfully",
      candidateId,
    });
  } catch (error) {
    console.error("Candidate submission error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save candidate",
      error: error.message,
    });
  }
});

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
  console.log(
    `CV Maker backend running on http://localhost:${PORT}`
  );
});
