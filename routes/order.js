const express = require('express');
const router = express.Router();
const passport = require('passport')
const controller = require('../controllers/order')

router.get('/', passport.authenticate('jwt', {session: false}), controller.getAll);
router.post('/', passport.authenticate('jwt', {session: false}), controller.create);

module.exports = router;