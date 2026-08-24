import connectToDatabase from './utils/db.js';
import Attendance from './models/Attendance.js';
import User from './models/User.js';

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    
    if (req.method === 'POST') {
      const data = req.body;
      const { phone, checkInTime, checkOutTime, checkInImages, checkOutImages, status } = data;
      
      const dateString = new Date().toISOString().split('T')[0];
      
      // Find today's attendance for user, or create one
      let attendance = await Attendance.findOne({ phone, dateString });
      
      if (!attendance) {
        attendance = new Attendance({ phone, dateString });
      }
      
      if (checkInTime) attendance.checkInTime = checkInTime;
      if (checkOutTime) attendance.checkOutTime = checkOutTime;
      if (checkInImages) attendance.checkInImages = checkInImages;
      if (checkOutImages) attendance.checkOutImages = checkOutImages;
      if (status) attendance.status = status;
      
      await attendance.save();
      return res.status(200).json(attendance);
    } 
    else if (req.method === 'GET') {
      const filter = {};
      if (req.query.phone) filter.phone = req.query.phone;
      if (req.query.dateString) filter.dateString = req.query.dateString;
      
      // If supervisor asks, we need to filter by their drivers
      if (req.query.supervisorPhone) {
        const drivers = await User.find({ supervisorPhone: req.query.supervisorPhone });
        const phones = drivers.map(d => d.phone);
        filter.phone = { $in: phones };
      }
      
      const records = await Attendance.find(filter).sort({ createdAt: -1 });
      return res.status(200).json(records);
    }
    
    return res.status(405).end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
