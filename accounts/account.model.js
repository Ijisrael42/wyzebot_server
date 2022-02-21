const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String },
    title: { type: String },
    name: { type: String },
    tutor_id: { type: String },
    supplier: { type: String },
    status: { type: String },
    firstName: { type: String },
    address: { type: String },
    contact_no: { type: String },
    profile_picture: { type: String },
    device_token: { type: String },
    superUser: Boolean,
    acceptTerms: Boolean,
    isGoogleAcc: Boolean,
    isAppleAcc: Boolean,
    platform: { type: String },
    role: { type: String  },//required: true
    verificationToken: String,
    verified: Date,
    resetToken: {
        token: String,
        expires: Date
    },
    passwordReset: Date,
    created: { type: Date, default: Date.now },
    updated: Date
});

schema.virtual('isVerified').get(function () {
    return !!(this.verified || this.passwordReset);
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.passwordHash;
    }
});

module.exports = mongoose.model('Account', schema);