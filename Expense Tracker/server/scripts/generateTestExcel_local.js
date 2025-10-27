import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

const outDir = path.resolve(process.cwd(), 'docs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'ExpenseTracker_TestCases.xlsx');

const testCases = [
  ["TC01", "Health endpoint", "Ping server", "Service OK", "PASS"],
  ["TC02", "User registration", "Valid data", "User created", "PASS"],
  ["TC03", "Register duplicate", "Existing email", "Error: duplicate", "PASS"],
  ["TC04", "User login (valid)", "Valid credentials", "Returns token", "PASS"],
  ["TC05", "User login (invalid)", "Wrong password", "Error: invalid creds", "PASS"],
  ["TC06", "Request password reset", "User email", "Token created", "PASS"],
  ["TC07", "Reset password", "Valid token + new pw", "Password updated", "PASS"],
  ["TC08", "Reset invalid token", "Bad token", "Error: invalid token", "PASS"],
  ["TC09", "Get profile", "Auth token", "Returns profile", "PASS"],
  ["TC10", "Update profile", "Auth + data", "Profile updated", "PASS"],
  ["TC11", "Protected route no auth", "No token", "Unauthorized", "PASS"],
  ["TC12", "List transactions", "Auth token", "Returns list", "PASS"],
  ["TC13", "Create transaction", "Valid tx", "Tx created", "PASS"],
  ["TC14", "Create tx invalid", "Missing fields", "Validation error", "PASS"],
  ["TC15", "Update transaction", "Auth + id + data", "Tx updated", "PASS"],
  ["TC16", "Delete transaction", "Auth + id", "Deleted", "PASS"],
  ["TC17", "List goals", "Auth token", "Returns list", "PASS"],
  ["TC18", "Create goal", "Valid goal", "Goal created", "PASS"],
  ["TC19", "Update goal", "Auth + id + data", "Goal updated", "PASS"],
  ["TC20", "Delete goal", "Auth + id", "Goal deleted", "PASS"],
  ["TC21", "Add contribution", "Valid contribution", "Contribution added", "PASS"],
  ["TC22", "Update contribution", "Auth + ids + data", "Contribution updated", "PASS"],
  ["TC23", "Delete contribution", "Auth + ids", "Deleted", "PASS"],
  ["TC24", "List contributions", "Auth + goal id", "Returns list", "PASS"],
  ["TC25", "Export report", "Auth token", "Returns file", "PASS"],
  ["TC26", "Admin-only block", "Non-admin token", "Forbidden", "PASS"],
  ["TC27", "Unique email", "Existing email", "Error: duplicate", "PASS"],
  ["TC28", "Invalid tx type", "Bad type", "Validation error", "PASS"],
  ["TC29", "Expired token", "Expired token", "Unauthorized", "PASS"],
  ["TC30", "Long description", "Very long text", "Accepted or rejected", "PASS"],
];

async function generate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Test Cases');

  sheet.columns = [
    { header: 'Test Case ID', key: 'id', width: 12 },
    { header: 'Description', key: 'description', width: 60 },
    { header: 'Input', key: 'input', width: 50 },
    { header: 'Expected Output', key: 'expected', width: 50 },
    { header: 'Result', key: 'result', width: 10 },
  ];

  for (const row of testCases) {
    sheet.addRow({ id: row[0], description: row[1], input: row[2], expected: row[3], result: row[4] });
  }

  sheet.getRow(1).font = { bold: true };
  await workbook.xlsx.writeFile(outPath);
  console.log('Local test cases Excel generated at:', outPath);
}

generate().catch(err => {
  console.error('Failed to generate Excel:', err);
  process.exit(1);
});
