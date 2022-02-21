const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const washingsService = require('./washing.service');

// routes

router.get('/', getAll);
router.get('/active', getAllActive);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', _delete);

module.exports = router;

function getAll(req, res, next) {
    washingsService.getAll()
        .then(washings => res.json(washings))
        .catch(next);
}

function getAllActive(req, res, next) {
    washingsService.getAllActive()
        .then(washings => res.json(washings))
        .catch(next);
}

function getById(req, res, next) {
    // users can get their own washing and admins can get any washing

    washingsService.getById(req.params.id)
        .then(washing => washing ? res.json(washing) : res.sendStatus(404))
        .catch(next);
}



function createSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        role: Joi.string().valid(Role.Admin, Role.User).required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    washingsService.create(req.body)
        .then(washing => res.json(washing))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schemaRules = {
        title: Joi.string().empty(''),
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().email().empty(''),
        password: Joi.string().min(6).empty(''),
        confirmPassword: Joi.string().valid(Joi.ref('password')).empty(''),
        device_token: Joi.string().empty('')
    };

    // only admins can update role
    if (req.user.role === Role.Admin) {
        schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    }

    const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    // users can update their own washing and admins can update any washing

    washingsService.update(req.params.id, req.body)
        .then(washing => res.json(washing))
        .catch(next);
}

function _delete(req, res, next) {
    // users can delete their own washing and admins can delete any washing
/*     if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
 */
    washingsService.delete(req.params.id)
        .then(() => res.json({ message: 'Account deleted successfully' }))
        .catch(next);
}