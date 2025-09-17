const mongoose = require('mongoose')

const todoDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',   // ✅ reference to User
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',  // ✅ reference to Subject
    required: true
  },
  task: {
    type: String,
    required: true
  },
  scheduledIn: {
    type: String,
    enum: ['morning', 'afternoon', 'night'],
    required: true
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'done', 'inprogress', 'backlog'],
    default: 'todo'
  }
}, { timestamps: true })

module.exports = mongoose.model('Todo', todoDataSchema)

