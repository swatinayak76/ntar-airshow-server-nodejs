// Import express
let express = require('express');
// Import Body parser
let bodyParser = require('body-parser');

let passport = require('passport');


// console.log(oauth);

const config = require("config");


// Initialize the app
let app = express();

// configure environment variable
require ('custom-env').env(config.get("enviroment"))

require("./app/config/strategies/azure_Oauth")();

app.use(passport.initialize());


// Adding Error Code Handler global
global.ErrorCodeHandler = require('./app/handlers/errorCode');

// routes defined here
const eventRoutes = require("./app/routes/events.routes")

app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers',
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    )
    res.setHeader('Access-Control-Allow-Methods',
        "GET, POST, PUT, DELETE, OPTIONS"
    )
    next()
})

app.use("/airshow/v1/events", eventRoutes);
//server health check
//app.get('/', (req, res) => res.send('Ok'));

// API endpoint exposed
app.get("/",
    passport.authenticate('oauth-bearer', {session: false}),
    (req, res) => {
        console.log('Validated claims: ', req.authInfo);

        // Service relies on the name claim.  
        res.status(200).json({
            'name': req.authInfo['name'],
            'issued-by': req.authInfo['iss'],
            'issued-for': req.authInfo['aud'],
            'scope': req.authInfo['scp']
        });
    }
);



var port = process.env.PORT || 5000;

// Launch app to listen to specified port
app.listen(port, function () {
    console.log("Running Server on port =>" + port);
});