'use strict';

var util = require('./util');

var directAlipay = require('direct-alipay');

var querystring = require('querystring');

var http = require('request');

var alipay = function(params) {
    params.precreate_url = 'https://openapi.alipay.com/gateway.do?';

    this.https_verify_url = 'https://mapi.alipay.com/gateway.do?';

    this.params = params;

    this.private_key = params.private_key;

    this._input_charset = 'utf-8';

    this.sign_type = params.sign_type;

    this.public_key = new Buffer(`-----BEGIN PUBLIC KEY-----
` + params.public_key + `
-----END PUBLIC KEY-----`);

    directAlipay.config(params);
}

alipay.prototype.buildPCPayURL = function(orderParams) {

    var gatewayUrl = 'https://mapi.alipay.com/gateway.do?';

    var json = {
        service: 'create_direct_pay_by_user',
        payment_type: '1',
        _input_charset: this._input_charset,
        notify_url: this.params.notify_url,
        partner: this.params.partner,
        return_url: this.params.return_url,
        seller_email: this.params.seller_email
    };
    util.assignArray(json, orderParams);
    //加入签名结果与签名方式
    json.sign = this.buildRequestMysign(json);
    json.sign_type = this.sign_type;

    return [
        gatewayUrl,
        querystring.stringify(json)
    ].join('');
}

alipay.prototype.buildRequestMysign = function(json) {
    let sign = '';

    switch (this.sign_type) {
        case 'MD5':
            var md5key = this.params.key;
            sign = util.buildSign(json, md5key);
            break;
        case 'RSA':
            sign = util.rsaSign(json, this.private_key);
            break;
    }

    return sign;
}

alipay.prototype.buildWapPayUrl = function(orderParams) {

    var mGatewayUrl = 'http://mapi.alipay.com/gateway.do?';

    var json = {
        service: 'alipay.wap.create.direct.pay.by.user', //alipay.wap.trade.create.direct
        payment_type: '1',
        _input_charset: this._input_charset,
        notify_url: this.params.notify_url,
        partner: this.params.partner,
        return_url: this.params.return_url,
        seller_id: this.params['seller_id']
    };

    util.assignArray(json, orderParams);

    //加入签名结果与签名方式
    json.sign = this.buildRequestMysign(json);

    json.sign_type = this.sign_type;

    var url = [
        mGatewayUrl,
        querystring.stringify(json)
    ].join('');

    return url;
}

alipay.prototype.notify = function(params, callback) {
    var sign_type = params['sign_type'];

    var result = false;

    switch (sign_type) {
        case 'MD5':
            var md5key = this.params.key;
            result = util.md5Verify(params, md5key);
            break;
        case 'RSA':
            var md5key = this.params.key;
            result = util.rsaVerify(params, this.public_key);
            break;
        default:
            var md5key = this.params.key;
            result = util.md5Verify(params, md5key);
            break;
    }

    if (result == false) {
        return callback(false);
    }

    var urlParams = {
        service: 'notify_verify',
        partner: this.params.partner,
        notify_id: params['notify_id']
    };

    var url = [
        this.https_verify_url,
        querystring.stringify(urlParams)
    ].join('');

    http.get(url, function(err, response) {
        if (err) {
            throw err;
        }

        callback(JSON.parse(response.body));
    });
}

module.exports = alipay;
