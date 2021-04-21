// Array of All Codes
var ERROR_CODES = new Array();
const logger = require('../utils/logger');

/* ALL                            */ ERROR_CODES[0] = '';
/* ALL                            */ ERROR_CODES[1] = 'Request does not contain all required values';
/* ALL                            */ ERROR_CODES[2] = 'Unhandled error';
/* ALL                            */ ERROR_CODES[3] = 'No Data provided or Invalid Data provided';
/* ALL                            */ ERROR_CODES[4] = 'Missing Multi-part form data file, Please provide an image file for upload';
/* /event                         */ ERROR_CODES[5] = 'Event With Same Code Already Exist,Please try with different EventCode or Update Existing Event';
/* Unauthorized                   */ ERROR_CODES[6] = 'User Unauthorized'
/* /event                         */ ERROR_CODES[7] = 'Invalid Event code';

/* auth/login                     */ ERROR_CODES[9] = 'User Not Logged in';
/* auth/login                     */ ERROR_CODES[10] = 'Incorrect Email Address/ Password';
/* auth/signup                    */ ERROR_CODES[11] = 'Invalid Email Address';
/* auth/signup                    */ ERROR_CODES[12] = 'Account with this Email already exists';
/* auth/signup                    */ ERROR_CODES[13] = 'Atleast 1 user role is required, Default : [user]';
/* auth/fetchUser                 */ ERROR_CODES[14] = 'Login Session Expired';
/* ALL                            */ ERROR_CODES[15] = 'Only Admins/Manager can perform this action';
/* auth/userRoles                 */ ERROR_CODES[16] = 'userId required';
/* auth/signup                    */ ERROR_CODES[17] = 'No Account with this Email';
/* auth/fetchuser                 */ ERROR_CODES[18] = 'User is blocked, please contact admin';
/* auth/updaterole                */ ERROR_CODES[19] = 'Not a valid role !!';
/* All                            */ ERROR_CODES[20] = 'Invalid Id';
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
        logger.error(`${http_code?http_code:400} - ${error_text}`)
        res.status(http_code?http_code:400).send(errResp);
        return;
    },

}

// export
module.exports = ErrorCodeHandler;