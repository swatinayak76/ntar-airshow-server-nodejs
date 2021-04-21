const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

var userController = require('../controllers/authentication.controller');

router.route('/fetchuser').get(auth, userController.fetch);

router.route('/signup').post(userController.signup);

router.route('/login').post(userController.login);

router.route('/fetch/:user_id').get(auth, userController.views);

router.route('/updaterole').put(auth, userController.handleRole, userController.updateRole);


module.exports = router;