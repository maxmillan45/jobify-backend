// backend/routes/applications.js
const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/applications
// @desc    Apply for a job
router.post('/', protect, authorize('jobseeker'), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.id,
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      employer: job.employer,
      coverLetter,
    });
    
    // Create notification for employer
    await Notification.create({
      user: job.employer,
      type: 'application',
      title: 'New Application',
      message: `${req.user.name} applied for ${job.title}`,
      link: `/applications/${application._id}`,
    });
    
    res.status(201).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/applications/my-applications
// @desc    Get user's applications
router.get('/my-applications', protect, authorize('jobseeker'), async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location type')
      .sort('-appliedAt');
    
    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/applications/employer-applications
// @desc    Get applications for employer's jobs
router.get('/employer-applications', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const applications = await Application.find({ employer: req.user.id })
      .populate('job', 'title company location')
      .populate('applicant', 'name email')
      .sort('-appliedAt');
    
    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
router.put('/:id/status', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const application = await Application.findById(req.params.id)
      .populate('job', 'title')
      .populate('applicant', 'name');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check ownership
    if (application.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    application.status = status;
    application.updatedAt = Date.now();
    await application.save();
    
    // Create notification for applicant
    await Notification.create({
      user: application.applicant._id,
      type: 'application',
      title: 'Application Status Updated',
      message: `Your application for ${application.job.title} is now ${status}`,
      link: `/applications/${application._id}`,
    });
    
    res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;