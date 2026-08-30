import express from 'express';
import loginHandler from './_routes/auth/login.js';
import attendanceHandler from './_routes/attendance.js';
import fuelHandler from './_routes/fuel.js';
import maintenanceHandler from './_routes/maintenance.js';
import usersHandler from './_routes/users.js';
import seedHandler from './_routes/seed.js';
import vehiclesHandler from './_routes/vehicles.js';
import sitesHandler from './_routes/sites.js';
import summaryHandler from './_routes/summary.js';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Helper to convert Vercel serverless function signatures to Express
const vercelWrapper = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

// Mount routes
app.all('/api/auth/login', vercelWrapper(loginHandler));
app.all('/api/attendance', vercelWrapper(attendanceHandler));
app.all('/api/fuel', vercelWrapper(fuelHandler));
app.all('/api/maintenance', vercelWrapper(maintenanceHandler));
app.all('/api/users', vercelWrapper(usersHandler));
app.all('/api/seed', vercelWrapper(seedHandler));
app.all('/api/vehicles', vercelWrapper(vehiclesHandler));
app.all('/api/sites', vercelWrapper(sitesHandler));
app.all('/api/summary', vercelWrapper(summaryHandler));

// Export the Express app so Vercel can run it as a single serverless function
export default app;
