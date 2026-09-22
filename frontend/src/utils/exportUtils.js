import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exports an array of expense objects to a standard CSV file with UTF-8 BOM encoding.
 *
 * @param {Array} expenses - Array of expense items
 * @param {Object} options - Export options (filename, currency)
 */
export function exportToCSV(expenses = [], { filename, currency = 'USD' } = {}) {
  const headers = ['Date', 'Title', 'Category', 'Amount', 'Currency', 'Payment Method', 'Status', 'Notes'];

  const rows = expenses.map((item) => {
    let dateStr = '';
    if (item.date) {
      try {
        dateStr = new Date(item.date).toISOString().split('T')[0];
      } catch {
        dateStr = String(item.date);
      }
    }

    return [
      dateStr,
      `"${String(item.title || '').replace(/"/g, '""')}"`,
      `"${String(item.category || '').replace(/"/g, '""')}"`,
      Number(item.amount || 0).toFixed(2),
      currency,
      `"${String(item.paymentMethod || 'Card').replace(/"/g, '""')}"`,
      `"${String(item.status || 'Completed').replace(/"/g, '""')}"`,
      `"${String(item.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  // Prepend UTF-8 BOM for Microsoft Excel / Sheets UTF-8 compatibility
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const defaultFilename = `Expense_Export_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', filename || defaultFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a branded PDF Financial Activity Statement.
 *
 * @param {Array} expenses - Array of expense items
 * @param {Object} options - Statement options (user, settings, dateRangeLabel, filename)
 */
export function exportToPDF(
  expenses = [],
  { user = {}, settings = {}, dateRangeLabel = 'All Time', filename } = {}
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const currencySymbol = settings.currency === 'PKR' ? 'PKR ' : settings.currency === 'EUR' ? '€' : settings.currency === 'GBP' ? '£' : '$';
  const formatMoney = (val) => `${currencySymbol}${Number(val || 0).toFixed(2)}`;

  const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const count = expenses.length;
  const avgSpent = count > 0 ? totalSpent / count : 0;

  // Compute Top Category
  const categoryTotals = expenses.reduce((acc, item) => {
    const cat = item.category || 'Other';
    acc[cat] = (acc[cat] || 0) + Number(item.amount || 0);
    return acc;
  }, {});

  let topCategory = 'None';
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, sum]) => {
    if (sum > topCategoryAmount) {
      topCategory = cat;
      topCategoryAmount = sum;
    }
  });
  const topCategoryPct = totalSpent > 0 ? Math.round((topCategoryAmount / totalSpent) * 100) : 0;

  const userName = user?.name || settings?.fullName || 'Valued User';
  const userEmail = user?.email || settings?.email || 'N/A';
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Top Header Banner
  doc.setFillColor(15, 23, 42); // Navy #0f172a
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('EXPENSE TRACKER PRO', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('OFFICIAL FINANCIAL ACTIVITY STATEMENT', 14, 23);

  // 2. Account & Scope Metadata
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Account Holder: ${userName} (${userEmail})`, 14, 33);
  doc.text(`Statement Period: ${dateRangeLabel}`, 130, 33);
  doc.text(`Generated On: ${todayStr}`, 130, 38);

  // 3. Executive KPI Metric Cards
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.roundedRect(14, 48, 42, 18, 2, 2, 'F');
  doc.roundedRect(60, 48, 42, 18, 2, 2, 'F');
  doc.roundedRect(106, 48, 46, 18, 2, 2, 'F');
  doc.roundedRect(156, 48, 40, 18, 2, 2, 'F');

  // KPI Labels
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL SPENT', 18, 54);
  doc.text('TOTAL RECORDS', 64, 54);
  doc.text('TOP CATEGORY', 110, 54);
  doc.text('AVG / TRANSACTION', 160, 54);

  // KPI Values
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42); // Dark slate
  doc.text(formatMoney(totalSpent), 18, 62);
  doc.text(`${count} items`, 64, 62);
  doc.text(`${topCategory} (${topCategoryPct}%)`, 110, 62);
  doc.text(formatMoney(avgSpent), 160, 62);

  // 4. Transactions AutoTable
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  const tableData = sortedExpenses.map((item) => {
    let dateStr = '';
    if (item.date) {
      try {
        dateStr = new Date(item.date).toISOString().split('T')[0];
      } catch {
        dateStr = String(item.date);
      }
    }

    return [
      dateStr,
      String(item.title || 'Untitled'),
      String(item.category || 'General'),
      String(item.paymentMethod || 'Card'),
      String(item.status || 'Completed'),
      formatMoney(item.amount),
    ];
  });

  const renderTable = doc.autoTable || autoTable;

  renderTable(doc, {
    startY: 72,
    head: [['Date', 'Description', 'Category', 'Method', 'Status', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 28 },
      3: { cellWidth: 28 },
      4: { cellWidth: 22 },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] },
    },
    foot: [['', 'Total', '', '', `${count} items`, formatMoney(totalSpent)]],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    didDrawPage: (data) => {
      // Footer on every page
      const totalPages = doc.internal.getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Expense Tracker Pro • Statement Generated ${todayStr} • Confidential Financial Record`,
        14,
        290
      );
      doc.text(`Page ${data.pageNumber} of ${totalPages}`, 185, 290);
    },
  });

  const defaultPdfName = `Expense_Statement_${todayStr}.pdf`;
  doc.save(filename || defaultPdfName);
}
