import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set up OAuth2 credentials
  const credentials = {
    client_email: "YOUR_CLIENT_EMAIL",
    private_key: "YOUR_PRIVATE_KEY",
  };

  // Set up the Google Sheets API
  const sheets = google.sheets({ version: "v4", auth: credentials });

  // Define the spreadsheet ID and range
  const spreadsheetId = "YOUR_SPREADSHEET_ID";
  const range = "Sheet1!A:D";

  // Define the values to append
  const values: string[][] = [
    ["16/1/2021 17:30:15", "-32.142018", "115.888786", "yes"],
    ["16/1/2021 18:02:41", "-32.136237", "115.870964", "no"],
  ];

  try {
    // Append the values to the spreadsheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    res.status(200).json({ message: "Values appended successfully!" });
  } catch (error) {
    console.error("Error appending values:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the Google Sheet." });
  }
}
