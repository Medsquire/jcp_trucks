import connectToDatabase from './_utils/db.js';
import Site from './_models/Site.js';

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    
    if (req.method === 'GET') {
      const records = await Site.find().sort({ sitename: 1 });
      return res.status(200).json(records);
    }
    
    return res.status(405).end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
