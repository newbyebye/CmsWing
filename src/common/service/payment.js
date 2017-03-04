// +----------------------------------------------------------------------
// | CmsWing [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.cmswing.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <arterli@qq.com>
// +----------------------------------------------------------------------
'use strict';
var tenpay = require('tenpay');

export default class extends think.service.base {

    /**
     * init
     * @return {}         []
     */
    init(http){
        super.init(http);
    }

    async __before() {
        //网站配置
        this.setup = await this.model("setup").getset();
        this.api  = new tenpay({
                        appid: this.setup.wx_AppID,
                        mchid: '1440578102',
                        partnerKey: '94d11835159632b8977affe73c847100',
                        pfx: require('fs').readFileSync(think.RESOURCE_PATH + '/apiclient_cert.p12'),
                        notify_url: 'http://ad.weishitianli.com/uc/wechat/pay',
                        //spbill_create_ip: 'IP地址'
                    });
    }

    async unifiedOrder(order_no, order_amount, order_discription, openid){
        if (think.isEmpty(this.api)){
            await this.__before();
        }

        return await this.api.unifiedOrder({out_trade_no:order_no, total_fee: order_amount, body: order_discription, openid:openid});
    }

//发起付款
    async pingxx(channel, order_no, order_amount, ip,open_id) {
        let http_=think.config("http_")==1?"http":"https";
        let config;
        let extra = {};
        let amount = Number(order_amount) * 100;
        let setup = await think.cache("setup")
        let pingpp = require('pingpp')(setup.PINGXX_LIVE_SECRET_KEY);
        pingpp.setPrivateKeyPath(think.RESOURCE_PATH + "/upload/pingpp/cmswing_rsa_private_key.pem");
        switch (channel) {
            case 'alipay_pc_direct':
                //支付宝网页支付
                extra = {
                    success_url: `${http_}://${this.http.host}/uc/pay/payres`
                }

                break;
            case 'wx_pub_qr':
                //微信网pc页扫码支付
                extra = {
                    limit_pay: null, product_id: order_no
                }

                break;
            case 'alipay_qr':
                //支付宝PC网页扫码支付
                break;
            case 'upacp_pc':
                //网银pc网页支付
                extra = {
                    result_url: `${http_}://${this.http.host}/uc/pay/payres`
                }
                break;
            case 'upacp_wap':
                //网银pc网页支付
                extra = {
                    result_url: `${http_}://${this.http.host}/uc/pay/payres`
                }
                break;
            case 'alipay_wap':
                //支付宝网页支付
                extra = {
                    success_url: `${http_}://${this.http.host}/uc/pay/payres`
                }

                break;
            case 'bfb_wap':
                //支付宝网页支付
                extra = {
                    result_url: `${http_}://${this.http.host}/uc/pay/payres`,
                    bfb_login:false
                }

                break;
                case 'wx_pub':
                // 微信公共账号支付
                extra ={
                    open_id:open_id
                }
                break;
        }
        config = {
            subject: "网站订单支付",
            body: "网站订单支付",
            amount: amount,
            order_no: order_no,
            channel: channel,
            currency: "cny",
            client_ip: ip,
            app: {id: setup.PINGXX_APP_ID},
            extra: extra
        }
        console.log(config);
        function create(pingpp, config) {
            let deferred = think.defer();
            pingpp.charges.create(config, function (err, charge) {
                console.log(err);
                deferred.resolve(charge);
            });
            return deferred.promise;
        }

        return await create(pingpp, config);
    }


    async charge(id) {
        let setup = await think.cache("setup")
        let pingpp = require('pingpp')(setup.PINGXX_LIVE_SECRET_KEY);
        pingpp.setPrivateKeyPath(think.RESOURCE_PATH + "/upload/pingpp/cmswing_rsa_private_key.pem");
        function retrieve(pingpp, id) {
            let deferred = think.defer();
            pingpp.charges.retrieve(id, function (err, charge) {
                    console.log(err);
                    deferred.resolve(charge);
                }
            );
            return deferred.promise;
        }

        let res = await retrieve(pingpp, id);
        //console.log(res);
        return res;
    }
}