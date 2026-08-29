import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

/**
 * Format number to Indonesian Rupiah string
 */
function formatRupiah(num) {
  return `Rp ${(Number(num) || 0).toLocaleString('id-ID')}`;
}

/**
 * Format date string to Indonesian formatted date
 */
function formatIndoDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * GENERATE EXCEL (.xlsx) WORKBOOK
 * Creates an elegant, styled spreadsheet for BAZNAS distribution reports
 */
export async function generateExcelReport(reportMeta, mustahikList = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BAZNAS Kota Tangerang';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Laporan Penyaluran', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
    views: [{ showGridLines: true }]
  });

  // 1. Title Header Banner
  sheet.mergeCells('A1:J1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'BADAN AMIL ZAKAT NASIONAL (BAZNAS) KOTA TANGERANG';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00704A' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;

  // Subtitle
  sheet.mergeCells('A2:J2');
  const subtitleCell = sheet.getCell('A2');
  subtitleCell.value = `LAPORAN PENYALURAN ZIS: ${String(reportMeta.title || 'Rekap Penyaluran').toUpperCase()}`;
  subtitleCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF1E293B' } };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(2).height = 22;

  // 2. Metadata Information Block
  sheet.getCell('A4').value = 'Kategori Laporan';
  sheet.getCell('B4').value = `: ${reportMeta.category || 'Ringkasan'}`;
  sheet.getCell('A5').value = 'Periode Penyaluran';
  sheet.getCell('B5').value = `: ${reportMeta.period || 'Agustus 2026'}`;
  sheet.getCell('A6').value = 'Cakupan Wilayah';
  sheet.getCell('B6').value = `: ${reportMeta.scope || '13 Kecamatan Kota Tangerang'}`;

  sheet.getCell('E4').value = 'Tanggal Cetak';
  sheet.getCell('F4').value = `: ${formatIndoDate(new Date())}`;
  sheet.getCell('E5').value = 'Total Data';
  sheet.getCell('F5').value = `: ${mustahikList.length} Penerima Manfaat`;
  sheet.getCell('E6').value = 'Status Dokumen';
  sheet.getCell('F6').value = `: Terverifikasi Valid`;

  ['A4', 'A5', 'A6', 'E4', 'E5', 'E6'].forEach(cell => {
    sheet.getCell(cell).font = { bold: true, color: { argb: 'FF475569' }, size: 9 };
  });
  ['B4', 'B5', 'B6', 'F4', 'F5', 'F6'].forEach(cell => {
    sheet.getCell(cell).font = { bold: true, color: { argb: 'FF0F172A' }, size: 9 };
  });

  // Calculate totals
  const totalApproved = mustahikList.reduce((sum, m) => sum + (Number(m.approved_amount) || Number(m.recommended_amount) || 0), 0);

  // 3. Table Column Headers
  const tableStartRow = 8;
  const columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'No Berkas', key: 'file_no', width: 18 },
    { header: 'Nama Lengkap Mustahik', key: 'name', width: 28 },
    { header: 'NIK Kependudukan', key: 'nik', width: 20 },
    { header: 'Kecamatan', key: 'kecamatan', width: 18 },
    { header: 'Kelurahan', key: 'kelurahan', width: 18 },
    { header: 'Program 5 Pilar', key: 'program', width: 22 },
    { header: 'Asnaf', key: 'asnaf', width: 14 },
    { header: 'Nominal Disetujui (Rp)', key: 'amount', width: 22 },
    { header: 'Status Berkas', key: 'status', width: 18 }
  ];

  const headerRow = sheet.getRow(tableStartRow);
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00704A' } };
    cell.alignment = { horizontal: idx === 0 || idx === 7 || idx === 9 ? 'center' : (idx === 8 ? 'right' : 'left'), vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF005A3B' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
    sheet.getColumn(idx + 1).width = col.width;
  });
  headerRow.height = 25;

  // 4. Data Rows
  mustahikList.forEach((m, idx) => {
    const rowIndex = tableStartRow + 1 + idx;
    const row = sheet.getRow(rowIndex);
    const amountVal = Number(m.approved_amount) || Number(m.recommended_amount) || 0;

    row.getCell(1).value = idx + 1;
    row.getCell(2).value = m.file_no || `MST-${String(idx + 1).padStart(4, '0')}`;
    row.getCell(3).value = m.name || '-';
    row.getCell(4).value = m.nik ? `'${m.nik}` : '-';
    row.getCell(5).value = m.kecamatan || m.subdistrict || '-';
    row.getCell(6).value = m.kelurahan || m.village || '-';
    row.getCell(7).value = m.program || 'Tangerang Peduli';
    row.getCell(8).value = m.asnaf || 'Miskin';
    row.getCell(9).value = amountVal;
    row.getCell(10).value = m.status || 'Penyaluran Selesai';

    const isZebra = idx % 2 === 1;
    const rowBg = isZebra ? 'FFF8FAFC' : 'FFFFFFFF';

    for (let c = 1; c <= 10; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Arial', size: 9 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      if (c === 1 || c === 8) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (c === 9) {
        cell.numFmt = '"Rp "#,##0';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else if (c === 10) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { bold: true, color: { argb: 'FF047857' }, size: 9 };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }
    }
    row.height = 20;
  });

  // 5. Total Summary Row
  const totalRowIndex = tableStartRow + 1 + mustahikList.length;
  const totalRow = sheet.getRow(totalRowIndex);
  sheet.mergeCells(`A${totalRowIndex}:H${totalRowIndex}`);
  const totalLabel = totalRow.getCell(1);
  totalLabel.value = 'TOTAL REALISASI DANA PENYALURAN';
  totalLabel.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
  totalLabel.alignment = { horizontal: 'right', vertical: 'middle' };

  const totalAmountCell = totalRow.getCell(9);
  totalAmountCell.value = totalApproved;
  totalAmountCell.numFmt = '"Rp "#,##0';
  totalAmountCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF00704A' } };
  totalAmountCell.alignment = { horizontal: 'right', vertical: 'middle' };

  for (let c = 1; c <= 10; c++) {
    const cell = totalRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'double', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
  }
  totalRow.height = 24;

  return await workbook.xlsx.writeBuffer();
}

/**
 * GENERATE PDF DOCUMENT
 * Creates an official, formatted PDF report with Kop BAZNAS, metadata, tables & signatures
 */
export function generatePdfReport(reportMeta, mustahikList = []) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
        info: {
          Title: reportMeta.title || 'Laporan Penyaluran BAZNAS Kota Tangerang',
          Author: 'BAZNAS Kota Tangerang Data Center V2',
          Subject: 'Laporan Penyaluran ZIS'
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      const totalApproved = mustahikList.reduce(
        (sum, m) => sum + (Number(m.approved_amount) || Number(m.recommended_amount) || 0),
        0
      );

      // --- 1. OFFICIAL LETTERHEAD (KOP SURAT) ---
      doc.fillColor('#00704A')
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('BADAN AMIL ZAKAT NASIONAL', { align: 'center' });

      doc.fillColor('#0F172A')
        .font('Helvetica-Bold')
        .fontSize(13)
        .text('KOTA TANGERANG', { align: 'center' });

      doc.fillColor('#64748B')
        .font('Helvetica')
        .fontSize(8)
        .text('Jl. Satria Sudirman No. 1, Sukaasih, Kec. Tangerang, Kota Tangerang, Banten 15111', { align: 'center' })
        .text('Website: baznaskota.tangerangkota.go.id | Email: baznas@tangerangkota.go.id', { align: 'center' });

      doc.moveDown(0.5);

      // Header Double Lines
      const lineY = doc.y;
      doc.lineWidth(2).strokeColor('#00704A').moveTo(40, lineY).lineTo(555, lineY).stroke();
      doc.lineWidth(0.75).strokeColor('#00704A').moveTo(40, lineY + 3).lineTo(555, lineY + 3).stroke();

      doc.moveDown(1.2);

      // --- 2. REPORT TITLE & INFO BOX ---
      doc.fillColor('#0F172A')
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(reportMeta.title || 'LAPORAN REKAPITULASI PENYALURAN', { align: 'center' });

      doc.fillColor('#047857')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(`PERIODE: ${(reportMeta.period || 'AGUSTUS 2026').toUpperCase()}`, { align: 'center' });

      doc.moveDown(1);

      // Metadata summary cards
      const metaBoxY = doc.y;
      doc.rect(40, metaBoxY, 515, 45).fillAndStroke('#F8FAFC', '#E2E8F0');

      doc.fillColor('#64748B').font('Helvetica-Bold').fontSize(8);
      doc.text('Kategori Laporan', 55, metaBoxY + 8);
      doc.text('Cakupan Wilayah', 200, metaBoxY + 8);
      doc.text('Total Penerima Manfaat', 360, metaBoxY + 8);

      doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(9);
      doc.text(reportMeta.category || 'Ringkasan', 55, metaBoxY + 22);
      doc.text(reportMeta.scope || '13 Kecamatan', 200, metaBoxY + 22);
      doc.text(`${mustahikList.length} Mustahik`, 360, metaBoxY + 22);

      doc.moveDown(3);

      // --- 3. SUMMARY KPI HIGHLIGHT BOX ---
      const kpiY = doc.y;
      doc.rect(40, kpiY, 515, 36).fillAndStroke('#ECFDF5', '#A7F3D0');

      doc.fillColor('#065F46').font('Helvetica-Bold').fontSize(9);
      doc.text('TOTAL REALISASI DANA PENYALURAN:', 55, kpiY + 12);

      doc.fillColor('#047857').font('Helvetica-Bold').fontSize(12);
      doc.text(formatRupiah(totalApproved), 350, kpiY + 10, { align: 'right', width: 190 });

      doc.moveDown(3);

      // --- 4. RECIPIENT MUSTAHIK TABLE ---
      doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(10).text('DAFTAR MUSTAHIK & PENERIMA MANFAAT:');
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const colWidths = { no: 25, file: 65, name: 110, nik: 85, kec: 75, prog: 80, amount: 75 };
      const tableLeft = 40;

      // Table Header
      doc.rect(tableLeft, tableTop, 515, 20).fillAndStroke('#00704A', '#005A3B');
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);

      let curX = tableLeft;
      doc.text('No', curX + 4, tableTop + 6, { width: colWidths.no, align: 'center' });
      curX += colWidths.no;
      doc.text('No Berkas', curX + 4, tableTop + 6, { width: colWidths.file });
      curX += colWidths.file;
      doc.text('Nama Mustahik', curX + 4, tableTop + 6, { width: colWidths.name });
      curX += colWidths.name;
      doc.text('NIK', curX + 4, tableTop + 6, { width: colWidths.nik });
      curX += colWidths.nik;
      doc.text('Kecamatan', curX + 4, tableTop + 6, { width: colWidths.kec });
      curX += colWidths.kec;
      doc.text('Program', curX + 4, tableTop + 6, { width: colWidths.prog });
      curX += colWidths.prog;
      doc.text('Nominal (Rp)', curX, tableTop + 6, { width: colWidths.amount - 6, align: 'right' });

      let rowY = tableTop + 20;

      // Limit printed rows to top 45 for clean PDF layout
      const printableList = mustahikList.slice(0, 45);

      printableList.forEach((m, i) => {
        // Auto page break if near bottom
        if (rowY > 720) {
          doc.addPage();
          rowY = 40;
        }

        const isEven = i % 2 === 0;
        if (!isEven) {
          doc.rect(tableLeft, rowY, 515, 17).fill('#F8FAFC');
        }

        doc.rect(tableLeft, rowY, 515, 17).stroke('#E2E8F0');
        doc.fillColor('#1E293B').font('Helvetica').fontSize(7.5);

        let rowX = tableLeft;
        doc.text(String(i + 1), rowX + 2, rowY + 5, { width: colWidths.no, align: 'center' });
        rowX += colWidths.no;
        doc.text(m.file_no || '-', rowX + 4, rowY + 5, { width: colWidths.file });
        rowX += colWidths.file;
        doc.font('Helvetica-Bold').text(m.name || '-', rowX + 4, rowY + 5, { width: colWidths.name, lineBreak: false });
        doc.font('Helvetica');
        rowX += colWidths.name;
        doc.text(m.nik ? `${m.nik.slice(0, 4)}...${m.nik.slice(-4)}` : '-', rowX + 4, rowY + 5, { width: colWidths.nik });
        rowX += colWidths.nik;
        doc.text(m.kecamatan || m.subdistrict || '-', rowX + 4, rowY + 5, { width: colWidths.kec });
        rowX += colWidths.kec;
        doc.text(m.program || 'Tangerang Peduli', rowX + 4, rowY + 5, { width: colWidths.prog });
        rowX += colWidths.prog;
        const amt = Number(m.approved_amount) || Number(m.recommended_amount) || 0;
        doc.font('Helvetica-Bold').text(amt.toLocaleString('id-ID'), rowX, rowY + 5, { width: colWidths.amount - 6, align: 'right' });

        rowY += 17;
      });

      if (mustahikList.length > 45) {
        doc.moveDown(1);
        doc.fillColor('#64748B').font('Helvetica-Oblique').fontSize(8).text(`* Menampilkan 45 dari total ${mustahikList.length} data mustahik. Unduh format Excel (.xlsx) untuk data lengkap master.`);
      }

      // --- 5. OFFICIAL SIGNATURE SECTION ---
      if (rowY > 640) {
        doc.addPage();
        rowY = 50;
      } else {
        rowY += 30;
      }

      doc.fillColor('#1E293B').font('Helvetica').fontSize(8.5);
      doc.text(`Kota Tangerang, ${formatIndoDate(new Date())}`, 360, rowY, { align: 'center', width: 180 });

      doc.text('Diverifikasi & Dibuat Oleh:', 60, rowY + 15, { align: 'center', width: 160 });
      doc.text('Mengetahui & Menyetujui,', 360, rowY + 15, { align: 'center', width: 180 });
      doc.text('Kepala Bidang Penyaluran BAZNAS', 360, rowY + 27, { align: 'center', width: 180 });

      // Signature lines
      const sigLineY = rowY + 80;
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('( Amil Pelaksana Penyaluran )', 60, sigLineY, { align: 'center', width: 160 });
      doc.text('( H. Pimpinan Penyaluran BAZNAS )', 360, sigLineY, { align: 'center', width: 180 });

      doc.font('Helvetica').fontSize(7.5).fillColor('#64748B');
      doc.text('NIK / NIP Amil BAZNAS', 60, sigLineY + 12, { align: 'center', width: 160 });
      doc.text('Pimpinan Bidang Distribusi & Pendayagunaan', 360, sigLineY + 12, { align: 'center', width: 180 });

      // Add page numbering footer to all pages
      const totalPages = doc.bufferedPageRange().count;
      for (let p = 0; p < totalPages; p++) {
        doc.switchToPage(p);
        doc.fillColor('#94A3B8').font('Helvetica').fontSize(7);
        doc.text(
          `Dokumen Resmi BAZNAS Kota Tangerang · Dicetak secara otomatis oleh SIM Penyaluran V2 · Halaman ${p + 1} dari ${totalPages}`,
          40,
          800,
          { align: 'center', width: 515 }
        );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
