'use strict';
import moment from "moment"
moment.locale('zh-cn');
import Base from './base.js';
import pagination from 'think-pagination';
export default class extends Base {
  /**
   * 账户金额管理
   * @returns {PreventPromise}
   */
  async indexAction() {
    //判断是否登陆
    await this.weblogin();
    let type = this.get("type") || null;
    let data;
    if (think.isEmpty(type)) {
      data = await this.model("balance_log").where({user_id: this.user.uid}).page(this.param('page')).order("time DESC").countSelect();
    } else if (type == 1) {
      data = await this.model("balance_log").where({user_id: 10000}).page(this.param('page')).order("time DESC").countSelect();
    } else {
      data = await this.model("order").where({
        user_id: this.user.uid,
        type: 1,
        is_del: 0
      }).page(this.get('page')).order("create_time DESC").countSelect();
      for (let val of data.data) {

        val.channel = await this.model("pingxx").where({id: val.payment}).getField("title", true);
      }
    }

    let html = pagination(data, this.http, {
      desc: false, //show description
      pageNum: 2,
      url: '', //page url, when not set, it will auto generated
      class: 'nomargin', //pagenation extra class
      text: {
        next: '下一页',
        prev: '上一页',
        total: 'count: ${count} , pages: ${pages}'
      }
    });
    //think.log(data);
    this.assign('pagination', html);
    this.assign("list", data.data);
    this.assign("type", type);
    this.assign("count",data.count)
    //获取用户信息
    let userInfo = await this.model("member").find(this.user.uid);
    this.assign("userInfo", userInfo);
    //未付款的充值订单统计
    let unpaid = await this.model("order").where({
      user_id: this.user.uid,
      type: 1,
      is_del: 0,
      pay_status: 0
    }).count("id");
    this.assign("unpaid", unpaid);
    this.meta_title = "账户金额管理";
    //判断浏览客户端
    if (checkMobile(this.userAgent())) {

      if(this.isAjax("get")){
        for(let v of data.data){
          v.time =moment(v.create_time).format('YYYY-MM-DD HH:mm:ss');
          v.amount = formatCurrency(v.amount);
          v.amount_log = formatCurrency(v.amount_log);
        }
        return this.json(data);
      }else {
        this.active = "user/index";
        return this.display(`mobile/${this.http.controller}/${this.http.action}`)
      }

    } else {
      return this.display();
    }
  }

  /**
   * 充值
   */
  async rechargeAction() {
    //判断是否登陆
    await this.weblogin();
    if (this.isAjax("POST")) {
      let data = this.post();
      if (think.isEmpty(data.order_amount)) {
        return this.fail("请输入金额！");
      } else if (!think.isNumberString(data.order_amount)) {
        return this.fail("金额类型错误！")
      }
      let amount = parseInt(data.order_amount);
      if (amount > 300 || amount < 20){
        return this.fail("金额类型错误！");
      }
      
      data.order_amount = amount;

      //用户
      data.user_id = this.user.uid;
      //生成订单编号//todo
      let nowtime = new Date().valueOf();
      let oid = ["c", this.user.uid, nowtime]
      data.order_no = oid.join("");
      //支付状态 pay_stayus 0:未付款 ,1:已付款
      data.pay_status = 0;
      //订单状态 status 2:等待审核，3:已审核
      data.status = 2;
      //发货状态 type 0:普通，1:充值
      data.type = 1;
      //订单创建时间 create_time
      data.create_time = new Date().valueOf();
      //生成订单

      let payment = think.service("payment");
      let pay = new payment(this.http);
      /*
        appId: 'wxa941b7ebde89ee07',
        timeStamp: '1488631942',
        nonceStr: 'JpVJEp5GSzEmu628OsXi6CCmcCMsvvNU',
        package: 'prepay_id=wx20170304205222f512d2b5c90649581354',
        signType: 'MD5',
        paySign: '3D77A141861937D850968ED9BE7BCDE9',
        timestamp: '1488631942'
      */

      let charges = await pay.getPayParams(data.order_no, data.order_amount, "微合宝-广告营销专家-充值", this.openid);
      console.log("pay.unifiedOrder ret:", charges);
      if (charges) {
        let order_id = await this.model("order").add(data);
        // 前端查询订单状态
        charges.orderId = order_id;
        //支付日志
        let receiving = {
          order_id: order_id,
          user_id: this.user.uid,
          amount: data.order_amount,
          create_time: new Date().getTime(),
          payment_time: new Date().getTime(),
          doc_type: 1,
          pay_status: 0
        }
        await this.model("doc_receiving").add(receiving);
        return this.success({name: "支付订单对接成功，正在转跳！", data: charges})
      } else {
        return this.fail("调用接口失败！");
      }
      // think.log(data);
    } else {
      //ping++ 支付渠道 pc网页
      //根据不同的客户端调用不同的支付方式
      let map;
      if (checkMobile(this.userAgent())) {
        map={
          type:2,
          status:1
        }
        if(!is_weixin(this.userAgent())){
          map.channel =["!=","wx_pub"]
        }

      }else {
        map={
          type:1,
          status:1
        }
      }
      //let paylist = await this.model("pingxx").where(map).order("sort ASC").select();
      //this.assign("paylist", paylist);
      /*
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<xml>\n 
       <out_trade_no>00001</out_trade_no>\n 
        <total_fee>100</total_fee>\n  
       <body>微合宝-广告营销专家</body>\n  
       <openid>oHkF3v0OyT1Bs9Z8T9H0l0jZiHjA</openid>\n  
       <appid>wxa941b7ebde89ee07</appid>\n  
       <mch_id>1440578102</mch_id>\n  
       <nonce_str>UaXKjkDda2sbiNn3Hog8ymxFAEVhX5aE</nonce_str>\n  
       <notify_url>http://ad.weishitianli.com/uc/wechat/pay</notify_url>\n  
       <spbill_create_ip>127.0.0.1</spbill_create_ip>\n  <trade_type>JSAPI</trade_type>\n  
       <sign>C901C878E4533D0B40A934EF24A680FF</sign>\n</xml>
      */
      /*
      let payment = think.service("payment");
      let pay = await new payment(this.http);
      let ret = await pay.unifiedOrder("00001", 100, "微合宝-广告营销专家", this.openid);
      */

      //think.log(ret);

      this.meta_title = "充值";
      if (checkMobile(this.userAgent())) {
        this.active = "user/index";
        return this.display(`mobile/${this.http.controller}/${this.http.action}`)
      } else {

        this.display();
      }

    }
  }

  /**
   * 提现
   */
  async withdrawAction() {
    await this.weblogin();
    if (this.isAjax("POST")) {
      let data = this.post();
      if (think.isEmpty(data.order_amount)) {
        return this.fail("请输入金额！");
      } else if (!think.isNumberString(data.order_amount)) {
        return this.fail("金额类型错误！")
      }

      let amount = parseInt(data.order_amount);
      if (amount%100 !=0 || amount <100){
        return this.fail("金额错误！");
      }

      let user = await this.model('member').field("amount").where({id:this.user.uid}).find();
      if (user.amount < amount*100){
        return this.fail("金额不足！");
      }

      let model = this.model('withdraw');
      try{
        await model.startTrans();

        // 金币1个对应1分
        await this.model('member').where({id:this.user.uid}).decrement('amount', amount*100);
        await model.add({user_id:this.user.uid, time:new Date().getTime(), coins:amount*100, amount:amount});

        await model.commit();
      }catch(e){
        console.log(e);
        await model.rollback();
        return this.fail(e);
      }

      return this.success({name:"提现申请已提交,3个工作日到账", url:"/uc/account"});
    }
    else{
      this.meta_title = "提现";
      let userInfo = await this.model("member").find(this.user.uid);
      this.assign("coins", userInfo.amount);
      this.assign("amount", (userInfo.amount - (userInfo.amount%10000))/10000);
      this.display();
    }
  }
}