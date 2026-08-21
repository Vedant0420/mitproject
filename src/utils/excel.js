import ExcelJS from 'exceljs';

/**
 * Converts an array of objects to an Excel file and triggers a download.
 * @param {Array<Object>} data - The data to export
 * @param {string} sheetName - The name of the sheet
 * @param {string} fileName - The name of the exported file (without .xlsx)
 */
export async function exportToExcel(data, sheetName = 'Sheet1', fileName = 'export') {
  if (!data || data.length === 0) {
    alert("No data available to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Get headers from first object
  const headers = Object.keys(data[0]);
  worksheet.columns = headers.map(h => ({ header: h, key: h }));

  // Add rows
  data.forEach(row => {
    worksheet.addRow(row);
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Create download link
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}
