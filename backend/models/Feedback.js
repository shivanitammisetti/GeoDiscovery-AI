const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true },
  password:       { type: String, required: true },
  role:           { type: String, enum: ['Student', 'Scientist'], default: 'Student' },
  savedDatasets:  [{ type: Number }],
  favDisasters:   [{ type: String }]
}, { timestamps: true });

const FeedbackSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:  { type: String, required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  comment:   { type: String, required: true, trim: true },
  dataset:   { type: String, default: 'general' }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);