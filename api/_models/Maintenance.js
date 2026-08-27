import mongoose from 'mongoose';

const MaintenanceSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  details: { type: String },
  photos: [{ type: String }],
  location: { lat: Number, lng: Number },
  sitename: { type: String },
  status: { type: String, default: 'pending' }, // pending, resolved
}, { timestamps: true });

export default mongoose.models.Maintenance || mongoose.model('Maintenance', MaintenanceSchema);
