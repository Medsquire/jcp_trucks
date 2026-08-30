import connectToDatabase from './_utils/db.js';
import Maintenance from './_models/Maintenance.js';
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
      
      let matchedSitename = '';
      if (data.location && data.location.lat && data.location.lng) {
        const sites = await Site.find().lean();
        for (const site of sites) {
          const dist = getDistanceFromLatLonInKm(data.location.lat, data.location.lng, site.latitude, site.longitude);
          if (dist <= 1) {
            matchedSitename = site.sitename;
            break;
          }
        }
      }
      
      const payload = { ...data };
      if (matchedSitename) payload.sitename = matchedSitename;
      
      const record = new Maintenance(payload);
      await record.save();
      return res.status(200).json(record);
    } 
    else if (req.method === 'GET') {
      const filter = {};
      if (req.query.phone) filter.phone = req.query.phone;
      
      if (req.query.dateString) {
        const startDate = new Date(req.query.dateString);
        startDate.setUTCHours(0,0,0,0);
        const endDate = new Date(req.query.dateString);
        endDate.setUTCHours(23,59,59,999);
        filter.createdAt = { $gte: startDate, $lte: endDate };
      }
      
      if (req.query.supervisorPhone) {
        const drivers = await User.find({ supervisorPhone: req.query.supervisorPhone }).lean();
        filter.phone = { $in: drivers.map(d => d.phone) };
      }
      
      const records = await Maintenance.find(filter).sort({ createdAt: -1 }).lean();
      
      const allUsers = await User.find({}, 'phone name').lean();
      const userMap = {};
      allUsers.forEach(u => userMap[u.phone] = u.name);
      
      const populated = records.map(r => ({
        ...r,
        driverName: userMap[r.phone] || 'Unknown Driver'
      }));
      
      return res.status(200).json(populated);
    }
    else if (req.method === 'PUT') {
      const { _id, status } = req.body;
      const record = await Maintenance.findByIdAndUpdate(_id, { status }, { new: true });
      return res.status(200).json(record);
    }
    
    return res.status(405).end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
