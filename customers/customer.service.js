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
    const customers = await db.Customer.find().sort({ created: -1});
    return customers.map(x => basicDetails(x));
}

async function getAllActiveSupplierId(id) {
    const customers = await db.Customer.find({ supplier: id, status: "Enabled"}).sort({ created: -1});
    return customers.map(x => basicDetails(x));
}

async function getBySupplierId(id) {
    const customers = await db.Customer.find({ supplier: id}).sort({ created: -1});
    return customers.map(x => basicDetails(x));
}

async function getById(id) {
    const customer = await getApplication(id);
    return basicDetails(customer);
}

async function getByUserId(user_id) {
    const customers = await db.Customer.find({ user_id: user_id }).sort({ created: -1});
    return customers; //basicDetails(customer);
}

async function create(params) {
    const customer = new db.Customer(params);

    // save customer
    await customer.save();
    return basicDetails(customer);
}

async function update(id, params) {
    const customer = await getApplication(id);

    if( params.status !== '' )
    {
        let message;
        let origin = "http://localhost:8100";
        if( params.status == 'Approved' ) 
        {
            message = `<h4>Cogratulation !! Your customer is Successful!</h4>
                        <p>Please visit the <a href="${origin}/create-tutor-profile/${customer.id}">Registration</a> page complete your Tutor profile.</p>`;
        }
        else if( params.status == 'Declined' ) 
            message = `<h4>Your customer has been Declined!</h4>
            <p>According to requirement, you do not qualify with us as Tutor</p><br/><br/><p>Thank you for submitting your customer.</p>`;

        /* await sendEmail({
            to: customer.email,
            subject: 'Tutor Customer Response',
            html: message
        }); */
    }
    // copy params to customer and save
    Object.assign(customer, params);
    customer.updated = Date.now();
    await customer.save();

    return basicDetails(customer);
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
    const customer = await getApplication(id);
    await customer.remove();
}

// helper functions

async function getApplication(id) {
    if (!db.isValidId(id)) throw 'Customer not found';
    const customer = await db.Customer.findById(id);
    if (!customer) throw 'Customer not found';
    return customer;
}

function basicDetails(customer) {
    const { _id, id, name, phone_number, location, gender, created } = customer;
    return { _id, id, name, phone_number, location, gender, created };
}
