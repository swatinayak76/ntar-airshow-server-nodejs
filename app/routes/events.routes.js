const express = require("express");
const router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const passport = require("passport");
const auth = require("../middleware/auth");

let eventController = require("../controllers/event.controller.server")

var userController = require('../controllers/authentication.controller');

//Create a new Event item - user with role admin and manager can create a event
router.route('/createevent').post(auth, userController.isPowerUser, multipartMiddleware, eventController.create)
//Update an Event item 
router.route('/updateevent').put(auth, userController.isPowerUser, multipartMiddleware, eventController.update)
//Delete an Event Item 
//router.route('/deleteevent/EventCode/:eventCode/DocumentId/:DocumentId/PartitionKey/:PartitionKey').delete(eventController.delete)
// only admins can delete a event
router.route('/deleteevent/EventCode/:eventCode/DocumentId/:DocumentId').delete(auth, userController.isAdmin, eventController.delete)
//Get an Event item by EventCode 
router.route('/geteventbycode/:eventCode').get(eventController.get)
//Get all FeaturedEvents items 
router.route('/getallfeaturedevents').get(eventController.fetch)
//Get all Events items 
router.route('/getallevents').get(auth, eventController.fetchAll)
//Validate an Event item by EventCode 
router.route('/validateeventbycode/:eventCode').get(eventController.validate)

module.exports = router;
