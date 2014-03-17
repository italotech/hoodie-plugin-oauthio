var assert = require('chai').assert;


exports['test one'] = function (done) {
    assert.ok(true, 'everything is OK!');
    done();
};

exports['test two'] = function (done) {
    assert.ok(true, 'everything is still OK!');
    done();
};
