﻿const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const sendEmail = require('_helpers/send-email');
const db = require('_helpers/db');
const Role = require('_helpers/role');
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(config.google_client_Id)
// import appleSignin from 'apple-signin-auth';
const appleSignin = require('apple-signin-auth');

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    googleSignUp,
    googleLogin,
    appleSignUp,
    appleLogin,
    registerTutor,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getByParams,
    getTutorDeviceTokens,
    getById,
    getWithTutorId,
    create,
    update,
    delete: _delete,
    deletemany,
    getJWT
};

async function authenticate({ email, password, ipAddress }) {
    const account = await db.Account.findOne({ email });

    if (!account ) throw 'User account does not exist';

    if ( account.isGoogleAcc ) throw 'Please login with Google Sign In';
    else if ( account.isAppleAcc ) throw 'Please login with Apple Sign In';
    else if ( !account.isVerified ) throw 'Please Verify your account';
    else if( !bcrypt.compareSync(password, account.passwordHash) )  throw 'Email or password is incorrect';

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function googleLogin(params, ipAddress) {

    const { token }  = params;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    const { email } = ticket.getPayload();    
    return login(email, ipAddress);
}

async function appleLogin(params, ipAddress) {

    try {
        // const { email } = await appleSignin.verifyIdToken(params.token, { 
        const { email } = await appleSignin.verifyIdToken(params.token);
        return login(email, ipAddress);
    } catch (err) { return err; }
}

async function login(email, ipAddress) {
    const account = await db.Account.findOne({ email });
    if (!account ) throw 'User account does not exist';

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const { account } = refreshToken;

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(account);

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function getJWT({ email, ipAddress }) {

    const account = await db.Account.findOne({ email });

    if (!account ) {
        throw 'Email or password is incorrect';
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function register(params, origin) {
    // validate
    if (await db.Account.findOne({ email: params.email })) {
        // send already registered error in email to prevent account enumeration
        // await sendAlreadyRegisteredEmail(email, origin);
        throw 'User account already exist';
    }

    // create account object
    const account = new db.Account(params);

    // first registered account is an admin
    const isFirstAccount = (await db.Account.countDocuments({})) === 0;

    account.role = isFirstAccount ? Role.Admin : Role.User;

    account.verificationToken = randomTokenString();

    // hash password
    account.passwordHash = hash(params.password);

    // save account
    await account.save();
    // send email
    await sendVerificationEmail(account, origin);
}

async function googleSignUp(params, origin, ipAddress) {

    const { token }  = params;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    const { name, email, picture } = ticket.getPayload();    
    
    // validate
    if (await db.Account.findOne({ email: email })) {
        // send already registered error in email to prevent account enumeration
        await sendAlreadyRegisteredEmail(email, origin);
        throw 'User account already exist';
    }

    // create account object
    const account = new db.Account({ name: name, email: email });

    // first registered account is an admin
    const isFirstAccount = (await db.Account.countDocuments({})) === 0;

    account.role = isFirstAccount ? Role.Admin : Role.User;

    account.verified = Date.now();
    account.verificationToken = undefined;
    account.acceptTerms = true;
    account.isGoogleAcc = true;

    // save account
    await account.save();

    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };

}
async function appleSignUp(params, origin, ipAddress) {

    try {
        const { email } = await appleSignin.verifyIdToken(params.token);
        // validate
        if (await db.Account.findOne({ email: email })) {
            // send already registered error in email to prevent account enumeration
            await sendAlreadyRegisteredEmail(email, origin);
            throw 'User account already exist';
        }

        // create account object
        const account = new db.Account({ email: email });

        // first registered account is an admin
        const isFirstAccount = (await db.Account.countDocuments({})) === 0;

        account.role = isFirstAccount ? Role.Admin : Role.User;

        account.verified = Date.now();
        account.verificationToken = undefined;
        account.acceptTerms = true;
        account.isAppleAcc = true;

        // save account
        await account.save();

        const jwtToken = generateJwtToken(account);
        const refreshToken = generateRefreshToken(account, ipAddress);

        // save refresh token
        await refreshToken.save();

        // return basic details and tokens
        return {
            ...basicDetails(account),
            jwtToken,
            refreshToken: refreshToken.token
        };
    } catch (err) { throw "Unauthorized"; }
}

async function signUp(params, origin, ipAddress) {

    if (await db.Account.findOne({ email: params.email })) {
        // send already registered error in email to prevent account enumeration
        await sendAlreadyRegisteredEmail(email, origin);
        throw 'User account already exist';
    }

    // create account object
    const account = new db.Account({ name: params.name, email: email });

    // first registered account is an admin
    const isFirstAccount = (await db.Account.countDocuments({})) === 0;

    account.role = isFirstAccount ? Role.Admin : Role.User;

    account.verified = Date.now();
    account.verificationToken = undefined;
    account.acceptTerms = true;
    account.isGoogleAcc = true;

    // save account
    await account.save();

    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function registerTutor(params, origin, ipAddress) {
    // validate
    if (await db.Account.findOne({ email: params.email })) {
        // send already registered error in email to prevent account enumeration
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }

    // create account object
    const account = new db.Account(params);

    account.verified = Date.now();
    account.verificationToken = undefined;

    // hash password
    account.passwordHash = hash(params.password);

    // save account
    await account.save();

    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
    
/*     // send email
    await sendVerificationEmail(account, origin);
 */
}

async function verifyEmail({ token }) {
    const account = await db.Account.findOne({ verificationToken: token });

    if (!account) throw 'Verification failed';

    account.verified = Date.now();
    account.verificationToken = undefined;
    await account.save();
} 

async function forgotPassword({ email }, origin) {
    const account = await db.Account.findOne({ email });

    if ( account.isGoogleAcc ) throw 'Please login with Google Sign In';
    else if ( account.isAppleAcc ) throw 'Please login with Apple Sign In';
    else if ( !account.isVerified ) throw 'Please Verify your account';

    // always return ok response to prevent email enumeration
    if (!account) return;

    // create reset token that expires after 24 hours
    account.resetToken = {
        token: randomTokenString(),
        expires: new Date(Date.now() + 24*60*60*1000)
    };
    await account.save();

    // send email
    await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
    const account = await db.Account.findOne({
        'resetToken.token': token,
        'resetToken.expires': { $gt: Date.now() }
    });

    if (!account) throw 'Invalid token';
}

async function resetPassword({ token, password }) {
    const account = await db.Account.findOne({
        'resetToken.token': token,
        'resetToken.expires': { $gt: Date.now() }
    });

    if (!account) throw 'Invalid token';

    // update password and remove reset token
    account.passwordHash = hash(password);
    account.passwordReset = Date.now();
    account.resetToken = undefined;
    await account.save();
}

async function getAll() {
    const accounts = await db.Account.find();
    return accounts.map(x => basicDetails(x));
}

async function getByParams(params) {
    const accounts = await db.Account.find(params);
    return accounts.map(x => basicDetails(x));
}

async function getTutorDeviceTokens() {
    const accounts = await db.Account.find( {  device_token: { $exists: true } } ); // role: "Tutor",
    // const tokens = accounts.map( account => { account.device_token } );
    const tokens = [];

    accounts.forEach(element => {
        tokens.push(element.device_token);
    });
    
    return tokens;
    /* 
    // const accounts = await db.Account.find( {  device_token: { $exists: true } } ); // role: "Tutor", 
    let account = {};
    let tokens = [];
    const tutors = db.Application.find();

    tutors.forEach( (tutor, index) => {
        if( tutor.category.indexOf( category ) != -1 ) {
            account = db.Account.findOne({ tutor_id: tutor.id })
            if( account.device_token ) tokens.push(account.device_token);
        }
    });

    return tokens;

    */
}

async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}

async function getWithTutorId(id) {
    const account = await getAccount(id);
    return account;
}

async function create(params) {
    // validate
    if (await db.Account.findOne({ email: params.email })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const account = new db.Account(params);
    account.verified = Date.now();

    // hash password
    account.passwordHash = hash(params.password);

    // save account
    await account.save();

    return basicDetails(account);
}

async function update(id, params, ipAddress) {
    const account = await getAccount(id);

    // validate (if email was changed)
    if (params.email && account.email !== params.email && await db.Account.findOne({ email: params.email })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = hash(params.password);
    }

    // copy params to account and save
    Object.assign(account, params);
    account.updated = Date.now();
    await account.save();

    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function _delete(id) {
    const account = await getAccount(id);
    await account.remove();
}

async function deletemany(params) {
    await db.Account.deleteMany({ _id: { $in: params } });
}

// helper functions

async function getAccount(id) {
    if (!db.isValidId(id)) throw 'Account not found';
    const account = await db.Account.findById(id);
    if (!account) throw 'Account not found';
    return account;
}

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ token }).populate('account');
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

function hash(password) {
    return bcrypt.hashSync(password, 10);
}

function generateJwtToken(account) {
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ sub: account.id, id: account.id }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken(account, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        account: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
    const { id, title, name, email, role, created, address, contact_no, profile_picture, updated, isVerified, 
        tutor_id, supplier, device_token, status, superUser } = account;
    return { id, title, name, email, role, created, address, contact_no, profile_picture, updated, isVerified,
         tutor_id,  supplier, device_token, status, superUser };
}

async function sendVerificationEmail(account, origin) {

    let message;
    if (origin) {
        let origin = "https://cliqclin.web.app";
        const verifyUrl = `${origin}/login/${account.verificationToken}`;

        message = `<p>Your email is now verified. 
        <a href="${verifyUrl}">Click Here</a></p> to complete your registration.</p>`;
        // message = `<p>Please click the below link to verify your email address:</p>
        //            <p><a href="${verifyUrl}">Click Here</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                   <p><code>${account.verificationToken}</code></p>`;
    }

    await sendEmail({ to: account.email, subject: 'Sign-up Verification',
        html: `<h4>Verify Email</h4><p>Thanks for registering!</p>${message}`
    }); 
}

async function sendAlreadyRegisteredEmail(email, origin) {
    let message;
    if (origin) {
        origin = "https://cliqclin.web.app";

        message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
    } else {
        message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
    }

    await sendEmail({
        to: email,
        subject: 'Sign-up Verification API - Email Already Registered',
        html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`
    });
}

async function sendPasswordResetEmail(account, origin) {
    let message;
    if (origin) {
        origin = "https://cliqclin.web.app";
        const resetUrl = `${origin}/reset-password/${account.resetToken.token}`;
        
        message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">Click Here</a></p>`;
    } else {
        message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                   <p><code>${account.resetToken.token}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Reset Password',
        html: `<h4>Reset Password Email</h4>
               ${message}`
    });
}