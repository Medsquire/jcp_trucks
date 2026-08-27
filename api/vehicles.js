import connectToDatabase from './_utils/db.js';
import Vehicle from './_models/Vehicle.js';

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    
    if (req.method === 'POST') {
      const data = req.body;
      const vehicle = new Vehicle(data);
      await vehicle.save();
      return res.status(200).json(vehicle);
    } 
    else if (req.method === 'GET') {
      const records = await Vehicle.find().sort({ createdAt: -1 });
      return res.status(200).json(records);
    }
    
    return res.status(405).end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
