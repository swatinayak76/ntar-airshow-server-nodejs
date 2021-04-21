const { BlobServiceClient } = require("@azure/storage-blob");
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
        let _eventLogo = [];
        let _loadingScreen = [];
        let { eventLogo, loadingScreen } = req.files;
        let _payload = JSON.parse(req.body.payload);
        let id = uuidv1();
        _payload.id = id;
        _payload.partitionKey = "event";
        _payload.docType = "event";
        let type = { type: "create", id: _payload.id }

        if (eventLogo) {
            eventLogo = convert2Array(eventLogo)
            for (let i = 0; i < eventLogo.length; i++) {
                obj = await prepareObj(eventLogo[i], type)
                _eventLogo.push(obj)
            }
        }

        if (loadingScreen) {
            loadingScreen = convert2Array(loadingScreen)
            for (let i = 0; i < loadingScreen.length; i++) {
                obj = await prepareObj(loadingScreen[i], type)
                _loadingScreen.push(obj)
            }
        }

        for (let index = 0; index < _payload.experiences.length; index++) {
            const performance = _payload.experiences[index].performer;
            const Virtualvenue = _payload.experiences[index].virtualVenue;
            let video = req.files[`performances_${index}_video`];
            let audio = req.files[`performances_${index}_audio`];
            let featuredImage = req.files[`featured_${index}_image`];
            let bg_video = req.files[`background_${index}_video`];
            let ThumbnailImage =
                req.files[`performances_${index}_thumbnailImage`];

            if (ThumbnailImage) {
                performance.performanceThumbnail = [];
                ThumbnailImage = convert2Array(ThumbnailImage)
                for (let i = 0; i < ThumbnailImage.length; i++) {
                    obj = await prepareObj(ThumbnailImage[i], type)
                    performance.performanceThumbnail.push(obj)
                }
            }

            if (video) {
                performance.performanceVideo = [];
                video = convert2Array(video)
                for (let i = 0; i < video.length; i++) {
                    obj = await prepareObj(video[i], type)
                    performance.performanceVideo.push(obj)
                }
            }

            if (audio) {
                performance.performanceAudio = [];
                audio = convert2Array(audio)
                for (let i = 0; i < audio.length; i++) {
                    obj = await prepareObj(audio[i], type)
                    performance.performanceAudio.push(obj)
                }

            }

            if (featuredImage) {
                performance.featuredImage = [];
                featuredImage = convert2Array(featuredImage)
                for (let i = 0; i < featuredImage.length; i++) {
                    obj = await prepareObj(featuredImage[i], type)
                    performance.featuredImage.push(obj)
                }
            }

            if (bg_video) {
                Virtualvenue.backgroundVideo = [];
                bg_video = convert2Array(bg_video)
                for (let i = 0; i < bg_video.length; i++) {
                    obj = await prepareObj(bg_video[i], type)
                    Virtualvenue.backgroundVideo.push(obj)
                }
            }
        }

        // website handler ...
        for (let index = 0; index < _payload.websites.length; index++) {
            const website = _payload.websites[index]
            let web_logo = req.files[`website_${index}_logo`];
            if (web_logo) {
                website.websiteLogo = []
                web_logo = convert2Array(web_logo)
                for (let i = 0; i < web_logo.length; i++) {
                    obj = await prepareObj(web_logo[i], type)
                    website.websiteLogo.push(obj)
                }
            }
        }

        // merch handler
        for (let index = 0; index < _payload.merch.length; index++) {
            const merch = _payload.merch[index]
            let merch_logo = req.files[`product_${index}_logo`];
            if (merch_logo) {
                merch.productLogo = []
                merch_logo = convert2Array(merch_logo)
                for (let i = 0; i < merch_logo.length; i++) {
                    obj = await prepareObj(merch_logo[i], type)
                    merch.productLogo.push(obj)
                }
            }
        }

        // sponsor hanlder
        for (let index = 0; index < _payload.sponsors.length; index++) {
            const sponsor = _payload.sponsors[index]
            let sponsor_logo = req.files[`sponsor_${index}_logo`];
            if (sponsor_logo) {
                sponsor.sponsorLogo = []
                sponsor_logo = convert2Array(sponsor_logo)
                for (let i = 0; i < sponsor_logo.length; i++) {
                    obj = await prepareObj(sponsor_logo[i], type)
                    sponsor.sponsorLogo.push(obj)
                }
            }
        }

        _payload.eventLogo = _eventLogo;
        _payload.loadingScreen = _loadingScreen;
        const { resource: createdItem } = await container.items.create(_payload);
        res.status(200).json({
            message: "Event: " + _payload.eventCode + " Created Successfully",
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
        let _eventLogo = [];
        let _loadingScreen = [];
        let { eventLogo, loadingScreen } = req.files;
        let _payload = JSON.parse(req.body.payload);
      
        let type = { type: "update", id: _payload.id }
        if (eventLogo) {
            eventLogo = convert2Array(eventLogo)
            for (let i = 0; i < eventLogo.length; i++) {
                obj = await prepareObj(eventLogo[i], type, lastModified(_payload.eventLogo[i]))
                _eventLogo[i]=obj
            }
        }

        if (loadingScreen) {
            loadingScreen = convert2Array(loadingScreen)
            for (let i = 0; i < loadingScreen.length; i++) {
                obj = await prepareObj(loadingScreen[i], type, lastModified(_payload.loadingScreen[i]))
                _loadingScreen[i]=obj
            }
        }
        // experiences handler
        for (let index = 0; index < _payload.experiences.length; index++) {
            const performance = _payload.experiences[index].performer;
            const Virtualvenue = _payload.experiences[index].virtualVenue;
            let video = req.files[`performances_${index}_video`];
            let audio = req.files[`performances_${index}_audio`];
            let featuredImage = req.files[`featured_${index}_image`];
            let bg_video = req.files[`background_${index}_video`];
            let ThumbnailImage =
                req.files[`performances_${index}_thumbnailImage`];

            if (ThumbnailImage) {
                ThumbnailImage = convert2Array(ThumbnailImage)
                for (let i = 0; i < ThumbnailImage.length; i++) {
                    obj = await prepareObj(ThumbnailImage[i], type, lastModified(performance.performanceThumbnail[i]))
                    performance.performanceThumbnail.push(obj)
                }
            }

            if (video) {
                video = convert2Array(video)
                for (let i = 0; i < video.length; i++) {
                    obj = await prepareObj(video[i], type, lastModified(performance.performanceVideo[i]))
                    performance.performanceVideo.push(obj)
                }
            }

            if (audio) {
                audio = convert2Array(audio)
                for (let i = 0; i < audio.length; i++) {
                    obj = await prepareObj(audio[i], type, lastModified(performance.performanceAudio[i]))
                    performance.performanceAudio.push(obj)
                }

            }

            if (featuredImage) {
                featuredImage = convert2Array(featuredImage)
                for (let i = 0; i < featuredImage.length; i++) {
                    obj = await prepareObj(featuredImage[i], type, lastModified(performance.featuredImage[i]))
                    performance.featuredImage.push(obj)
                }
            }

            if (bg_video) {
                bg_video = convert2Array(bg_video)
                for (let i = 0; i < bg_video.length; i++) {
                    obj = await prepareObj(bg_video[i], type, lastModified(Virtualvenue.backgroundVideo[i]))
                    Virtualvenue.backgroundVideo.push(obj)
                }
            }
        }

        // website handler ...
        for (let index = 0; index < _payload.websites.length; index++) {
            const website = _payload.websites[index]
            let web_logo = req.files[`website_${index}_logo`];
            if (web_logo) {
                web_logo = convert2Array(web_logo)
                for (let i = 0; i < web_logo.length; i++) {
                    obj = await prepareObj(web_logo[i], type, lastModified(website.websiteLogo[i]))
                    website.websiteLogo[i]=obj
                }
            }
        }

        // merch handler
        for (let index = 0; index < _payload.merch.length; index++) {
            const merch = _payload.merch[index]
            let merch_logo = req.files[`product_${index}_logo`];
            if (merch_logo) {
                merch_logo = convert2Array(merch_logo)
                for (let i = 0; i < merch_logo.length; i++) {
                    obj = await prepareObj(merch_logo[i], type, lastModified(merch.productLogo[i]))
                    merch.productLogo[i]=obj
                }
            }
        }

        // sponsor handler
        for (let index = 0; index < _payload.sponsors.length; index++) {
            const sponsor = _payload.sponsors[index]
            let sponsor_logo = req.files[`sponsor_${index}_logo`];
            if (sponsor_logo) {
                sponsor_logo = convert2Array(sponsor_logo)
                for (let i = 0; i < sponsor_logo.length; i++) {
                    obj = await prepareObj(sponsor_logo[i], type, lastModified(sponsor.sponsorLogo[i]))
                    sponsor.sponsorLogo[i]=obj
                }
            }
        }

        _payload.eventLogo = _eventLogo.length > 0 ? _eventLogo : _payload.eventLogo;
        _payload.loadingScreen = _loadingScreen.length > 0 ? _loadingScreen : _payload.loadingScreen;

        const { resource: updatedItem } = await container.items.container
            //.item(_payload.id, _payload.eventCode)
            .item(_payload.id, 'event')
            .replace(_payload);
        res.status(200).json({
            message: "Event: " + _payload.eventCode + " Updated! Successfully",
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
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.uploadFile(filePath);
    return blockBlobClient.url;
}