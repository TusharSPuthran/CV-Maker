const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { google } = require("googleapis");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// ======================================================
// GOOGLE SHEETS AUTHENTICATION
// ======================================================

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {
  res.json({
    message: "CV Maker backend is running",
  });
});

// ======================================================
// GET ALL CANDIDATES
// ======================================================

app.get("/api/candidates", async (req, res) => {
  try {
    const response =
      await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Sheet1!A:S",
      });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      return res.json({
        success: true,
        candidates: [],
      });
    }

    const candidateRows = rows.slice(1);

    const candidates = candidateRows.map(
      (row, index) => ({
        candidateId: row[0] || index + 1,
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

        aiSummary: row[16] || "",
        status: row[17] || "Pending",
        recruiterNotes: row[18] || "",
      })
    );

    res.json({
      success: true,
      candidates,
    });

  } catch (error) {
    console.error(
      "Error fetching candidates:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch candidates",
      error: error.message,
    });
  }
});

// ======================================================
// GET SINGLE CANDIDATE
// ======================================================

app.get("/api/candidates/:id", async (req, res) => {
  try {
    const candidateId = String(req.params.id);

    const response =
      await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Sheet1!A:S",
      });

    const rows = response.data.values || [];

    const rowIndex = rows.findIndex(
      (row, index) =>
        index > 0 &&
        String(row[0]) === candidateId
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const row = rows[rowIndex];

    const candidate = {
      candidateId: row[0] || "",
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

      aiSummary: row[16] || "",
      status: row[17] || "Pending",
      recruiterNotes: row[18] || "",
    };

    res.json({
      success: true,
      candidate,
    });

  } catch (error) {
    console.error(
      "Error fetching candidate:",
      error
    );

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

      status,
      recruiterNotes,
    } = req.body;

    // ==================================================
    // GET CURRENT SHEET
    // ==================================================

    const response =
      await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Sheet1!A:S",
      });

    const rows = response.data.values || [];

    // ==================================================
    // FIND CANDIDATE
    // ==================================================

    const rowIndex = rows.findIndex(
      (row, index) =>
        index > 0 &&
        String(row[0]) === candidateId
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Google Sheets row number
    const sheetRow = rowIndex + 1;

    const existingRow = rows[rowIndex];

    // Preserve original values
    const submissionDate =
      existingRow[1] || "";

    const aiSummary =
      existingRow[16] || "";

    // ==================================================
    // CREATE UPDATED ROW
    // ==================================================

    const updatedRow = [
      candidateId,
      submissionDate,

      fullName || "",
      phone || "",
      email || "",
      location || "",

      qualification || "",
      institution || "",
      year || "",

      company || "",
      jobTitle || "",
      startDate || "",
      endDate || "",
      experience || "",

      achievements || "",
      additionalInfo || "",

      aiSummary,

      status || "Pending",

      recruiterNotes || "",
    ];

    // ==================================================
    // UPDATE GOOGLE SHEETS
    // ==================================================

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,

      range: `Sheet1!A${sheetRow}:S${sheetRow}`,

      valueInputOption: "USER_ENTERED",

      requestBody: {
        values: [updatedRow],
      },
    });

    console.log(
      `Candidate ${candidateId} updated successfully`
    );

    res.json({
      success: true,
      message: "Candidate updated successfully",
    });

  } catch (error) {
    console.error(
      "Candidate update error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update candidate",
      error: error.message,
    });
  }
});

// ======================================================
// GENERATE AI SUMMARY USING OLLAMA
// ======================================================

async function generateAISummary(candidate) {
  const prompt = `
You are helping generate a professional CV.

Create a short professional CV summary using ONLY the information provided below.

IMPORTANT RULES:

- Do not invent information.
- Do not add skills that are not mentioned.
- Do not add experience that is not mentioned.
- Do not change facts.
- Do not exaggerate the candidate's experience.
- Keep the summary concise.
- Write approximately 2 to 4 sentences.
- If information is limited, create a simple summary.
- Do not mention information that is not provided.
- Return ONLY the CV summary.
- Do not include headings such as "Summary:".

Candidate Information:

Name:
${candidate.fullName || "Not provided"}

Qualification:
${candidate.qualification || "Not provided"}

Institution:
${candidate.institution || "Not provided"}

Year of Passing:
${candidate.year || "Not provided"}

Company:
${candidate.company || "Not provided"}

Job Title:
${candidate.jobTitle || "Not provided"}

Experience:
${candidate.experience || "Not provided"}

Achievements:
${candidate.achievements || "Not provided"}

Additional Information:
${candidate.additionalInfo || "Not provided"}
`;

  const response = await fetch(
    "http://localhost:11434/api/generate",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model: "qwen2.5:3b",
        prompt: prompt,
        stream: false,

        options: {
          temperature: 0.2,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Ollama returned HTTP ${response.status}`
    );
  }

  const data = await response.json();

  return data.response?.trim() || "";
}

// ======================================================
// SUBMIT CANDIDATE
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

    // ==================================================
    // CANDIDATE OBJECT
    // ==================================================

    const candidate = {
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
    };

    // ==================================================
    // GET EXISTING CANDIDATES
    // ==================================================

    const existingData =
      await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Sheet1!A:A",
      });

    const rows =
      existingData.data.values || [];

    // ==================================================
    // GENERATE CANDIDATE ID
    // ==================================================

    const candidateId = Math.max(
      rows.length,
      1
    );

    // ==================================================
    // DETERMINE SHEET ROW
    // ==================================================

    const sheetRow =
      rows.length + 1;

    // ==================================================
    // SUBMISSION DATE
    // ==================================================

    const submissionDate =
      new Date().toLocaleString(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
        }
      );

    // ==================================================
    // CREATE ROW
    // ==================================================

    const newRow = [
      candidateId,
      submissionDate,

      fullName || "",
      phone || "",
      email || "",
      location || "",

      qualification || "",
      institution || "",
      year || "",

      company || "",
      jobTitle || "",
      startDate || "",
      endDate || "",
      experience || "",

      achievements || "",
      additionalInfo || "",

      "",

      "Pending",

      "",
    ];

    // ==================================================
    // SAVE TO GOOGLE SHEETS
    // ==================================================

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,

      range: "Sheet1!A:S",

      valueInputOption: "USER_ENTERED",

      insertDataOption: "INSERT_ROWS",

      requestBody: {
        values: [newRow],
      },
    });

    console.log(
      `Candidate ${candidateId} saved to Google Sheets`
    );

    // ==================================================
    // RESPOND IMMEDIATELY
    // ==================================================

    res.status(201).json({
      success: true,

      message:
        "Candidate submitted successfully",

      candidateId,
    });

    // ==================================================
    // AI SUMMARY IN BACKGROUND
    // ==================================================

    (async () => {
      try {
        console.log(
          `Generating AI summary for candidate ${candidateId}...`
        );

        const aiSummary =
          await generateAISummary(
            candidate
          );

        console.log(
          `AI summary generated for candidate ${candidateId}`
        );

        if (aiSummary) {
          await sheets.spreadsheets.values.update({
            spreadsheetId:
              SPREADSHEET_ID,

            range:
              `Sheet1!Q${sheetRow}`,

            valueInputOption:
              "USER_ENTERED",

            requestBody: {
              values: [
                [aiSummary],
              ],
            },
          });

          console.log(
            `AI summary saved for candidate ${candidateId}`
          );
        }

      } catch (aiError) {
        console.error(
          `AI processing failed for candidate ${candidateId}:`,
          aiError.message
        );
      }
    })();

  } catch (error) {
    console.error(
      "Candidate submission error:",
      error
    );

    if (!res.headersSent) {
      res.status(500).json({
        success: false,

        message:
          "Failed to save candidate",

        error:
          error.message,
      });
    }
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