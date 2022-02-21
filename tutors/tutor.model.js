const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact_no: { type: String },
    category: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String },
    account_status: { type: String },
    credit: { type: Number },
    application_status: { type: String },
    address: { type: String },
    experience: { type: String, required: true },
    documents: { type: String },
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

module.exports = mongoose.model('Tutor', schema);