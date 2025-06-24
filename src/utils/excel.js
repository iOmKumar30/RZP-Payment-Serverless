import ExcelJS from "exceljs";

export const buildExcel = (rows) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Donations");

  if (!rows.length) return workbook.xlsx.writeBuffer(); 


  const columns = Object.keys(rows[0]).map((key) => ({ header: key, key }));
  sheet.columns = columns;

  rows.forEach((row) => {
    sheet.addRow(row);
  });


  sheet.getRow(1).font = { bold: true };

  return workbook.xlsx.writeBuffer(); 
};
