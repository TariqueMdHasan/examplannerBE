const mongoose = require('mongoose')


const subjectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',   // ✅ reference to User
    required: true
  },
  subject: {
    type: String,
    required: true,
    unique: false // unique per user, but we'll enforce in code
  },
  theory: { type: Boolean, default: false },
  revision: { type: Boolean, default: false },
  pyq: { type: Boolean, default: false },
  testSeries: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  noOfLectures: { type: Number, default: 0 },
  noOfLecturesCompleted: { type: Number, default: 0 },
  subjectStart: { type: Date, required: true },
  subjectEnd: { type: Date, required: true }
}, { timestamps: true })

module.exports = mongoose.model('Subject', subjectSchema)