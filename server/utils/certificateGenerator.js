const PDFDocument = require('pdfkit');

/**
 * Streams a formal, uniquely-styled certificate of completion straight to
 * the HTTP response. No files are written to disk.
 */
function streamCertificate(res, { teacherName, courseTitle, certificateId, completionDate, hours }) {
  const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 0 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Certificate-${certificateId}.pdf"`);
  doc.pipe(res);

  const width = doc.page.width;
  const height = doc.page.height;

  const navy = '#0f2540';
  const gold = '#b8892b';
  const cream = '#faf7f0';

  // Background
  doc.rect(0, 0, width, height).fill(cream);

  // Outer border
  doc.lineWidth(3).strokeColor(navy).rect(24, 24, width - 48, height - 48).stroke();
  // Inner gold border
  doc.lineWidth(1).strokeColor(gold).rect(36, 36, width - 72, height - 72).stroke();

  // Corner ornaments (simple geometric marks for a formal, non-cringe look)
  const cornerSize = 14;
  [[36, 36], [width - 36, 36], [36, height - 36], [width - 36, height - 36]].forEach(([x, y]) => {
    doc.circle(x, y, 3).fill(gold);
  });

  doc
    .fillColor(navy)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('TEACHER PERFORMANCE & DEVELOPMENT TRACKING SYSTEM', 0, 70, {
      align: 'center',
      characterSpacing: 2,
    });

  doc
    .fillColor(gold)
    .font('Helvetica')
    .fontSize(14)
    .text('CERTIFICATE OF PROFESSIONAL DEVELOPMENT', 0, 95, { align: 'center', characterSpacing: 3 });

  doc.moveTo(width / 2 - 80, 122).lineTo(width / 2 + 80, 122).lineWidth(1).strokeColor(gold).stroke();

  doc
    .fillColor(navy)
    .font('Helvetica')
    .fontSize(13)
    .text('This certificate is proudly presented to', 0, 150, { align: 'center' });

  doc
    .fillColor(navy)
    .font('Helvetica-Bold')
    .fontSize(30)
    .text(teacherName, 0, 178, { align: 'center' });

  doc
    .fillColor('#333333')
    .font('Helvetica')
    .fontSize(13)
    .text('in recognition of the successful completion of', 0, 222, { align: 'center' });

  doc
    .fillColor(navy)
    .font('Helvetica-Bold')
    .fontSize(19)
    .text(courseTitle, 60, 248, { align: 'center', width: width - 120 });

  const formattedDate = new Date(completionDate || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc
    .fillColor('#333333')
    .font('Helvetica')
    .fontSize(11)
    .text(
      `Completed on ${formattedDate}${hours ? `  •  ${hours} training hours` : ''}`,
      0,
      290,
      { align: 'center' }
    );

  // Signature lines
  const sigY = height - 110;
  doc.moveTo(90, sigY).lineTo(280, sigY).strokeColor(navy).lineWidth(1).stroke();
  doc.fontSize(10).fillColor(navy).text('Program Administrator', 90, sigY + 6, { width: 190, align: 'center' });

  doc.moveTo(width - 280, sigY).lineTo(width - 90, sigY).strokeColor(navy).lineWidth(1).stroke();
  doc
    .fontSize(10)
    .fillColor(navy)
    .text('School Principal', width - 280, sigY + 6, { width: 190, align: 'center' });

  // Certificate ID / verification footer
  doc
    .fontSize(9)
    .fillColor('#666666')
    .text(`Certificate ID: ${certificateId}   •   Verify at your school's TPD portal`, 0, height - 44, {
      align: 'center',
    });

  doc.end();
}

module.exports = { streamCertificate };
