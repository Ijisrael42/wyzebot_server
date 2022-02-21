﻿const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const studentService = require('./student.service');

// routes
router.get('/', getAll);//, authorize(Role.Admin)
router.get('/:id' , getById);
router.get('/supplier/:id', getBySupplierId);
router.get('/supplier/active/:id', getAllActiveSupplierId);
router.post('/', createSchema, create);
router.put('/:id', update);
router.delete('/:id', _delete);

// new routes
router.post('/add-student', create);
router.get('/read-student/:id' , getById);
router.put('/update-student/:id', update);
router.put('/delete-student/:id', update);

module.exports = router;

function getAll(req, res, next) {
    studentService.getAll()
        .then(students => res.json(students))
        .catch(next);
}

function getAllActiveSupplierId(req, res, next) {
    studentService.getAllActiveSupplierId(req.params.id)
        .then(services => res.json(services))
        .catch(next);
}

function getById(req, res, next) {
    // users can get their own student and admins can get any student

    studentService.getById(req.params.id)
        .then(student => student ? res.json(student) : res.sendStatus(404))
        .catch(next);
}

function getBySupplierId(req, res, next) {

    studentService.getBySupplierId(req.params.id)
        .then(student => student ? res.json(student) : res.sendStatus(404))
        .catch(next);
}

function createSchema(req, res, next) {

    const schema = Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required(), 
        supplier: Joi.string().required(),
        status: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    studentService.create(req.body)
        .then(student => res.json(student))
        .catch(next);
}

/* function updateSchema(req, res, next) {
    const schemaRules = {
        title: Joi.string().empty(''),
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().email().empty(''),
        password: Joi.string().min(6).empty(''),
        confirmPassword: Joi.string().valid(Joi.ref('password')).empty('')
    };

    // only admins can update role
    if (req.user.role === Role.Admin) {
        schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    }

    const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
    validateRequest(req, next, schema);
} */

function update(req, res, next) {
    // users can update their own student and admins can update any student
/*     if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
 */
    studentService.update(req.params.id, req.body)
        .then(student => res.json(student))
        .catch(next);
}

function _delete(req, res, next) {
    // users can delete their own student and admins can delete any student
/*     if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
 */
    studentService.delete(req.params.id)
        .then(() => res.json({ message: 'Account deleted successfully' }))
        .catch(next);
}
