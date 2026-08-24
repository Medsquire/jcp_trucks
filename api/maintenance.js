import connectToDatabase from './utils/db.js';
import Maintenance from './models/Maintenance.js';
import User from './models/User.js';

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    
    if (req.method === 'POST') {
      const data = req.body;
      const record = new Maintenance(data);
      await record.save();
      return res.status(200).json(record);
    } 
    else if (req.method === 'GET') {
      const filter = {};
      if (req.query.phone) filter.phone = req.query.phone;
      
      if (req.query.supervisorPhone) {
        const drivers = await User.find({ supervisorPhone: req.query.supervisorPhone });
        filter.phone = { $in: drivers.map(d => d.phone) };
      }
      
      const records = await Maintenance.find(filter).sort({ createdAt: -1 });
      return res.status(200).json(records);
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
