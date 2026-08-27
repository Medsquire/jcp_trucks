import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  vehicleName: { type: String, required: true },
  vehicleNumber: { type: String, required: true, unique: true },
  sitename: { type: String },
  siteid: { type: String },
}, { timestamps: true });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
