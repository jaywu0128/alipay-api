'use strict';

var alipay=require('./lib/alipay');

module.exports=function(config){
	return new alipay(config);
}