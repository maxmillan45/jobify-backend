// backend/routes/users.js
const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, location, title, bio, skills } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (title) user.title = title;
    if (bio) user.bio = bio;
    if (skills) user.skills = skills;
    
    await user.save();
    
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/users/save-job
// @desc    Save a job
router.post('/save-job', protect, authorize('jobseeker'), async (req, res) => {
  try {
    const { jobId } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user.savedJobs.includes(jobId)) {
      user.savedJobs.push(jobId);
      await user.save();
    }
    
    res.json({
      success: true,
      savedJobs: user.savedJobs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/users/save-job/:jobId
// @desc    Remove saved job
router.delete('/save-job/:jobId', protect, authorize('jobseeker'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.savedJobs = user.savedJobs.filter(
      (jobId) => jobId.toString() !== req.params.jobId
    );
    await user.save();
    
    res.json({
      success: true,
      savedJobs: user.savedJobs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/saved-jobs
// @desc    Get saved jobs
router.get('/saved-jobs', protect, authorize('jobseeker'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedJobs');
    
    res.json({
      success: true,
      savedJobs: user.savedJobs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;