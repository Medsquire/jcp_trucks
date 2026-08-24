import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  checkInImages: {
    dash: String,
    person: String,
  },
  checkOutImages: {
    dash: String,
    person: String,
  },
  status: { type: String },
  dateString: { type: String }, // To easily query by day
}, { timestamps: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
