'use strict';

var querystring = require('querystring');

var crypto = require('crypto');

var fs = require('fs');

module.exports = {
    rsaSign: rsaSign,
    assignArray: assignArray,
    buildSign: _buildSign,
    md5Verify: md5Verify,
    rsaVerify: rsaVerify
};

function rsaSign(json, private_key) {

    if (!private_key) {
        throw new Error('missing private key');
    }

    var Pkey = fs.readFileSync(private_key);

    var str = sortArr(json);

    var signer = crypto.createSign('RSA-SHA1');

    signer.update(str);

    var sign = signer.sign(Pkey, 'base64');

    return sign;
}

function assignArray(me, json) {
    for (var key in json) {
        if (json.hasOwnProperty(key)) {
            me[key] = json[key];
        }
    }
}

function sortArr(json) {
    var keys = Object.keys(json);
    keys = keys.sort();
    var map = {};

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key !== 'sign' && key !== 'sign_type' && json[key]) {
            map[key] = json[key];
        }
    }

    var str = querystring.unescape(querystring.stringify(map));

    return str;
}

function _buildSign(json, md5key) {

    let str = sortArr(json) + aliKey;

    return crypto.createHash('md5').update(str, 'utf-8').digest('hex');
}

function rsaVerify(params, publicKey) {

    var str = sortArr(params);

    var verify = crypto.createVerify('RSA-SHA1');

    verify.update(str);

    var result = verify.verify(publicKey, params.sign, 'base64');

    return result;
}

function md5Verify(params, md5key) {
    var sign = _buildSign(params, md5key);

    return sign == params.sign;
}
