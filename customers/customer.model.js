const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: { type: String },
    phone_number: { type: String },
    location: { type: String },
    gender: { type: String },
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

module.exports = mongoose.model('Customer', schema);