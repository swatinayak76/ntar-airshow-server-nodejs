// Array of All Codes
var ERROR_CODES = new Array();

/* ALL                            */ ERROR_CODES[0] = '';
/* ALL                            */ ERROR_CODES[1] = 'Request does not contain all required values';
/* ALL                            */ ERROR_CODES[2] = 'Unhandled error';
/* ALL                            */ ERROR_CODES[3] = 'No Data provided or Invalid Data provided';
/* ALL                            */ ERROR_CODES[4] = 'Missing Multi-part form data file, Please provide an image file for upload';
/* /event                         */ ERROR_CODES[5] = 'Event With Same Code Already Exist,Please try with different EventCode or Update Existing Event';
/* Unauthorized                   */ ERROR_CODES[6] = 'User UnAuthorized'

// @Response Handler
var ErrorCodeHandler = {
    // @Get Error JSON data
    getErrorJSONData: function (data_param) {
        // data
        var code = data_param.code;
        var http_code = data_param.http_code;
        var res = data_param.res;
        var data = "";
        if (data_param.data) {
            data = data_param.data;
        }

        // response
        var errResp = {};

        // Get Error Description
        var error_text = ERROR_CODES[code];

        if (data_param.text && data_param.text.length > 0) {
            error_text = data_param.text;
        }

        errResp = {
            "data": data,
            "error": {
                "code": http_code,
                "text": error_text
            }
        };
        res.status(http_code?http_code:400).send(errResp);
        return;
    },

}

// export
module.exports = ErrorCodeHandler;