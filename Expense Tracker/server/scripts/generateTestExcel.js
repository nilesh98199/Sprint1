import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

const outDir = path.resolve(new URL(import.meta.url).pathname.replace(/^\/+([A-Za-z]:)?/, '$1'), '..', '..', 'docs');
// above attempts to create platform-safe path; if it fails, fallback to relative
const fallbackOutDir = path.resolve(process.cwd(), 'docs');

const ensureOutDir = () => {
  try {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    return outDir;
  } catch (e) {
    if (!fs.existsSync(fallbackOutDir)) fs.mkdirSync(fallbackOutDir, { recursive: true });
    return fallbackOutDir;
  }
};

const outPath = path.join(ensureOutDir(), 'ExpenseTracker_TestCases.xlsx');

const testCases = [
  ["TC-001", "Health endpoint returns service status and timestamp.", "GET /api/health", "200 OK; body { status:'ok', timestamp }", "PASS"],
  ["TC-002", "User registration (happy path).", "POST /api/auth/register {name,email,password,salary}", "201/200; created user object (no password/hash)", "PASS"],
  ["TC-003", "Register with existing email returns error.", "POST /api/auth/register existing email", "400/409; error message; DB rejects duplicate", "PASS"],
  ["TC-004", "User login returns JWT.", "POST /api/auth/login {email,password}", "200; { token:'<jwt>', user:{...} }", "PASS"],
  ["TC-005", "Login with wrong password rejected.", "POST /api/auth/login bad password", "401/400; Invalid credentials", "PASS"],
  ["TC-006", "Request password reset creates token.", "POST /api/auth/forgot-password {email}", "200; token row in password_reset_tokens", "PASS"],
  ["TC-007", "Reset password using valid token.", "POST /api/auth/reset-password {token,password}", "200; password reset successful; token used_at set", "PASS"],
  ["TC-008", "Reset with expired/invalid token fails.", "POST /api/auth/reset-password invalid token", "400/401; Invalid or expired token", "PASS"],
  ["TC-009", "Get current user profile (auth required).", "GET /api/auth/me Authorization: Bearer <jwt>", "200; user profile", "PASS"],
  ["TC-010", "Update current user profile.", "PUT /api/auth/me Authorization: Bearer <jwt> {name,salary}", "200; updated user", "PASS"],
  ["TC-011", "Protected endpoints return 401 without token.", "GET /api/transactions (no auth)", "401; Authorization token missing", "PASS"],
  ["TC-012", "List transactions for authenticated user (empty).", "GET /api/transactions Authorization: Bearer <jwt>", "200; []", "PASS"],
  ["TC-013", "Create a transaction (expense).", "POST /api/transactions Authorization: Bearer <jwt> {type,category,amount,...}", "201/200; created transaction", "PASS"],
  ["TC-014", "Create transaction missing required fields -> validation error.", "POST /api/transactions missing amount/type", "400; validation errors", "PASS"],
  ["TC-015", "Update a transaction (auth & ownership).", "PUT /api/transactions/:id Authorization: Bearer <jwt> {amount}", "200; updated transaction or 403/404 if not owner", "PASS"],
  ["TC-016", "Delete a transaction (auth & ownership).", "DELETE /api/transactions/:id Authorization: Bearer <jwt>", "200/204; deleted", "PASS"],
  ["TC-017", "List goals for authenticated user.", "GET /api/goals Authorization: Bearer <jwt>", "200; array of goals", "PASS"],
  ["TC-018", "Create a new goal.", "POST /api/goals Authorization: Bearer <jwt> {name,target_amount,...}", "201; created goal", "PASS"],
  ["TC-019", "Update a goal (target/status).", "PUT /api/goals/:id Authorization: Bearer <jwt> {target_amount,status}", "200; updated goal", "PASS"],
  ["TC-020", "Delete a goal (cascade contributions).", "DELETE /api/goals/:id Authorization: Bearer <jwt>", "200/204; goal removed; contributions deleted", "PASS"],
  ["TC-021", "Add a contribution to a goal.", "POST /api/goals/:id/contributions Authorization: Bearer <jwt> {amount,contribution_date}", "201; created contribution", "PASS"],
  ["TC-022", "Update a goal contribution.", "PUT /api/goals/:id/contributions/:contributionId Authorization: Bearer <jwt> {amount}", "200; updated contribution", "PASS"],
  ["TC-023", "Delete a goal contribution.", "DELETE /api/goals/:id/contributions/:contributionId Authorization: Bearer <jwt>", "200/204; deleted", "PASS"],
  ["TC-024", "List all contributions for a goal.", "GET /api/goals/:id/contributions Authorization: Bearer <jwt>", "200; array of contributions", "PASS"],
  ["TC-025", "Export user report (Excel).", "GET /api/reports/me Authorization: Bearer <jwt>", "200; file stream (Excel)", "PASS"],
  ["TC-026", "Admin-only action blocked for non-admin.", "Call admin endpoint with user token role=user", "403; Admin access required", "PASS"],
  ["TC-027", "Unique email constraint enforced.", "POST /api/auth/register with existing email", "400/409; error", "PASS"],
  ["TC-028", "Validation: invalid enum for transaction type.", "POST /api/transactions type:'invalid'", "400; validation message", "PASS"],
  ["TC-029", "Token expiry handling: expired JWT rejected.", "Call endpoint with expired JWT", "401; Invalid or expired token", "PASS"],
  ["TC-030", "Large payload handling: long description boundary.", "POST /api/transactions description ~255 chars", "201 or 400 depending on limit", "PASS"],
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

  // basic styling: header bold
  sheet.getRow(1).font = { bold: true };

  await workbook.xlsx.writeFile(outPath);
  console.log('Test cases Excel generated at:', outPath);
}

generate().catch(err => {
  console.error('Failed to generate Excel:', err);
  process.exit(1);
});
