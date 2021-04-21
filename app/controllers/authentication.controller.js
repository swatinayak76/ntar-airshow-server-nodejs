const config = require("config");
const CosmosClient = require("@azure/cosmos").CosmosClient;
const client = new CosmosClient(process.env.cosmosConnectionString);
const database = client.database(config.get("database"));
const container = database.container(config.get("userContainer"));

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");


exports.fetch = async (req, res) => {
    var user = await fetchUserbyID(req.user.id, req.user.zipcode)
    if (!user || user.length < 1) {
        ErrorCodeHandler.getErrorJSONData({ 'code': 17, 'res': res });
        return;
    }
    user = user[0]
    if (user.roles.indexOf('blocked') !== -1) {
        ErrorCodeHandler.getErrorJSONData({ 'code': 18, 'res': res });
        return;
    }
    delete user.password, delete user._rid, delete user._self, delete user._etag, delete user._attachments, delete user._ts
    res.json({
        ...user,
        isLogin: true,
    });
}

exports.signup = async (req, res) => {
    try {
        // required fields validation
        if (!(req.body.firstName) || !(req.body.lastName) || !(req.body.email) || !(req.body.password) || !(req.body.address) || !(req.body.address.countryCode)) {
            ErrorCodeHandler.getErrorJSONData({ 'code': 1, 'res': res });
            return;
        }
        // validate email 
        isValid = await isEmailValid(req.body.email)
        if (!isValid) {
            ErrorCodeHandler.getErrorJSONData({ 'code': 11, 'res': res });
            return;
        }
        // check account if exists
        accountExist = await fetchUserbyEmail(req.body.email)
        if (accountExist.length > 0) {
            ErrorCodeHandler.getErrorJSONData({ 'code': 12, 'res': res });
            return;
        }

        // prerpare User Object
        let user = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            roles: ["user"],
            address: req.body.address,
            created: Date.now(),
            updated: Date.now()
        }
        // encrypt user password
        user.password = await bcrypt.hash(user.password, 10);
        //   create user
        const { resource: createdUser } = await container.items.create(user);
        // create auth token
        const token = jwt.sign({ firstName: createdUser.firstName, lastName: createdUser.lastName, roles: createdUser.roles, id: createdUser.id, email: createdUser.email, countrycode: user.address.countryCode },
            process.env.ACCESS_SECRET_TOKEN,
            {
                expiresIn: '24h' // expires in 24 hours
            }
        );

        res.json({
            id: createdUser.id,
            firstName: createdUser.firstName,
            lastName: createdUser.lastName,
            email: createdUser.email,
            roles: createdUser.roles,
            Authorization: token
        });

    }
    catch (error) {
        console.log("error is", error)
        ErrorCodeHandler.getErrorJSONData({ 'code': 2, 'res': res, 'dbErr': error });
        return;
    }
}

exports.login = async (req, res) => {
    // validate body 
    if (!req.body.email || !req.body.password) {
        ErrorCodeHandler.getErrorJSONData({ 'code': 1, 'res': res });
        return;
    }
    // validate email
    isValid = await isEmailValid(req.body.email)
    if (!isValid) {
        ErrorCodeHandler.getErrorJSONData({ 'code': 11, 'res': res });
        return;
    }
    // check account if exists
    accountExist = await fetchUserbyEmail(req.body.email)
    if (accountExist.length < 1) {
        ErrorCodeHandler.getErrorJSONData({ 'code': 17, 'res': res });
        return;
    }

    try {

        const user = accountExist[0]

        const result = await bcrypt.compare(req.body.password, user.password)

        if (!result) {
            ErrorCodeHandler.getErrorJSONData({ 'code': 10, 'res': res });
            return;
        }
        const token = jwt.sign({ firstName: user.firstName, lastName: user.lastName, roles: user.roles, id: user.id, email: user.email, countrycode: user.address.countryCode },
            process.env.ACCESS_SECRET_TOKEN,
            {
                expiresIn: '24h' // expires in 24 hours
            }
        );
        // return the JWT token for the future API calls
        res.json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            roles: user.roles,
            Authorization: token
        });
    }
    catch (error) {
        ErrorCodeHandler.getErrorJSONData({ 'code': 2, 'res': res, 'dbErr': error });
        return;
    }
}

exports.views = async (req, res) => {

    try {

        let user = await fetchUserbyID(req.params.user_id)
        if (!user || user.length < 1) {
            ErrorCodeHandler.getErrorJSONData({ 'code': 20, 'res': res });
            return;
        }

        user = user[0]
        delete user.password, delete user._rid, delete user._self, delete user._etag, delete user._attachments, delete user._ts

        res.json({
            ...user
        })

    }

    catch (err) {
        res.status(400).send({
            error: err,
            message: "Unable to fetch details"
        })
    }
}


exports.updateRole = async (req, res) => {
    try {
        // validate body
        if (!req.body.userID || !req.body.roles || req.body.roles.length < 1) {
            ErrorCodeHandler.getErrorJSONData({ 'code': 1, 'res': res });
            return;

        }
        // check if role is valid
        isValid = await isRoleValid(req.body.roles)
        if (!isValid) {
            ErrorCodeHandler.getErrorJSONData({ 'code': 19, 'res': res });
            return;
        }

        // fetch user by id
        let user = await fetchUserbyID(req.body.userID)
        if (!user || user.length < 1) {
            ErrorCodeHandler.getErrorJSONData({ 'code': 20, 'res': res });
            return;
        }
        user = user[0]

        user.roles = req.body.roles

        // updaterole
        let { resource: updatedItem } = await container.items.container
            .item(req.body.userID, user.address.zipcode)
            .replace(user);

        delete updatedItem.password, delete updatedItem._rid, delete updatedItem._self, delete updatedItem._etag, delete updatedItem._attachments, delete updatedItem._ts

        res.json({
            ...updatedItem
        })
    }
    catch (error) {
        res.status(400).send({
            error: error,
            message: "Unable to update user"
        })
    }


}


exports.handleRole = function (req, res, next) {

    if (!req.body.roles) {
        next()
    }
    else if (req.body.roles.indexOf('admin') !== -1 || req.body.roles.indexOf('manager') !== -1) {

        if (req.user.roles.indexOf('admin') !== -1) {
            next();
        }
        else {
            ErrorCodeHandler.getErrorJSONData({ 'code': 15, 'res': res });
            return;
        }
    }
    else {
        next();
    }
}


/**
 * Admin Check middleware
 */
exports.isAdmin = function (req, res, next) {
    if (req.user.roles.indexOf('admin') !== -1) {
        next();
    }
    else {
        ErrorCodeHandler.getErrorJSONData({ 'code': 4, 'res': res });
        return;

    }
}


/**
 * Manager Check middleware
 */

exports.isManager = function (req, res, next) {
    if (req.user.roles.indexOf('manager') !== -1) {
        next();
    }
    else {
        ErrorCodeHandler.getErrorJSONData({ 'code': 15, 'res': res, 'text': 'Only editor can perform this action' });
        return;
    }
}

/**
 *  Admin or Manager Check middleware
 **/

exports.isPowerUser = function (req, res, next) {
    if (req.user.roles.indexOf('admin') !== -1 || req.user.roles.indexOf('manager') !== -1) {
        next();
    }
    else {
        ErrorCodeHandler.getErrorJSONData({ 'code': 15, 'res': res });
        return;

    }
}


exports.checkRole = function (req, res, next) {
    if (!req.body.roles) {
        next()
    }
    else if (req.body.roles.indexOf('admin') !== -1 || req.body.roles.indexOf('manager') !== -1) {

        auth(req, res, next)
    }
    else {
        next();
    }
}

let fetchUserbyEmail = async (email) => {
    var { resources } = await container.items
        .query({
            query: "SELECT * from c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }],
        })
        .fetchAll();
    return resources
}


let fetchUserbyID = async (id, zipcode) => {

    var { resources } = await container.items
        .query({
            query: "SELECT * from c WHERE c.id = @id",
            parameters: [{ name: "@id", value: id }],
        })
        .fetchAll();
    return resources
}

let isEmailValid = async (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

let isRoleValid = async (roles) => {
    if (roles.indexOf('admin') == -1 && roles.indexOf('manager') == -1 && roles.indexOf('user') == -1) {
        return false
    }
    return true
}
