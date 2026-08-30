import connectToDatabase from './_utils/db.js';
import User from './_models/User.js';
import Attendance from './_models/Attendance.js';
import Fuel from './_models/Fuel.js';
import Maintenance from './_models/Maintenance.js';
import Vehicle from './_models/Vehicle.js';

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    
    if (req.method === 'GET') {
      let userFilter = {};
      let phoneFilter = {};

      if (req.query.supervisorPhone) {
        userFilter.supervisorPhone = req.query.supervisorPhone;
        const drivers = await User.find({ supervisorPhone: req.query.supervisorPhone }).lean();
        phoneFilter.phone = { $in: drivers.map(d => d.phone) };
      }

      // Execute all counts in parallel ON THE SERVER (1 Lambda, 1 DB connection)
      const [usersCount, attendanceCount, fuelCount, maintenanceCount, vehiclesCount] = await Promise.all([
        User.countDocuments(userFilter),
        Attendance.countDocuments(phoneFilter),
        Fuel.countDocuments(phoneFilter),
        Maintenance.countDocuments(phoneFilter),
        Vehicle.countDocuments() // Vehicles aren't currently bound to supervisors in the model
      ]);

      return res.status(200).json({
        users: usersCount,
        attendance: attendanceCount,
        fuel: fuelCount,
        maintenance: maintenanceCount,
        vehicles: vehiclesCount
      });
    }
    
    return res.status(405).end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
