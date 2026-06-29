const db = require('../config/db');
const cloudinary = require('cloudinary').v2;
const { generateEvaluationSummaryPDF } = require('../utils/pdfGenerator');
const { logActivity, createNotification } = require('../utils/helpers');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadBufferToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'iocl-portal/summaries', resource_type: 'raw', public_id: publicId, format: 'pdf' },
      (error, result) => (error ? reject(error) : resolve(result))
    ).end(buffer);
  });
}

async function submitEvaluation(req, res) {
  const applicationId = req.params.id;
  const evaluatorId   = req.user.id;
  const { technical_skills, learning_ability, communication, discipline, attendance_score, evaluation_remarks } = req.body;

  if (!technical_skills || !learning_ability || !communication || !discipline || !attendance_score) {
    return res.status(400).json({ message: 'All evaluation scores (1 to 5) are required.' });
  }

  try {
    const apps = await db.query(
      `SELECT a.*, u.first_name as student_first, u.last_name as student_last,
              d.name as department_name, d.code as department_code
       FROM applications a
       JOIN users u ON a.student_id = u.id
       JOIN departments d ON a.department_id = d.id
       WHERE a.id = ?`,
      [applicationId]
    );
    if (apps.length === 0) return res.status(404).json({ message: 'Application not found.' });
    const application = apps[0];

    if (!['Internship Active', 'Internship Completed'].includes(application.status)) {
      return res.status(400).json({ message: 'Evaluation can only be submitted for active internships.' });
    }

    const evaluators = await db.query('SELECT first_name, last_name FROM users WHERE id = ?', [evaluatorId]);
    const evaluatorName = evaluators.length > 0 ? `${evaluators[0].first_name} ${evaluators[0].last_name}` : 'Mentor';

    const pdfData = {
      studentName: `${application.student_first} ${application.student_last}`,
      department:  application.department_name,
      companyName: application.company_name,
      mentorName:  evaluatorName,
      title:       application.internship_title,
      startDate:   new Date(application.start_date).toLocaleDateString(),
      endDate:     new Date(application.end_date).toLocaleDateString(),
      technical_skills, learning_ability, communication, discipline, attendance_score, evaluation_remarks,
    };

    const pdfBuffer  = await generateEvaluationSummaryPDF(pdfData);
    const publicId   = `summary-${applicationId}-${Date.now()}`;
    const uploaded   = await uploadBufferToCloudinary(pdfBuffer, publicId);
    const fileUrl    = uploaded.secure_url;

    await db.query(
      `INSERT INTO internship_summaries
         (application_id, technical_skills, learning_ability, communication, discipline, attendance_score, evaluation_remarks, file_path, evaluated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(application_id) DO UPDATE SET
         technical_skills  = excluded.technical_skills,
         learning_ability  = excluded.learning_ability,
         communication     = excluded.communication,
         discipline        = excluded.discipline,
         attendance_score  = excluded.attendance_score,
         evaluation_remarks= excluded.evaluation_remarks,
         file_path         = excluded.file_path,
         evaluated_by      = excluded.evaluated_by`,
      [applicationId, technical_skills, learning_ability, communication, discipline,
       attendance_score, evaluation_remarks || null, fileUrl, evaluatorId]
    );

    await logActivity(applicationId, evaluatorId, 'Final Evaluation Submitted', `Evaluation compiled by ${evaluatorName}.`);
    await createNotification(application.student_id, 'Internship Evaluation Completed',
      'Your mentor has submitted your final performance evaluation. You can now view the scorecard.');

    res.status(200).json({ message: 'Evaluation saved successfully.', pdfUrl: fileUrl });
  } catch (error) {
    console.error('Submit evaluation error:', error);
    res.status(500).json({ message: 'Failed to record evaluation summary.' });
  }
}

async function uploadCertificate(req, res) {
  const applicationId = req.params.id;
  const uploaderId    = req.user.id;

  if (!req.file) return res.status(400).json({ message: 'Please upload a PDF certificate file.' });

  try {
    const apps = await db.query('SELECT student_id, status FROM applications WHERE id = ?', [applicationId]);
    if (apps.length === 0) return res.status(404).json({ message: 'Application not found.' });

    // req.file.path = Cloudinary secure_url (set by multer-storage-cloudinary)
    await db.query(
      `INSERT INTO certificates (application_id, file_name, file_path, uploaded_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(application_id) DO UPDATE SET
         file_name   = excluded.file_name,
         file_path   = excluded.file_path,
         uploaded_by = excluded.uploaded_by`,
      [applicationId, req.file.originalname, req.file.path, uploaderId]
    );

    await db.query("UPDATE applications SET status = 'Internship Completed' WHERE id = ?", [applicationId]);

    await logActivity(applicationId, uploaderId, 'Certificate Distributed',
      'Admin/HR uploaded completion certificate and closed internship.');
    await createNotification(apps[0].student_id, 'Internship Completed!',
      'Congratulations! Your completion certificate has been uploaded. Download it from the Completion Portal.');

    res.status(200).json({ message: 'Certificate uploaded and internship completed successfully.' });
  } catch (error) {
    console.error('Upload certificate error:', error);
    res.status(500).json({ message: 'Failed to upload certificate.' });
  }
}

module.exports = { submitEvaluation, uploadCertificate };