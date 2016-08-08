'use strict';

var alipay=require('./lib/alipay');

var notify=require('./lib/notify');

exports=function(config){
	return new alipay(config);
}