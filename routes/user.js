// backend/routes/users.js
const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, location, title, bio, skills } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (title) user.title = title;
    if (bio) user.bio = bio;
    if (skills) user.skills = skills;
    
    await user.save();
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        title: user.title,
        bio: user.bio,
        skills: user.skills,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   POST /api/users/save-job
// @desc    Save a job
// @access  Private (Job Seekers only)
router.post('/save-job', protect, authorize('job_seeker'), async (req, res) => { // Fixed: 'job_seeker' instead of 'jobseeker'
  try {
    const { jobId } = req.body;
    
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Initialize savedJobs array if it doesn't exist
    if (!user.savedJobs) {
      user.savedJobs = [];
    }
    
    // Check if job already saved
    if (!user.savedJobs.includes(jobId)) {
      user.savedJobs.push(jobId);
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Job saved successfully',
      savedJobs: user.savedJobs
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/users/save-job/:jobId
// @desc    Remove saved job
// @access  Private (Job Seekers only)
router.delete('/save-job/:jobId', protect, authorize('job_seeker'), async (req, res) => { // Fixed: 'job_seeker'
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Filter out the job ID
    user.savedJobs = user.savedJobs.filter(
      (savedJobId) => savedJobId.toString() !== req.params.jobId
    );
    await user.save();
    
    res.json({
      success: true,
      message: 'Job removed from saved',
      savedJobs: user.savedJobs
    });
  } catch (error) {
    console.error('Remove saved job error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   GET /api/users/saved-jobs
// @desc    Get saved jobs
// @access  Private (Job Seekers only)
router.get('/saved-jobs', protect, authorize('job_seeker'), async (req, res) => { // Fixed: 'job_seeker'
  try {
    const user = await User.findById(req.user.id).populate('savedJobs');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      savedJobs: user.savedJobs || []
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        title: user.title,
        bio: user.bio,
        skills: user.skills,
        profilePicture: user.profilePicture,
        googleId: user.googleId,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;