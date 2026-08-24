import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import loginHandler from './api/auth/login.js';
import attendanceHandler from './api/attendance.js';
import fuelHandler from './api/fuel.js';
import maintenanceHandler from './api/maintenance.js';
import usersHandler from './api/users.js';
import seedHandler from './api/seed.js';

const app = express();
app.use(express.json());

// Express wrapper that behaves enough like Vercel's req/res for basic usage
const vercelWrapper = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ message: 'Internal Server Error' });
  }
};

app.all('/api/auth/login', vercelWrapper(loginHandler));
app.all('/api/attendance', vercelWrapper(attendanceHandler));
app.all('/api/fuel', vercelWrapper(fuelHandler));
app.all('/api/maintenance', vercelWrapper(maintenanceHandler));
app.all('/api/users', vercelWrapper(usersHandler));
app.all('/api/seed', vercelWrapper(seedHandler));

const PORT = 3001;
app.listen(PORT, () => console.log(`Local API Server running on http://localhost:${PORT}`));
