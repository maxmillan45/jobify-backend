// backend/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
  },
  companyLogo: {
    type: String,
    default: null,
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'],
    default: 'Full-time',
  },
  salary: {
    min: Number,
    max: Number,
    display: String,
  },
  description: {
    type: String,
    required: [true, 'Please add a job description'],
  },
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  experience: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive'],
  },
  education: String,
  skills: [String],
  openings: {
    type: Number,
    default: 1,
  },
  deadline: Date,
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active',
  },
  postedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Job', jobSchema);