import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 14;
const contentWidth = pageWidth - margin * 2;

// Color Palette
const PRIMARY = [30, 41, 59];      // #1E293B Slate 800
const ACCENT = [79, 70, 229];      // #4F46E5 Indigo 600
const SUCCESS = [16, 185, 129];    // #10B981 Emerald 500
const TEXT_DARK = [15, 23, 42];    // #0F172A Slate 900
const TEXT_MUTED = [100, 116, 139];// #64748B Slate 500
const BG_LIGHT = [248, 250, 252];  // #F8FAFC
const CODE_BG = [241, 245, 249];   // #F1F5F9 Slate 100

let yPos = 16;

function checkPageBreak(spaceNeeded) {
  if (yPos + spaceNeeded > pageHeight - 18) {
    doc.addPage();
    yPos = 18;
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// HEADER SECTION
// -------------------------------------------------------------
doc.setFillColor(...BG_LIGHT);
doc.roundedRect(margin, yPos, contentWidth, 34, 3, 3, 'F');
doc.setDrawColor(...ACCENT);
doc.setLineWidth(0.6);
doc.line(margin, yPos, margin + 4, yPos);

doc.setFont('helvetica', 'bold');
doc.setFontSize(15);
doc.setTextColor(...PRIMARY);
doc.text('MOBILE COMPUTING LAB — PROJECT PROPOSAL', margin + 6, yPos + 9);

doc.setFontSize(12);
doc.setTextColor(...ACCENT);
doc.text('Expense Tracker Pro & SplitVault', margin + 6, yPos + 16);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(...TEXT_MUTED);
doc.text('A Functional Cross-Platform Mobile Application Built With Flutter (Dart), REST API & Cloud Database', margin + 6, yPos + 22);
doc.text('Submission Domain: Mobile Computing (MC) Lab  |  Target Platforms: Android & iOS', margin + 6, yPos + 28);

yPos += 40;

// Helper: Section Title
function addSectionTitle(title, number = '') {
  checkPageBreak(16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...ACCENT);
  const text = number ? `${number}. ${title}` : title;
  doc.text(text.toUpperCase(), margin, yPos);
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, yPos + 2, margin + contentWidth, yPos + 2);
  yPos += 7;
}

// -------------------------------------------------------------
// SECTION 1: PROPOSAL SPECIFICATION TABLE (UNIVERSITY FORMAT)
// -------------------------------------------------------------
addSectionTitle('Project Proposal Specification (Standard Format)', '1');

const proposalTableData = [
  ['Project Title', 'Expense Tracker Pro & SplitVault — Smart Personal Finance & Mutual Roommate Debt Simplification Mobile App'],
  ['Problem Statement', 'University students and hostel roommates face significant confusion, calculation errors, and lost receipts when tracking individual budgets and shared living expenses (rent, groceries, bills). Existing apps lack mutual payment proof verification, fail to automatically simplify counter-debts (e.g. A owes B 150, B owes A 100 -> nets to B owes A 50), and don\'t provide automated monthly PDF archiving or cloud storage management on free tiers.'],
  ['Proposed Solution', 'A production-ready Flutter (Dart) mobile application integrating personal expense analytics (daily spend, dynamic burn rate, monthly vs all-time breakdown) with "SplitVault", a collaborative group expense sharing engine featuring dynamic custom splitting (auto-calculating payer share), automatic pairwise debt netting, digital receipt verification (Easypaisa, JazzCash, Raast, Bank Transfer), and automated monthly PDF statement downloads with cloud pruning alerts.'],
  ['Objectives', '01. Enable secure user registration, login (Email & Google OAuth), and account-specific data access with a PIN-protected Privacy Vault.\n02. Allow users to add, edit, delete, categorize, search, and filter personal expenses across custom categories and payment methods.\n03. Calculate real-time daily spend, dynamic average expense per day for the current month, and categorical percentage distribution charts.\n04. Facilitate SplitVault group creation via invite codes and multi-mode expense splitting (Equal, Percentage, Custom with auto payer share).\n05. Implement automated Pairwise Debt Simplification (Netting Algorithm) to eliminate opposing debts (e.g. A owes B 150 & B owes A 100 -> B owes A 50).\n06. Provide digital payment proof verification (Easypaisa/JazzCash/Bank) and automated monthly PDF statement export with storage retention alerts.'],
  ['Target Users', 'University students, hostel roommates, apartment flatmates, shared outing groups, and young professionals managing personal and collaborative expenses.'],
  ['Main Features', '• Dashboard with Today\'s Spend Banner, Dynamic Burn Rate, and Categorical Percentages.\n• SplitVault Group System with 8-character cryptographic invite codes.\n• Custom Split Mode with Dynamic Payer Remaining Share Calculation.\n• Pairwise Debt Simplification (Netting Algorithm) for minimal settlement transactions.\n• Asymmetric Payment Proof Pipeline (Receipt upload, TID, Payer 1-tap verification).\n• Automated Monthly PDF Statement Export & Cloud Pruning advance notifications.'],
  ['Technology Stack', '• Mobile Frontend: Flutter (Dart 3.x), Responsive Widgets, fl_chart\n• Backend Server: Node.js (Express), RESTful API, JWT Authentication\n• Database: MongoDB Atlas / Cloud Firestore\n• Mobile Storage: path_provider, pdf, printing, Hive / SharedPreferences'],
  ['System Architecture', 'Flutter UI (Screens/Widgets) -> Dart Logic (Validation/Debt Netting State) -> REST API Endpoints (Auth/CRUD/Proofs) -> Cloud Database (Users/Expenses/Groups) -> Local Storage (PDF Statement Downloads).'],
  ['Expected Outcome', 'A fully functional mobile application running on physical Android devices demonstrating complete user flows: login, expense logging, group splitting with auto-calculated shares, debt netting visualizer, payment proof review, and on-device monthly PDF statement export.']
];

autoTable(doc, {
  startY: yPos,
  margin: { left: margin, right: margin },
  head: [['Section', 'Student Proposal Details']],
  body: proposalTableData,
  theme: 'grid',
  headStyles: {
    fillColor: ACCENT,
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 8.5,
    cellPadding: 2.8,
  },
  columnStyles: {
    0: { cellWidth: 38, fontStyle: 'bold', textColor: PRIMARY, fontSize: 8 },
    1: { cellWidth: contentWidth - 38, textColor: TEXT_DARK, fontSize: 7.8 },
  },
  styles: {
    cellPadding: 2.5,
    lineColor: [226, 232, 240],
    lineWidth: 0.2,
    valign: 'middle',
  },
  didDrawPage: (data) => {
    yPos = data.cursor.y + 7;
  }
});

yPos = doc.lastAutoTable.finalY + 7;

// -------------------------------------------------------------
// SECTION 2: ARCHITECTURE & HOW THE APP ACTUALLY WORKS
// -------------------------------------------------------------
addSectionTitle('System Architecture & End-to-End Mobile Flow', '2');

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(...TEXT_DARK);
const archIntro = 'Following the required functional architecture (Flutter UI -> Dart Logic -> Backend API -> Database), the application executes clean asynchronous requests and processes state reactively on mobile devices:';
doc.text(archIntro, margin, yPos, { maxWidth: contentWidth });
yPos += 5;

const flowSteps = [
  ['Step 1: User Action', 'Student enters a shared expense of Rs 500 in Flutter and assigns Roommate shares (e.g. Rs 250, Rs 200).'],
  ['Step 2: Flutter UI', 'TextFields collect inputs; UI dynamically shows "Auto-calculated" remaining badge for Payer.'],
  ['Step 3: Dart Logic', 'Dart calculates Payer share: Max(0, Total - Sum(Roommates)) = Rs 50; validates non-empty inputs and participants.'],
  ['Step 4: API Request', 'Flutter sends HTTP POST request with JSON payload to /api/splitvault/expenses with Bearer JWT token.'],
  ['Step 5: Backend Logic', 'Node.js server verifies JWT, creates expense record, runs Pairwise Debt Netting, and generates notifications.'],
  ['Step 6: Database', 'MongoDB stores the SplitExpense document and updates group settlement ledger.'],
  ['Step 7: API Response', 'Backend returns HTTP 201 with created expense and updated pairwise net settlements array.'],
  ['Step 8: UI Update', 'Flutter updates state via reactive provider; group settlement ring and "Simplified Net Balances" refresh instantly.']
];

autoTable(doc, {
  startY: yPos,
  margin: { left: margin, right: margin },
  head: [['Step', 'Execution Detail (Flutter -> Dart -> Backend -> DB)']],
  body: flowSteps,
  theme: 'striped',
  headStyles: {
    fillColor: PRIMARY,
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 8,
    cellPadding: 2.2,
  },
  columnStyles: {
    0: { cellWidth: 38, fontStyle: 'bold', textColor: ACCENT, fontSize: 7.8 },
    1: { cellWidth: contentWidth - 38, textColor: TEXT_DARK, fontSize: 7.5 },
  },
  styles: {
    cellPadding: 2,
    lineColor: [241, 245, 249],
    lineWidth: 0.1,
  },
});

yPos = doc.lastAutoTable.finalY + 7;

// -------------------------------------------------------------
// SECTION 3: DATABASE SCHEMA & COLLECTIONS
// -------------------------------------------------------------
addSectionTitle('Database Collections & Schema Structure', '3');

const dbCollections = [
  ['users', 'id, name, email, passwordHash, avatarUrl, createdAt'],
  ['expenses', 'id, userId, title, amount, category, paymentMethod, date, notes, status'],
  ['groups', 'id, name, category, icon, inviteCode, createdBy, members: [{ user, name, email, role, joinedAt }]'],
  ['split_expenses', 'id, groupId, title, totalAmount, category, paidBy, paidByName, splitType, splits, isFullySettled, date'],
  ['splits (Sub-document)', 'user, name, email, amount, percentage, status (Unpaid/UnderReview/Verified), proof: { method, transactionId, imageUrl, senderNote, submittedAt, verifiedAt }'],
  ['notifications', 'id, userId, title, message, type (info/alert/expense-add), metadata, isRead, createdAt']
];

autoTable(doc, {
  startY: yPos,
  margin: { left: margin, right: margin },
  head: [['Collection / Table', 'Schema Fields & Document Attributes']],
  body: dbCollections,
  theme: 'grid',
  headStyles: {
    fillColor: ACCENT,
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 8,
    cellPadding: 2.2,
  },
  columnStyles: {
    0: { cellWidth: 42, fontStyle: 'bold', textColor: PRIMARY, fontSize: 7.8 },
    1: { cellWidth: contentWidth - 42, textColor: TEXT_DARK, fontSize: 7.5 },
  },
  styles: {
    cellPadding: 2,
    lineColor: [226, 232, 240],
    lineWidth: 0.2,
  },
});

yPos = doc.lastAutoTable.finalY + 7;

// -------------------------------------------------------------
// SECTION 4: FLUTTER & DART CORE ALGORITHMIC IMPLEMENTATION
// -------------------------------------------------------------
addSectionTitle('Core Dart Logic: Validation & Debt Simplification', '4');

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(...TEXT_DARK);
doc.text('Below is the functional Dart implementation demonstrating dynamic payer calculation, expense validation, and the pairwise debt netting algorithm as required by the Mobile Computing lab guide.', margin, yPos, { maxWidth: contentWidth });
yPos += 5;

const dartCodeLines = [
  '// 1. Participant Model with Dynamic Payer Share Calculation',
  'class SplitParticipant {',
  '  final String userId;',
  '  final String name;',
  '  double amount;',
  '  final bool isPayer;',
  '  SplitParticipant({required this.userId, required this.name, this.amount = 0.0, this.isPayer = false});',
  '}',
  '',
  '// 2. Custom Split Calculator: Auto-calculates Payer share from total',
  'void autoCalculatePayerShare(List<SplitParticipant> participants, double total) {',
  '  final othersSum = participants.where((p) => !p.isPayer).fold(0.0, (sum, p) => sum + p.amount);',
  '  final payer = participants.firstWhere((p) => p.isPayer);',
  '  payer.amount = (total - othersSum) > 0 ? (total - othersSum) : 0.0;',
  '}',
  '',
  '// 3. Pairwise Debt Netting Algorithm: Eliminates mutual opposing debts',
  'class NetSettlement {',
  '  final String fromUser, toUser;',
  '  final double netAmount;',
  '  NetSettlement({required this.fromUser, required this.toUser, required this.netAmount});',
  '}',
  '',
  'List<NetSettlement> computeNetSettlements(Map<String, Map<String, double>> directDebts) {',
  '  List<NetSettlement> results = [];',
  '  List<String> users = directDebts.keys.toList();',
  '  for (int i = 0; i < users.length; i++) {',
  '    for (int j = i + 1; j < users.length; j++) {',
  '      String u1 = users[i], u2 = users[j];',
  '      double u1OwesU2 = directDebts[u1]?[u2] ?? 0.0;',
  '      double u2OwesU1 = directDebts[u2]?[u1] ?? 0.0;',
  '      double net = u1OwesU2 - u2OwesU1;',
  '      if (net > 0) results.add(NetSettlement(fromUser: u1, toUser: u2, netAmount: net));',
  '      else if (net < 0) results.add(NetSettlement(fromUser: u2, toUser: u1, netAmount: net.abs()));',
  '    }',
  '  }',
  '  return results; // Example: A owes B 150 & B owes A 100 -> B owes A 50',
  '}'
];

const codeBoxHeight = dartCodeLines.length * 3.3 + 4;
checkPageBreak(codeBoxHeight + 6);

doc.setFillColor(...CODE_BG);
doc.roundedRect(margin, yPos, contentWidth, codeBoxHeight, 2, 2, 'F');
doc.setDrawColor(203, 213, 225);
doc.setLineWidth(0.3);
doc.roundedRect(margin, yPos, contentWidth, codeBoxHeight, 2, 2, 'S');

doc.setFont('courier', 'normal');
doc.setFontSize(7);

let codeY = yPos + 3.8;
for (const line of dartCodeLines) {
  if (line.startsWith('//')) {
    doc.setTextColor(...ACCENT);
    doc.setFont('courier', 'bold');
  } else {
    doc.setTextColor(15, 23, 42);
    doc.setFont('courier', 'normal');
  }
  doc.text(line, margin + 4, codeY);
  codeY += 3.3;
}

yPos += codeBoxHeight + 7;

// -------------------------------------------------------------
// SECTION 5: SUGGESTED DEVELOPMENT PLAN & TIMELINE
// -------------------------------------------------------------
addSectionTitle('Suggested Development Plan (7-Week Schedule)', '5');

const planRows = [
  ['Week 1 — Proposal & Specs', 'Problem definition, user stories, architecture design, and instructor approval.', 'Approved Proposal'],
  ['Week 2 — UI & Navigation', 'Flutter responsive screens (Dashboard, SplitVault, Add Expense, Group Details).', 'Running Flutter UI'],
  ['Week 3 — Dart Logic & State', 'Models, validation, dynamic payer calculation, and Debt Netting Algorithm.', 'Working Dart Logic'],
  ['Week 4 — Backend & Auth', 'Node.js/Express API, JWT authentication, and secure password hashing.', 'Login & API Demo'],
  ['Week 5 — Database & CRUD', 'MongoDB Atlas collections, expense logging, and group invite code generation.', 'Stored & Retrieved Data'],
  ['Week 6 — Integration & Proofs', 'Flutter-to-Backend HTTP integration, image proof submission, and Payer 1-tap review.', 'End-to-End Demo'],
  ['Week 7 — PDF & Testing', 'Automated on-device monthly PDF statement export, edge case testing, and error handling.', 'Test Cases & PDF Export'],
  ['Final — Presentation & Viva', 'Demonstration of running mobile app on physical Android device and code defense.', 'Final Working Project']
];

autoTable(doc, {
  startY: yPos,
  margin: { left: margin, right: margin },
  head: [['Phase', 'Student Development Activities', 'Evidence / Demo Deliverable']],
  body: planRows,
  theme: 'striped',
  headStyles: {
    fillColor: PRIMARY,
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 8,
    cellPadding: 2.2,
  },
  columnStyles: {
    0: { cellWidth: 42, fontStyle: 'bold', textColor: ACCENT, fontSize: 7.8 },
    1: { cellWidth: contentWidth - 84, textColor: TEXT_DARK, fontSize: 7.5 },
    2: { cellWidth: 42, fontStyle: 'bold', textColor: SUCCESS, fontSize: 7.5 },
  },
  styles: {
    cellPadding: 2,
    lineColor: [241, 245, 249],
    lineWidth: 0.1,
  },
});

yPos = doc.lastAutoTable.finalY + 7;

// -------------------------------------------------------------
// SECTION 6: MINIMUM DEMONSTRATION & FINAL CHECKLIST
// -------------------------------------------------------------
addSectionTitle('Final Lab Demonstration & Student Checklist', '6');

const checklistData = [
  ['Authentication Flow', 'User registers and logs in with validated email and password credentials.'],
  ['Personal Expense Logging', 'Creates daily expense; dashboard updates Today\'s spend and dynamic average burn rate.'],
  ['Group Invite & Membership', 'Creates a hostel group with unique 8-character invite code; roommates join with code.'],
  ['Custom Split with Auto-Calc', 'User inputs roommate amounts; Payer remaining share automatically updates on-screen.'],
  ['Debt Netting Demonstration', 'A owes B 150, B owes A 100 -> System displays netted balance: "B owes A Rs 50".'],
  ['Payment Proof Pipeline', 'Debtor uploads Easypaisa/JazzCash receipt; Payer verifies with 1-tap in proof modal.'],
  ['On-Device Monthly PDF Export', 'App compiles itemized monthly financial report and saves directly to mobile device storage.'],
  ['Cloud Pruning Notification', 'Demonstrates 60-day cloud pruning alert preventing free-tier database overflow.']
];

autoTable(doc, {
  startY: yPos,
  margin: { left: margin, right: margin },
  head: [['Checklist Item', 'Functional Demonstration Requirement']],
  body: checklistData,
  theme: 'grid',
  headStyles: {
    fillColor: ACCENT,
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 8,
    cellPadding: 2.2,
  },
  columnStyles: {
    0: { cellWidth: 50, fontStyle: 'bold', textColor: PRIMARY, fontSize: 7.8 },
    1: { cellWidth: contentWidth - 50, textColor: TEXT_DARK, fontSize: 7.5 },
  },
  styles: {
    cellPadding: 2,
    lineColor: [226, 232, 240],
    lineWidth: 0.2,
  },
});

// -------------------------------------------------------------
// FOOTER (PAGE NUMBERS)
// -------------------------------------------------------------
const totalPages = doc.internal.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
  doc.setPage(i);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    `Mobile Computing Lab Project Proposal — Expense Tracker Pro & SplitVault`,
    margin,
    pageHeight - 7
  );
  doc.text(
    `Page ${i} of ${totalPages}`,
    pageWidth - margin - 18,
    pageHeight - 7
  );
}

// Write PDF to disk
const targetPath = 'C:\\Users\\You_The_Real_Beast\\.gemini\\antigravity\\scratch\\MC_Lab_Project_Proposal_Expense_Tracker_Pro.pdf';
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(targetPath, Buffer.from(pdfBytes));

console.log('SUCCESS: Proposal PDF generated at:', targetPath);
