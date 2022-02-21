const config = require('config.json');
const db = require('_helpers/db');
const sendEmail = require('_helpers/send-email');

module.exports = {
    getAll,
    getAllActiveSupplierId,
    getById,
    getByUserId,
    getBySupplierId,
    create,
    update,
    delete: _delete
};
        
async function getAll() {
    const utensils = await db.Utensil.find().sort({ created: -1});
    return utensils.map(x => basicDetails(x));
}

async function getAllActiveSupplierId(id) {
    const utensils = await db.Utensil.find({ supplier: id, status: "Enabled"}).sort({ created: -1});
    return utensils.map(x => basicDetails(x));
}

async function getBySupplierId(id) {
    const utensils = await db.Utensil.find({ supplier: id}).sort({ created: -1});
    return utensils.map(x => basicDetails(x));
}

async function getById(id) {
    const utensil = await getApplication(id);
    return basicDetails(utensil);
}

async function getByUserId(user_id) {
    const utensils = await db.Utensil.find({ user_id: user_id }).sort({ created: -1});
    return utensils; //basicDetails(utensil);
}

async function create(params) {
    const utensil = new db.Utensil(params);

    // save utensil
    await utensil.save();
    return basicDetails(utensil);
}

async function update(id, params) {
    const utensil = await getApplication(id);

    if( params.status !== '' )
    {
        let message;
        let origin = "http://localhost:8100";
        if( params.status == 'Approved' ) 
        {
            message = `<h4>Cogratulation !! Your utensil is Successful!</h4>
                        <p>Please visit the <a href="${origin}/create-tutor-profile/${utensil.id}">Registration</a> page complete your Tutor profile.</p>`;
        }
        else if( params.status == 'Declined' ) 
            message = `<h4>Your utensil has been Declined!</h4>
            <p>According to requirement, you do not qualify with us as Tutor</p><br/><br/><p>Thank you for submitting your utensil.</p>`;

        /* await sendEmail({
            to: utensil.email,
            subject: 'Tutor Utensil Response',
            html: message
        }); */
    }
    // copy params to utensil and save
    Object.assign(utensil, params);
    utensil.updated = Date.now();
    await utensil.save();

    return basicDetails(utensil);
}

async function sendAlreadyRegisteredEmail(email, origin) {
    let message;
    if (origin) {
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


async function _delete(id) {
    const utensil = await getApplication(id);
    await utensil.remove();
}

// helper functions

async function getApplication(id) {
    if (!db.isValidId(id)) throw 'Utensil not found';
    const utensil = await db.Utensil.findById(id);
    if (!utensil) throw 'Utensil not found';
    return utensil;
}

function basicDetails(utensil) {
    const { _id, id, name, created } = utensil;
    return {  _id, id, name, created };
}
