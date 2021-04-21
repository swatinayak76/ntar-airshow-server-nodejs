// Import express
let express = require('express');
// Import Body parser
let bodyParser = require('body-parser');
var winston = require('winston'); // for transports.Console
let expressWinston = require('express-winston');



// console.log(oauth);

const config = require("config");


// Initialize the app
let app = express();

// configure environment variable
require('custom-env').env(config.get("enviroment"))


// Adding Error Code Handler global
global.ErrorCodeHandler = require('./app/handlers/errorCode');

// routes defined here
const eventRoutes = require("./app/routes/events.routes")
const userRoutes = require("./app/routes/user.routes")

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

const httpTransportOptions = {
    host: 'http-intake.logs.datadoghq.com',
    path: `/v1/input/${process.env.DATADOG}?ddsource=nodejs&service=azureapp`,
    ssl: true
  };

//  enable routers logging
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Http(httpTransportOptions),
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    ),
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: false,
    ignoreRoute: function (req, res) { return false; }
}));

app.use("/airshow/v1/events", eventRoutes);
app.use("/airshow/v1/auth", userRoutes)
//server health check
//app.get('/', (req, res) => res.send('Ok'));

var port = process.env.PORT || 5000;

// Launch app to listen to specified port
app.listen(port, function () {
    console.log("Running Server on port =>" + port);
});