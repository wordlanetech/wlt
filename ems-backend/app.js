const express = require('express');
const cors = require('cors');   
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.json()); // handles JSON request bodies
app.use(express.urlencoded({ extended: true })); // handles form-urlencoded bodies

// Routes
const authRoutes = require('./routes/auth.route');
const dashboardRoutes = require('./routes/hr_dashboard.route');
const employeeRoutes = require('./routes/employees.route');
const referenceRoutes = require('./routes/reference.route');
const departmentRoutes = require('./routes/department.routes');
const attendanceRoutes = require('./routes/attendance.route');
const managerDashboardRoutes = require('./routes/managerDashboard.routes');
const managerRoute = require('./routes/manager');
const taskRoutes = require('./routes/taskRoutes');
const a_dashboard = require('./routes/a_dashboard.routes');
const teamRoutes = require('./routes/team.routes');
const leaveRoutes = require('./routes/leave.route');
const profileRoutes = require('./routes/profile');
const projectRoutes = require('./routes/projectRoutes');
const authMiddleware = require('./middleware/auth.middleware');

// Protect project routes
app.use('/api/projects', authMiddleware, projectRoutes);




// Route mounts
app.use('/api', authRoutes);
app.use('/api/hr/dashboard', dashboardRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api', referenceRoutes);
app.use('/api/full-departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api', managerDashboardRoutes);
app.use('/api/manager', managerRoute);
app.use('/api/tasks', taskRoutes);
app.use('/api/', a_dashboard);
app.use('/api/teams', teamRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api', profileRoutes);
app.use('/api/projects', projectRoutes);


// Health check route
app.get('/', (req, res) => {
    res.send('EMS Backend is running.');
});


// Global error handler for JSON parse issues
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON format in request body' });
    }
    next();
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
