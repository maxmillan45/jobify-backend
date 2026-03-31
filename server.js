// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Load env vars
dotenv.config();

const app = express();

// Session middleware (required for passport)
app.use(session({
  secret: process.env.JWT_SECRET || 'secret123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ==================== DATA STORAGE ====================
let users = [];
let jobs = [];
let applications = [];
let companies = [];
let messages = [];
let notifications = [];

// Initialize sample data
const initSampleData = () => {
  // Sample Companies
  companies = [
    {
      id: 1,
      name: "Tech Corp",
      logo: null,
      industry: "Technology",
      location: "San Francisco, CA",
      size: "500-1000 employees",
      founded: 2015,
      description: "Leading technology company specializing in software development and cloud solutions.",
      website: "https://techcorp.com",
      jobs: [1, 4]
    },
    {
      id: 2,
      name: "Innovate Labs",
      logo: null,
      industry: "Software Development",
      location: "New York, NY",
      size: "200-500 employees",
      founded: 2018,
      description: "Innovative software solutions for modern businesses and startups.",
      website: "https://innovatelabs.com",
      jobs: [2]
    },
    {
      id: 3,
      name: "Creative Studio",
      logo: null,
      industry: "Design",
      location: "Los Angeles, CA",
      size: "50-100 employees",
      founded: 2020,
      description: "Creative design agency focused on user experience and digital products.",
      website: "https://creativestudio.com",
      jobs: [3]
    },
    {
      id: 4,
      name: "Cloud Systems",
      logo: null,
      industry: "Cloud Computing",
      location: "Austin, TX",
      size: "1000-5000 employees",
      founded: 2012,
      description: "Enterprise cloud solutions and infrastructure management.",
      website: "https://cloudsystems.com",
      jobs: []
    },
    {
      id: 5,
      name: "AI Innovations",
      logo: null,
      industry: "Artificial Intelligence",
      location: "San Francisco, CA",
      size: "100-200 employees",
      founded: 2019,
      description: "Cutting-edge AI solutions for businesses worldwide.",
      website: "https://aiinnovations.com",
      jobs: []
    }
  ];

  // Sample Jobs
  jobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "Tech Corp",
      companyId: 1,
      location: "Remote",
      type: "Full-time",
      salaryMin: 80000,
      salaryMax: 100000,
      salary: "$80,000 - $100,000",
      description: "We are looking for a skilled Frontend Developer with React experience to join our team. You will be responsible for building user interfaces and implementing new features.",
      requirements: [
        "3+ years of experience with React",
        "Strong JavaScript/ES6 knowledge",
        "Experience with Tailwind CSS",
        "Understanding of REST APIs",
        "Good communication skills"
      ],
      responsibilities: [
        "Develop new user-facing features",
        "Build reusable components",
        "Optimize applications for performance",
        "Collaborate with backend team"
      ],
      benefits: ["Health Insurance", "401k", "Remote Work", "Flexible Hours"],
      experience: "Mid Level",
      skills: ["React", "JavaScript", "Tailwind CSS", "Redux"],
      openings: 2,
      postedAt: new Date().toISOString(),
      employerId: 2,
      status: "active"
    },
    {
      id: 2,
      title: "Backend Developer",
      company: "Innovate Labs",
      companyId: 2,
      location: "New York, NY",
      type: "Full-time",
      salaryMin: 90000,
      salaryMax: 120000,
      salary: "$90,000 - $120,000",
      description: "Join our backend team to build scalable APIs and microservices.",
      requirements: [
        "Node.js experience",
        "Express framework knowledge",
        "MongoDB or PostgreSQL",
        "API design principles"
      ],
      responsibilities: [
        "Design and implement APIs",
        "Optimize database queries",
        "Write unit tests",
        "Document technical specifications"
      ],
      benefits: ["Health Insurance", "401k", "Stock Options"],
      experience: "Senior Level",
      skills: ["Node.js", "Express", "MongoDB", "PostgreSQL"],
      openings: 1,
      postedAt: new Date().toISOString(),
      employerId: 2,
      status: "active"
    },
    {
      id: 3,
      title: "UI/UX Designer",
      company: "Creative Studio",
      companyId: 3,
      location: "Remote",
      type: "Contract",
      salaryMin: 60000,
      salaryMax: 80000,
      salary: "$60,000 - $80,000",
      description: "Looking for a creative designer to create beautiful user experiences.",
      requirements: [
        "Figma expertise",
        "User research experience",
        "Prototyping skills",
        "Portfolio of work"
      ],
      responsibilities: [
        "Create wireframes and prototypes",
        "Conduct user research",
        "Collaborate with developers",
        "Maintain design systems"
      ],
      benefits: ["Flexible Hours", "Remote Work", "Project Bonus"],
      experience: "Mid Level",
      skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
      openings: 1,
      postedAt: new Date().toISOString(),
      employerId: 3,
      status: "active"
    },
    {
      id: 4,
      title: "DevOps Engineer",
      company: "Tech Corp",
      companyId: 1,
      location: "Austin, TX",
      type: "Full-time",
      salaryMin: 100000,
      salaryMax: 140000,
      salary: "$100,000 - $140,000",
      description: "Join our infrastructure team to manage cloud systems and CI/CD pipelines.",
      requirements: [
        "AWS/Azure experience",
        "Docker and Kubernetes",
        "CI/CD pipelines",
        "Infrastructure as Code"
      ],
      responsibilities: [
        "Manage cloud infrastructure",
        "Implement CI/CD pipelines",
        "Monitor system performance",
        "Ensure security compliance"
      ],
      benefits: ["Health Insurance", "401k", "Remote Work", "Learning Stipend"],
      experience: "Senior Level",
      skills: ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform"],
      openings: 1,
      postedAt: new Date().toISOString(),
      employerId: 2,
      status: "active"
    }
  ];

  // Sample Applications
  applications = [
    {
      id: 1,
      jobId: 1,
      jobTitle: "Frontend Developer",
      company: "Tech Corp",
      applicantId: 1,
      applicantName: "John Doe",
      applicantEmail: "john@example.com",
      status: "pending",
      coverLetter: "I am very interested in this position...",
      appliedAt: new Date().toISOString()
    }
  ];

  // Sample Messages
  messages = [
    {
      id: 1,
      senderId: 1,
      receiverId: 2,
      text: "Hi! I'm interested in the Frontend Developer position.",
      read: false,
      createdAt: new Date().toISOString()
    }
  ];

  // Sample Notifications
  notifications = [
    {
      id: 1,
      userId: 1,
      type: "application",
      title: "Application Submitted",
      message: "Your application for Frontend Developer has been submitted",
      read: false,
      link: "/applications/1",
      createdAt: new Date().toISOString()
    }
  ];
};

// Initialize data
initSampleData();

// ==================== HELPER FUNCTIONS ====================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '7d',
  });
};

// ==================== PASSPORT GOOGLE STRATEGY ====================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = users.find(u => u.email === profile.emails[0].value);
        
        if (user) {
          // Update Google ID if not already set
          if (!user.googleId) {
            user.googleId = profile.id;
            user.avatar = profile.photos[0]?.value || user.avatar;
          }
          return done(null, user);
        }
        
        // Create new user
        const newUser = {
          id: users.length + 1,
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0]?.value,
          role: 'jobseeker',
          isVerified: true,
          createdAt: new Date()
        };
        
        users.push(newUser);
        
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const userExists = users.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      role: role || 'jobseeker',
      isVerified: false,
      createdAt: new Date()
    };
    
    users.push(user);
    
    // Generate token
    const token = generateToken(user.id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Google OAuth routes
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user.id);
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/google/callback?token=${token}`);
    } catch (error) {
      console.error('Google auth error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`);
    }
  }
);

// Verify Google token
app.post('/api/auth/google/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// ==================== JOB ROUTES ====================

// Get all jobs
app.get('/api/jobs', (req, res) => {
  const { search, type, location, page = 1, limit = 10 } = req.query;
  let filteredJobs = [...jobs];
  
  if (search) {
    filteredJobs = filteredJobs.filter(job => 
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (type && type !== 'All') {
    filteredJobs = filteredJobs.filter(job => job.type === type);
  }
  
  if (location) {
    filteredJobs = filteredJobs.filter(job => 
      job.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  // Pagination
  const start = (page - 1) * limit;
  const paginatedJobs = filteredJobs.slice(start, start + limit);
  
  res.json({
    success: true,
    jobs: paginatedJobs,
    total: filteredJobs.length,
    totalPages: Math.ceil(filteredJobs.length / limit),
    currentPage: parseInt(page)
  });
});

// Get single job
app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.find(j => j.id === parseInt(req.params.id));
  
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  
  res.json({
    success: true,
    job
  });
});

// Create job
app.post('/api/jobs', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = users.find(u => u.id === decoded.id);
    
    if (!user || user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can post jobs' });
    }
    
    const { title, company, location, type, salaryMin, salaryMax, description, requirements, responsibilities, benefits, experience, skills, openings } = req.body;
    
    const newJob = {
      id: jobs.length + 1,
      title,
      company,
      location,
      type,
      salaryMin: salaryMin || 0,
      salaryMax: salaryMax || 0,
      salary: `$${salaryMin || 0} - $${salaryMax || 0}`,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      benefits: benefits || [],
      experience: experience || 'Entry Level',
      skills: skills || [],
      openings: openings || 1,
      postedAt: new Date().toISOString(),
      employerId: user.id,
      status: 'active'
    };
    
    jobs.push(newJob);
    
    // Update company jobs count
    const companyObj = companies.find(c => c.name === company);
    if (companyObj) {
      companyObj.jobs.push(newJob.id);
    }
    
    res.status(201).json({
      success: true,
      job: newJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update job
app.put('/api/jobs/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const jobIndex = jobs.findIndex(j => j.id === parseInt(req.params.id));
    
    if (jobIndex === -1) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    const job = jobs[jobIndex];
    
    if (job.employerId !== decoded.id) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }
    
    jobs[jobIndex] = { ...job, ...req.body, updatedAt: new Date().toISOString() };
    
    res.json({
      success: true,
      job: jobs[jobIndex]
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete job
app.delete('/api/jobs/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const jobIndex = jobs.findIndex(j => j.id === parseInt(req.params.id));
    
    if (jobIndex === -1) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    const job = jobs[jobIndex];
    
    if (job.employerId !== decoded.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }
    
    jobs.splice(jobIndex, 1);
    
    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get employer jobs
app.get('/api/jobs/employer/my-jobs', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const employerJobs = jobs.filter(j => j.employerId === decoded.id);
    
    res.json({
      success: true,
      jobs: employerJobs
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== COMPANY ROUTES ====================

// Get all companies
app.get('/api/companies', (req, res) => {
  const { search } = req.query;
  let filteredCompanies = [...companies];
  
  if (search) {
    filteredCompanies = filteredCompanies.filter(company => 
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.industry.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    companies: filteredCompanies,
    total: filteredCompanies.length
  });
});

// Get single company
app.get('/api/companies/:id', (req, res) => {
  const company = companies.find(c => c.id === parseInt(req.params.id));
  
  if (!company) {
    return res.status(404).json({ message: 'Company not found' });
  }
  
  // Get company jobs
  const companyJobs = jobs.filter(job => job.company === company.name);
  
  res.json({
    success: true,
    company: {
      ...company,
      jobs: companyJobs
    }
  });
});

// ==================== APPLICATION ROUTES ====================

// Apply for job
app.post('/api/applications', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    const { jobId, coverLetter } = req.body;
    const job = jobs.find(j => j.id === parseInt(jobId));
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if already applied
    const existingApplication = applications.find(
      app => app.jobId === parseInt(jobId) && app.applicantId === user.id
    );
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    const application = {
      id: applications.length + 1,
      jobId: parseInt(jobId),
      jobTitle: job.title,
      company: job.company,
      applicantId: user.id,
      applicantName: user.name,
      applicantEmail: user.email,
      status: 'pending',
      coverLetter: coverLetter || '',
      appliedAt: new Date().toISOString()
    };
    
    applications.push(application);
    
    // Create notification for employer
    notifications.push({
      id: notifications.length + 1,
      userId: job.employerId,
      type: 'application',
      title: 'New Application',
      message: `${user.name} applied for ${job.title}`,
      read: false,
      link: `/applications/${application.id}`,
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's applications
app.get('/api/applications/my-applications', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const userApplications = applications.filter(app => app.applicantId === decoded.id);
    
    res.json({
      success: true,
      applications: userApplications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get employer applications
app.get('/api/applications/employer-applications', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = users.find(u => u.id === decoded.id);
    
    if (user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can view this' });
    }
    
    const employerJobs = jobs.filter(j => j.employerId === user.id);
    const employerApplications = applications.filter(app => 
      employerJobs.some(job => job.id === app.jobId)
    );
    
    res.json({
      success: true,
      applications: employerApplications
    });
  } catch (error) {
    console.error('Get employer applications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update application status
app.put('/api/applications/:id/status', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const { status } = req.body;
    const application = applications.find(app => app.id === parseInt(req.params.id));
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const job = jobs.find(j => j.id === application.jobId);
    
    if (job.employerId !== decoded.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    application.status = status;
    application.updatedAt = new Date().toISOString();
    
    // Create notification for applicant
    notifications.push({
      id: notifications.length + 1,
      userId: application.applicantId,
      type: 'application',
      title: 'Application Status Updated',
      message: `Your application for ${application.jobTitle} is now ${status}`,
      read: false,
      link: `/applications/${application.id}`,
      createdAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== USER ROUTES ====================

// Update user profile
app.put('/api/users/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const userIndex = users.findIndex(u => u.id === decoded.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { name, phone, location, title, bio, skills } = req.body;
    
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      phone: phone || users[userIndex].phone,
      location: location || users[userIndex].location,
      title: title || users[userIndex].title,
      bio: bio || users[userIndex].bio,
      skills: skills || users[userIndex].skills
    };
    
    res.json({
      success: true,
      user: users[userIndex]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save job
app.post('/api/users/save-job', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const userIndex = users.findIndex(u => u.id === decoded.id);
    const { jobId } = req.body;
    
    if (!users[userIndex].savedJobs) {
      users[userIndex].savedJobs = [];
    }
    
    if (!users[userIndex].savedJobs.includes(jobId)) {
      users[userIndex].savedJobs.push(jobId);
    }
    
    res.json({
      success: true,
      savedJobs: users[userIndex].savedJobs
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get saved jobs
app.get('/api/users/saved-jobs', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = users.find(u => u.id === decoded.id);
    const savedJobs = jobs.filter(job => user.savedJobs?.includes(job.id));
    
    res.json({
      success: true,
      savedJobs
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== MESSAGE ROUTES ====================

// Get conversations
app.get('/api/messages', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const userMessages = messages.filter(m => m.senderId === decoded.id || m.receiverId === decoded.id);
    
    // Group by conversation
    const conversations = {};
    userMessages.forEach(msg => {
      const otherId = msg.senderId === decoded.id ? msg.receiverId : msg.senderId;
      const otherUser = users.find(u => u.id === otherId);
      
      if (!conversations[otherId]) {
        conversations[otherId] = {
          user: otherUser,
          lastMessage: msg,
          unread: msg.receiverId === decoded.id && !msg.read ? 1 : 0
        };
      } else if (msg.receiverId === decoded.id && !msg.read) {
        conversations[otherId].unread++;
      }
    });
    
    res.json({
      success: true,
      conversations: Object.values(conversations)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get messages with user
app.get('/api/messages/:userId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const userMessages = messages.filter(m => 
      (m.senderId === decoded.id && m.receiverId === parseInt(req.params.userId)) ||
      (m.senderId === parseInt(req.params.userId) && m.receiverId === decoded.id)
    );
    
    // Mark messages as read
    messages.forEach(msg => {
      if (msg.senderId === parseInt(req.params.userId) && msg.receiverId === decoded.id && !msg.read) {
        msg.read = true;
      }
    });
    
    res.json({
      success: true,
      messages: userMessages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send message
app.post('/api/messages', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const { receiverId, text } = req.body;
    
    const newMessage = {
      id: messages.length + 1,
      senderId: decoded.id,
      receiverId: parseInt(receiverId),
      text,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    messages.push(newMessage);
    
    // Create notification
    notifications.push({
      id: notifications.length + 1,
      userId: receiverId,
      type: 'message',
      title: 'New Message',
      message: `You have a new message from ${users.find(u => u.id === decoded.id)?.name}`,
      read: false,
      link: '/messages',
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== NOTIFICATION ROUTES ====================

// Get notifications
app.get('/api/notifications', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const userNotifications = notifications.filter(n => n.userId === decoded.id);
    
    res.json({
      success: true,
      notifications: userNotifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const notification = notifications.find(n => n.id === parseInt(req.params.id) && n.userId === decoded.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.read = true;
    
    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark all notifications as read
app.put('/api/notifications/read-all', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    notifications.forEach(n => {
      if (n.userId === decoded.id && !n.read) {
        n.read = true;
      }
    });
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete notification
app.delete('/api/notifications/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const index = notifications.findIndex(n => n.id === parseInt(req.params.id) && n.userId === decoded.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notifications.splice(index, 1);
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== STATS ROUTES ====================

// Get dashboard stats
app.get('/api/stats', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = users.find(u => u.id === decoded.id);
    
    if (user.role === 'jobseeker') {
      const userApplications = applications.filter(a => a.applicantId === user.id);
      const userNotifications = notifications.filter(n => n.userId === user.id && !n.read);
      
      res.json({
        success: true,
        stats: {
          totalApplications: userApplications.length,
          pendingApplications: userApplications.filter(a => a.status === 'pending').length,
          interviews: userApplications.filter(a => a.status === 'interview').length,
          savedJobs: user.savedJobs?.length || 0,
          unreadNotifications: userNotifications.length
        }
      });
    } else if (user.role === 'employer') {
      const employerJobs = jobs.filter(j => j.employerId === user.id);
      const employerApplications = applications.filter(a => 
        employerJobs.some(j => j.id === a.jobId)
      );
      const unreadNotifications = notifications.filter(n => n.userId === user.id && !n.read);
      
      res.json({
        success: true,
        stats: {
          totalJobs: employerJobs.length,
          totalApplications: employerApplications.length,
          pendingApplications: employerApplications.filter(a => a.status === 'pending').length,
          activeJobs: employerJobs.filter(j => j.status === 'active').length,
          unreadNotifications: unreadNotifications.length
        }
      });
    } else {
      res.json({
        success: true,
        stats: {
          totalUsers: users.length,
          totalJobs: jobs.length,
          totalApplications: applications.length,
          totalCompanies: companies.length
        }
      });
    }
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== ERROR HANDLING ====================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: err.message 
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.url} not found` });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`🚀 Jobify API Server Running`);
  console.log(`=================================`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================\n`);
  
  console.log(`Available endpoints:`);
  console.log(`\n🔐 AUTH:`);
  console.log(`  POST   /api/auth/register           - Register new user`);
  console.log(`  POST   /api/auth/login              - Login user`);
  console.log(`  GET    /api/auth/me                 - Get current user`);
  console.log(`  GET    /api/auth/google             - Google OAuth login`);
  console.log(`  POST   /api/auth/google/verify      - Verify Google token`);
  
  console.log(`\n💼 JOBS:`);
  console.log(`  GET    /api/jobs                    - Get all jobs`);
  console.log(`  GET    /api/jobs/:id                - Get single job`);
  console.log(`  POST   /api/jobs                    - Create job`);
  console.log(`  PUT    /api/jobs/:id                - Update job`);
  console.log(`  DELETE /api/jobs/:id                - Delete job`);
  
  console.log(`\n🏢 COMPANIES:`);
  console.log(`  GET    /api/companies               - Get all companies`);
  console.log(`  GET    /api/companies/:id           - Get single company`);
  
  console.log(`\n📝 APPLICATIONS:`);
  console.log(`  POST   /api/applications            - Apply for job`);
  console.log(`  GET    /api/applications/my-applications - Get my applications`);
  console.log(`  PUT    /api/applications/:id/status - Update application status`);
  
  console.log(`\n👤 USERS:`);
  console.log(`  PUT    /api/users/profile           - Update profile`);
  console.log(`  POST   /api/users/save-job          - Save job`);
  console.log(`  GET    /api/users/saved-jobs        - Get saved jobs`);
  
  console.log(`\n💬 MESSAGES:`);
  console.log(`  GET    /api/messages                - Get conversations`);
  console.log(`  GET    /api/messages/:userId        - Get messages with user`);
  console.log(`  POST   /api/messages                - Send message`);
  
  console.log(`\n🔔 NOTIFICATIONS:`);
  console.log(`  GET    /api/notifications           - Get notifications`);
  console.log(`  PUT    /api/notifications/:id/read  - Mark as read`);
  console.log(`  DELETE /api/notifications/:id       - Delete notification`);
  
  console.log(`\n📊 STATS:`);
  console.log(`  GET    /api/stats                   - Get dashboard stats`);
  console.log(`=================================\n`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`\n❌ Port ${PORT} is already in use!`);
    console.log(`Please try:\n`);
    console.log(`  1. Close other applications using port ${PORT}`);
    console.log(`  2. Or change PORT in .env file\n`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});