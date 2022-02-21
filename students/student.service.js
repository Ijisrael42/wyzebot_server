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
    const students = await db.Student.find().sort({ created: -1});
    return students.map(x => basicDetails(x));
}

async function getAllActiveSupplierId(id) {
    const students = await db.Student.find({ supplier: id, status: "Enabled"}).sort({ created: -1});
    return students.map(x => basicDetails(x));
}

async function getBySupplierId(id) {
    const students = await db.Student.find({ supplier: id}).sort({ created: -1});
    return students.map(x => basicDetails(x));
}

async function getById(id) {
    const student = await getApplication(id);
    return basicDetails(student);
}

async function getByUserId(user_id) {
    const students = await db.Student.find({ user_id: user_id }).sort({ created: -1});
    return students; //basicDetails(student);
}

async function create(params) {
    const student = new db.Student(params);

    // save student
    await student.save();
    return basicDetails(student);
}

async function update(id, params) {
    const student = await getApplication(id);

    if( params.status !== '' )
    {
        let message;
        let origin = "http://localhost:8100";
        if( params.status == 'Approved' ) 
        {
            message = `<h4>Cogratulation !! Your student is Successful!</h4>
                        <p>Please visit the <a href="${origin}/create-tutor-profile/${student.id}">Registration</a> page complete your Tutor profile.</p>`;
        }
        else if( params.status == 'Declined' ) 
            message = `<h4>Your student has been Declined!</h4>
            <p>According to requirement, you do not qualify with us as Tutor</p><br/><br/><p>Thank you for submitting your student.</p>`;

        /* await sendEmail({
            to: student.email,
            subject: 'Tutor Student Response',
            html: message
        }); */
    }
    // copy params to student and save
    Object.assign(student, params);
    student.updated = Date.now();
    await student.save();

    return basicDetails(student);
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
    const student = await getApplication(id);
    await student.remove();
}

// helper functions

async function getApplication(id) {
    if (!db.isValidId(id)) throw 'Student not found';
    const student = await db.Student.findById(id);
    if (!student) throw 'Student not found';
    return student;
}

function basicDetails(student) {
    const { _id, id, student_name, student_email, section, gender, subjects, dob, created } = student;
    return { _id, id, student_name, student_email, section, gender, subjects, dob, created };
}
