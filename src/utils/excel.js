import * as XLSX from 'xlsx';

/**
 * Converts an array of objects to an Excel file and triggers a download.
 * @param {Array<Object>} data - The data to export
 * @param {string} sheetName - The name of the sheet
 * @param {string} fileName - The name of the exported file (without .xlsx)
 */
export function exportToExcel(data, sheetName = 'Sheet1', fileName = 'export') {
  if (!data || data.length === 0) {
    alert("No data available to export");
    return;
  }

  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert JSON to worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Write and trigger download
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
