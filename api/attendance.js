import connectToDatabase from './_utils/db.js';
import Attendance from './_models/Attendance.js';
import User from './_models/User.js';
import Site from './_models/Site.js';

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    
    if (req.method === 'POST') {
      const data = req.body;
      const { phone, checkInTime, checkOutTime, checkInImages, checkOutImages, checkInLocation, checkOutLocation, status } = data;
      
      const dateString = new Date().toISOString().split('T')[0];
      let attendance = await Attendance.findOne({ phone, dateString });
      if (!attendance) {
        attendance = new Attendance({ phone, dateString });
      }
      
      let matchedSitename = attendance.sitename || '';

      const locationToCheck = checkInLocation || checkOutLocation;
      if (locationToCheck && locationToCheck.lat && locationToCheck.lng) {
        const sites = await Site.find().lean();
        for (const site of sites) {
          const dist = getDistanceFromLatLonInKm(locationToCheck.lat, locationToCheck.lng, site.latitude, site.longitude);
          if (dist <= 1) { // 1km radius
            matchedSitename = site.sitename;
            break;
          }
        }
      }
      
      if (checkInTime) attendance.checkInTime = checkInTime;
      if (checkOutTime) attendance.checkOutTime = checkOutTime;
      if (checkInImages) attendance.checkInImages = checkInImages;
      if (checkOutImages) attendance.checkOutImages = checkOutImages;
      if (checkInLocation) attendance.checkInLocation = checkInLocation;
      if (checkOutLocation) attendance.checkOutLocation = checkOutLocation;
      if (status) attendance.status = status;
      if (matchedSitename) attendance.sitename = matchedSitename;
      
      await attendance.save();
      return res.status(200).json(attendance);
    } 
    else if (req.method === 'GET') {
      const filter = {};
      if (req.query.phone) filter.phone = req.query.phone;
      if (req.query.dateString) filter.dateString = req.query.dateString;
      
      if (req.query.supervisorPhone) {
        const drivers = await User.find({ supervisorPhone: req.query.supervisorPhone });
        const phones = drivers.map(d => d.phone);
        filter.phone = { $in: phones };
      }
      
      const records = await Attendance.find(filter).sort({ createdAt: -1 }).lean();
      
      // Populate driver names
      const allUsers = await User.find({}, 'phone name').lean();
      const userMap = {};
      allUsers.forEach(u => userMap[u.phone] = u.name);
      
      const populated = records.map(r => ({
        ...r,
        driverName: userMap[r.phone] || 'Unknown Driver'
      }));
      
      return res.status(200).json(populated);
    }
    
    return res.status(405).end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
