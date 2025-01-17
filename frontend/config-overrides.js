module.exports = function override(config) {
    config.optimization = {
        ...config.optimization,
        portableRecords: true,
    };
    return config;
};