const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true },
  password:       { type: String, required: true },
  role:           { type: String, enum: ['Student', 'Scientist'], default: 'Student' },
  savedDatasets:  [{ type: Number }],
  favDisasters:   [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);