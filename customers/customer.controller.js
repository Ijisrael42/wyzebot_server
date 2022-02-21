﻿const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const customerService = require('./customer.service');

// routes
router.get('/', getAll);//, authorize(Role.Admin)
router.get('/:id' , getById);
router.get('/supplier/:id', getBySupplierId);
router.get('/supplier/active/:id', getAllActiveSupplierId);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', _delete);

module.exports = router;

function getAll(req, res, next) {
    customerService.getAll()
        .then(customers => res.json(customers))
        .catch(next);
}

function getAllActiveSupplierId(req, res, next) {
    customerService.getAllActiveSupplierId(req.params.id)
        .then(services => res.json(services))
        .catch(next);
}

function getById(req, res, next) {
    // users can get their own customer and admins can get any customer

    customerService.getById(req.params.id)
        .then(customer => customer ? res.json(customer) : res.sendStatus(404))
        .catch(next);
}

function getBySupplierId(req, res, next) {

    customerService.getBySupplierId(req.params.id)
        .then(customer => customer ? res.json(customer) : res.sendStatus(404))
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
    customerService.create(req.body)
        .then(customer => res.json(customer))
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
    // users can update their own customer and admins can update any customer
/*     if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
 */
    customerService.update(req.params.id, req.body)
        .then(customer => res.json(customer))
        .catch(next);
}

function _delete(req, res, next) {
    // users can delete their own customer and admins can delete any customer
/*     if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
 */
    customerService.delete(req.params.id)
        .then(() => res.json({ message: 'Account deleted successfully' }))
        .catch(next);
}
