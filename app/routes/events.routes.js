const express = require("express");
const router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const passport = require("passport");
const auth = require("../middleware/auth");

let eventController = require("../controllers/event.controller.server")

//Create a new Event item 
router.route('/createevent').post(multipartMiddleware,eventController.create)
//Update an Event item 
router.route('/updateevent').put(multipartMiddleware,eventController.update)
//Delete an Event Item 
//router.route('/deleteevent/EventCode/:eventCode/DocumentId/:DocumentId/PartitionKey/:PartitionKey').delete(eventController.delete)
router.route('/deleteevent/EventCode/:eventCode/DocumentId/:DocumentId').delete(eventController.delete)
//Get an Event item by EventCode 
router.route('/geteventbycode/:eventCode').get(eventController.get)
//Get all FeaturedEvents items 
router.route('/getallfeaturedevents').get(eventController.fetch)
//Get all Events items 
router.route('/getallevents').get(eventController.fetchAll)
//Validate an Event item by EventCode 
router.route('/validateeventbycode/:eventCode').get(eventController.validate)

module.exports = router;
