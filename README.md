##支付宝支付1.0，包括PC端扫码支付以及移动网络支付
npm install alipay

var alipay = require('alipay');

alipay = new alipay({
    seller_email: 'xxxxxxxxxx',
    seller_id: 'xxxxxxxxxx',
    partner: 'xxxxxxxxxxxx',
    key: '合作伙伴key',
    private_key: '支付宝RAS密钥生成器生成的private_key',
    public_key: '从支付宝开发平台获取的publickey',
    return_url: '支付成功回调URL重定向url',
    notify_url: '支付成功回调URL',
    sign_type: 'RSA'.toUpperCase() //MD5或者RSA,建议MD5
});

var order = {
    out_trade_no: Date.parse(new Date()),
    subject: '测试',
    total_fee: 0.01,
    show_url: 'http://www.baidu.com'
};

//创建pc端支付链接
var url = alipay.buildPCPayURL(order);

//创建移动网络支付
var alipay.buildWapPayUrl(order);

//处理回调
alipay.notify(array, function(result) {

    if (result == true) {
        return '校验成功'
    }

    return '校验失败'
});

