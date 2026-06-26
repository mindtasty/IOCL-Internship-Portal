// pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a styled evaluation summary PDF for completed internships.
 * @param {Object} data - Student, Mentor, and Score information.
 * @param {string} destPath - Filename and path to output.
 */
function generateEvaluationSummaryPDF(data, destPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(destPath);
      doc.pipe(stream);

      // --- Header Design ---
      doc
        .fillColor('#1e3a8a') // Primary navy blue
        .font('Helvetica-Bold')
        .fontSize(24)
        .text('INTERNSHIP PERFORMANCE SUMMARY', { align: 'center' });
      
      doc.moveDown(0.5);
      
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();
      
      doc.moveDown(1.5);

      // --- Student and Internship Meta Details ---
      doc.fillColor('#374151').font('Helvetica-Bold').fontSize(14).text('Internship Details');
      doc.moveDown(0.5);

      doc.font('Helvetica').fontSize(11);
      const startY = doc.y;
      
      // Column 1
      doc.text(`Student Name: ${data.studentName}`, 60, startY);
      doc.text(`Department: ${data.department}`, 60, startY + 20);
      doc.text(`Company Name: ${data.companyName}`, 60, startY + 40);
      
      // Column 2
      doc.text(`Mentor Name: ${data.mentorName}`, 320, startY);
      doc.text(`Intern Title: ${data.title}`, 320, startY + 20);
      doc.text(`Duration: ${data.startDate} to ${data.endDate}`, 320, startY + 40);

      doc.moveDown(4);

      // --- Performance Evaluation Scores ---
      doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(14).text('Performance Scoring');
      doc.moveDown(0.8);

      // Drawing Grid Table Header
      const tableTop = doc.y;
      doc.strokeColor('#1e3a8a').lineWidth(1);
      doc.rect(50, tableTop, 495, 25).fillAndStroke('#f3f4f6', '#1e3a8a');
      
      doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(10);
      doc.text('Evaluation Criteria', 70, tableTop + 8);
      doc.text('Score (Out of 5)', 400, tableTop + 8, { width: 100, align: 'center' });

      // Criteria Rows
      const scores = [
        { label: 'Technical Coding & Engineering Skills', score: data.technical_skills },
        { label: 'Learning Agility & Fast Comprehension', score: data.learning_ability },
        { label: 'Professional Communication & Teamwork', score: data.communication },
        { label: 'Discipline, Attendance & Punctuality', score: data.discipline },
        { label: 'Overall Engagement & Collaboration', score: data.attendance_score }
      ];

      let rowY = tableTop + 25;
      doc.font('Helvetica').fillColor('#374151');

      scores.forEach((item, index) => {
        // Draw row background for zebra striping
        if (index % 2 === 1) {
          doc.fillColor('#f9fafb').rect(50, rowY, 495, 25).fill();
        }
        
        doc.fillColor('#374151').font('Helvetica');
        doc.text(item.label, 70, rowY + 8);
        doc.text(`${item.score} / 5`, 400, rowY + 8, { width: 100, align: 'center' });

        // Draw border
        doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, rowY + 25).lineTo(545, rowY + 25).stroke();
        rowY += 25;
      });

      // Draw overall box outline
      doc.strokeColor('#1e3a8a').lineWidth(1).rect(50, tableTop, 495, rowY - tableTop).stroke();

      doc.y = rowY;
      doc.moveDown(2);

      // --- Mentor Remarks ---
      doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(14).text('Mentor Remarks & Comments');
      doc.moveDown(0.5);
      doc
        .font('Helvetica-Oblique')
        .fillColor('#4b5563')
        .fontSize(11)
        .text(data.evaluation_remarks || 'No remarks provided.', { width: 495, align: 'justify' });

      doc.moveDown(3);

      // --- Signature Block ---
      const sigY = doc.y;
      doc.strokeColor('#d1d5db').lineWidth(1).moveTo(60, sigY + 40).lineTo(200, sigY + 40).stroke();
      doc.strokeColor('#d1d5db').lineWidth(1).moveTo(340, sigY + 40).lineTo(480, sigY + 40).stroke();

      doc.font('Helvetica-Bold').fillColor('#374151').fontSize(10);
      doc.text('Mentor Signature', 60, sigY + 48, { width: 140, align: 'center' });
      doc.text('L&D Authorized Signatory', 340, sigY + 48, { width: 140, align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve();
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateEvaluationSummaryPDF
};
