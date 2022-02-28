const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const Role = require('_helpers/role');
const tribesService = require('./tribe.service');

// routes

router.get('/', getAll);
router.get('/active', getAllActive);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', _delete);
router.post('/deletemany', deletemany);

module.exports = router;

function getAll(req, res, next) {
    tribesService.getAll()
        .then(tribes => res.json(tribes))
        .catch(next);
}

function getAllActive(req, res, next) {
    tribesService.getAllActive()
        .then(tribes => res.json(tribes))
        .catch(next);
}

function getById(req, res, next) {
    // users can get their own tribe and admins can get any tribe

    tribesService.getById(req.params.id)
        .then(tribe => tribe ? res.json(tribe) : res.sendStatus(404))
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
    tribesService.create(req.body)
        .then(tribe => res.json(tribe))
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
    // users can update their own tribe and admins can update any tribe

    tribesService.update(req.params.id, req.body)
        .then(tribe => res.json(tribe))
        .catch(next);
}

function _delete(req, res, next) {
    // users can delete their own tribe and admins can delete any tribe
/*     if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
 */
    tribesService.delete(req.params.id)
        .then(() => res.json({ message: 'Account deleted successfully' }))
        .catch(next);
}

function deletemany(req, res, next) {
    tribesService.deletemany(req, res)
        .then(() => res.json({ message: 'Accounts deleted successfully' }))
        .catch(next);
}