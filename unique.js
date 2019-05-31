exports.generateUserId = function() {
    return 'uid-' + Math.random().toString(36).substr(2, 16);
};

exports.generateBusinessId = function() {
    return 'bid-' + Math.random().toString(36).substr(2, 16);
};

exports.generateCustomerId = function() {
    return 'cid-' + Math.random().toString(36).substr(2, 16);
};

exports.generateTransactionId = function() {
    return 'pid-' + Math.random().toString(36).substr(2, 16);
};

