const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const utensilService = require('./utensil.service');

// routes
router.get('/', getAll);//, authorize(Role.Admin)
router.get('/:id' , getById);
router.get('/supplier/:id', getBySupplierId);
router.get('/supplier/active/:id', getAllActiveSupplierId);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', _delete);

// new routes

module.exports = router;

function getAll(req, res, next) {
    utensilService.getAll()
        .then(utensils => res.json(utensils))
        .catch(next);
}

function getAllActiveSupplierId(req, res, next) {
    utensilService.getAllActiveSupplierId(req.params.id)
        .then(utensils => res.json(utensils))
        .catch(next);
}

function getById(req, res, next) {
    // users can get their own utensil and admins can get any utensil

    utensilService.getById(req.params.id)
        .then(utensil => utensil ? res.json(utensil) : res.sendStatus(404))
        .catch(next);
}

function getBySupplierId(req, res, next) {

    utensilService.getBySupplierId(req.params.id)
        .then(utensil => utensil ? res.json(utensil) : res.sendStatus(404))
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
    
    utensilService.create(req.body)
        .then(utensil => res.json(utensil))
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
    // users can update their own utensil and admins can update any utensil
/*     if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
 */
    utensilService.update(req.params.id, req.body)
        .then(utensil => res.json(utensil))
        .catch(next);
}

function _delete(req, res, next) {
    // users can delete their own utensil and admins can delete any utensil
/*     if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
 */
    utensilService.delete(req.params.id)
        .then(() => res.json({ message: 'Account deleted successfully' }))
        .catch(next);
}
