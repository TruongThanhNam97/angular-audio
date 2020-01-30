var DEVELOPMENT = true;
var config = {};

config.DB_IP = "mongodb://127.0.0.1:27017";
config.DB_NAME = "audio";


if (DEVELOPMENT) {
    config.DB_IP = "mongodb://127.0.0.1:27017";
    config.DB_NAME = "audio";
}
else {
    config.DB_IP = "mongodb://truongthanhnam:nam29041997@ds137008.mlab.com:37008";
    config.DB_NAME = "audio";
}

config.DB_STRING = config.DB_IP + "/" + config.DB_NAME;

module.exports = config;