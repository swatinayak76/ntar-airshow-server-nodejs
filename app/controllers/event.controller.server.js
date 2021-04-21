const { BlobServiceClient } = require("@azure/storage-blob");
var storage = require("@azure/storage-blob");
const storageConnectionString = process.env.storageConnectionString
const blobServiceClient = BlobServiceClient.fromConnectionString(
    storageConnectionString
);
const config = require("config");
const { v1: uuidv1 } = require("uuid");
const CosmosClient = require("@azure/cosmos").CosmosClient;
const containerClient = blobServiceClient.getContainerClient(config.get("containerName"));
const client = new CosmosClient(process.env.cosmosConnectionString);
const database = client.database(config.get("database"));
const container = database.container(config.get("container"));

//Create a new Event item 
exports.create = async (req, res) => {
    try {   
        
        let payload = JSON.parse(req.body.payload);
        let eventCode =  payload.eventCode;

        if (!eventCode && eventCode.length < 1 ) {
            ErrorCodeHandler.getErrorJSONData({ 'code': 7, 'res': res });
            return;
        }

        let id = uuidv1();
        payload.id = id;
        payload.partitionKey = "event";
        payload.docType = "event";
        let type = { type: "create", id: payload.id }

        // Media files hanlder
        if (req.files){

            var mediafiles = req.files;
            //console.log(mediafiles);
            var result = [];
    
            for(var i in mediafiles){
                obj = await prepareObj(mediafiles [i], type)
                result.push(obj)            
            }        
            //console.log(result);
            payload.mediaFiles = result;
        }
        
        const { resource: createdItem } = await container.items.create(payload);
        res.status(200).json({
            message: "Event: " + payload.eventCode + " Created Successfully",
            status: "success",
            code: 200,
            data: createdItem
        })
    } catch (err) {
        console.log("error is",err)
        if (err.message.includes("id already exists in the system")) {
            ErrorCodeHandler.getErrorJSONData({ 'code': 5, 'res': res });
            return;
        }
        ErrorCodeHandler.getErrorJSONData({ 'code': 2, 'res': res, 'text': err.message });
        return;
    }
}

//Update an Event item 
exports.update = async (req, res) => {
    try {
        //let _eventLogo = [];
        //let _loadingScreen = [];
        //let { eventLogo, loadingScreen } = req.files;
        let payload = JSON.parse(req.body.payload);     
        let type = { type: "update", id: payload.id }

        // Media files hanlder
        if (req.files){

            var mediafiles = req.files;
            //console.log(mediafiles);
            var result = [];
    
            for(var i in mediafiles){
                //let inFieldName = payload.mediaFiles.
                obj = await prepareObj(mediafiles [i],  type, lastModified(mediafiles[i]))
                result.push(obj)            
            }        
            //console.log(result);
            payload.mediaFiles = result;
        }

        //const Virtualvenue = _payload.experiences[index].virtualVenue;
        //let video = req.files[`performances_${index}_video`];

        //_payload.eventLogo = _eventLogo.length > 0 ? _eventLogo : _payload.eventLogo;
        //_payload.loadingScreen = _loadingScreen.length > 0 ? _loadingScreen : _payload.loadingScreen;

        const { resource: updatedItem } = await container.items.container
            //.item(_payload.id, _payload.eventCode)
            .item(payload.id, 'event')
            .replace(payload);
        res.status(200).json({
            message: "Event: " + payload.eventCode + " Updated! Successfully",
            data: updatedItem
        })
    } catch (err) {
        console.log("error is", err)

        ErrorCodeHandler.getErrorJSONData({ 'code': 2, 'res': res, 'text': err.message ? err.message : err });
        return;
    }
}


//Delete an Event Item 
exports.delete = async (req, res) => {
    try {
        const { resource: result } = await container
            //.item(req.params.DocumentId, req.params.PartitionKey)
            .item(req.params.DocumentId, 'event')
            .delete();
        res.status(200).json({
            status: "success",
            code: 200,
            message: "Event: " + req.params.eventCode + " deleted successfully",
        });
    } catch (err) {
        ErrorCodeHandler.getErrorJSONData({ 'code': 2, 'res': res, 'text': err.message });
        return;
    }
}


//Validate an Event item by EventCode 
exports.validate = async (req, res) => {
    try {
        const { resources } = await container.items
            .query({
                query: "SELECT * from c WHERE c.eventCode = @eventCode",
                parameters: [{ name: "@eventCode", value: req.params.eventCode }],
            })
            .fetchAll();
        res.status(200).json({
            status: "success",
            code: 200,
            message: resources.length > 0 ? "exists" : "not exists",
        });
    }
    catch (err) {
        ErrorCodeHandler.getErrorJSONData({ 'code': 2, 'res': res, 'text': err.message });
        return;
    }

}


// Get an Event item by EventCode 
exports.get = async (req, res) => {
    try {
        const { resources } = await container.items
            .query({
                query: "SELECT * from c WHERE c.eventCode = @eventCode",
                parameters: [{ name: "@eventCode", value: req.params.eventCode }],
            })
            .fetchAll();
        res.status(200).json({
            status: "success",
            code: 200,
            message: resources.length > 0 ? "Event: " + req.params.eventCode + " fetched successfully" : "Event: " + req.params.eventCode + " does not exists",
            data: resources
        });
    } catch (err) {
        ErrorCodeHandler.getErrorJSONData({ 'code': 2, 'res': res, 'text': err.message });
        return;
    }
}


// Get all Events items  
//passport.authenticate('oauth-bearer', {session: false}),
exports.fetchAll = async (req, res) => {
    try {
        console.log('Validated claims: ', req.authInfo);
        const { resources } = await container.items
            .query({
                query: "SELECT * from c"
            })
            .fetchAll();
        res.status(200).json({
            status: "success",
            code: 200,
            message: "All Events Fetched Successfully",
            data: resources
        });
    } catch (err) {
        ErrorCodeHandler.getErrorJSONData({ 'code': 2, 'res': res, 'text': err.message });
        return;
    }
}


// Get all FeaturedEvents items   
exports.fetch = async (req, res) => {
    try {
        const { resources } = await container.items
            .query({
                query: "SELECT c.eventCodes from c WHERE c.docType = 'featuredevents'"
                // parameters: [{ name: "@docType", value: "featuredevents" }],
            })
            .fetchAll();
        res.status(200).json({
            status: "success",
            code: 200,
            message: "All Events Fetched Successfully",
            data: resources
        });
    } catch (err) {
        ErrorCodeHandler.getErrorJSONData({ 'code': 2, 'res': res, 'text': err.message });
        return;
    }
}

let prepareObj = async (fileObject, info, date) => {
    let set = {
        fieldName: fileObject.fieldName,
        lastModifiedDate: Date.now(),
        fileName: fileObject.originalFilename,
        lastModifiedBy: undefined,
        contentType: fileObject.type
    }
    if (info.type == "create") {
        set.createdDate = Date.now()
    }
    if (info.type == "update") {
        // if previous exist make it same, else update it as new one
        set.createdDate = date ? date : Date.now()

    }
    set.filepath = await uploadToAzureStorage(fileObject, info.id);

    return set
}
let lastModified = (obj) => {
    return obj ? obj.createdDate : undefined
}

let convert2Array = (obj) => {
    return Array.isArray(obj) ? obj : [obj]
}

async function uploadToAzureStorage(file, id) {
    const blobName = id + "/" + file.name;
    const contentType = file.type;
    const filePath = file.path; //This is where you get the file path.

    const accountname ="ntarairshowdevsa";
    const key = "1+rL1OCok5HOoszNQPsrCh+NzmXbJG8XGisYbrRGFdfvSTwnm3Ts/pWtYe0qpxvfqqeeyrVNmfk7D9/Vrar6UQ==";
    const signedpermissions = 'rwdlac';
    const signedservice = 'b';
    const signedresourcetype = 'sco'; 
    const signedProtocol = 'https';
    const signedversion = '2020-02-10';
    const cerds = new storage.StorageSharedKeyCredential(accountname,key);
    var startDate = new Date();
    var expiryDate = new Date();
    startDate.setTime(startDate.getTime() - 5*60*1000);
    expiryDate.setTime(expiryDate.getTime() + 24*60*60*1000);
    expiryDate.setTime(expiryDate.getTime() + 24*60*60*1000);
    var result = storage.generateAccountSASQueryParameters({
      expiresOn : expiryDate,
      permissions: storage.AccountSASPermissions.parse(signedpermissions),
      protocol: storage.SASProtocol.Https,
      resourceTypes: storage.AccountSASResourceTypes.parse(signedresourcetype).toString(),
      services: storage.AccountSASServices.parse(signedservice).toString(),
      startsOn: startDate,
      version:signedversion
    },cerds).toString();
    console.log(result);


    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.uploadFile(filePath);

    const sasUrl= blockBlobClient.url+"?"+result;
    console.log(sasUrl);
    return sasUrl;
}