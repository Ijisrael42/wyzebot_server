const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    student_name: { type: String },
    student_email: { type: String },
    section: { type: String },
    gender: { type: String },
    subjects: { type: Array },
    dob: { type: Date },
    created: { type: Date, default: Date.now },
    updated: Date
});
  
schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
    }
});

module.exports = mongoose.model('Student', schema);