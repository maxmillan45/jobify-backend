// backend/routes/jobs.js
const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs with filters
router.get('/', async (req, res) => {
  try {
    const { search, type, location, page = 1, limit = 10 } = req.query;
    
    let query = { status: 'active' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (type && type !== 'All') {
      query.type = type;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    const jobs = await Job.find(query)
      .populate('employer', 'name email')
      .sort('-postedAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Job.countDocuments(query);
    
    res.json({
      success: true,
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name email');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/jobs
// @desc    Create a job
router.post('/', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      employer: req.user.id,
    };
    
    const job = await Job.create(jobData);
    
    res.status(201).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
router.put('/:id', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check ownership
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }
    
    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
router.delete('/:id', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check ownership
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }
    
    await job.deleteOne();
    
    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/jobs/employer/my-jobs
// @desc    Get jobs posted by employer
router.get('/employer/my-jobs', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id }).sort('-postedAt');
    
    res.json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;