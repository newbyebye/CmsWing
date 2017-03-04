// +----------------------------------------------------------------------
// | CmsWing [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.cmswing.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <arterli@qq.com>
// +----------------------------------------------------------------------
'use strict';
import API from 'wechat-api';
export default class extends think.controller.base {
    init(http) {
        super.init(http);

    }
    async __before() {
        //网站配置
        this.setup = await this.model("setup").getset();
        this.api = new API(this.setup.wx_AppID, this.setup.wx_AppSecret);
    }
    /**
     * 微信服务器验证
     * index action
     * @return {Promise} []
     */
    indexAction(){
        let echostr = this.get('echostr');
        return this.end(echostr);
    }
    reply(message){
        this.http.res.reply(message);
    }

    //关键词消息回复
    async textAction(){
        //console.log(this.http);
        let message = this.post();
       // console.log(message);
        let key = message.Content.trim();
        let kmodel = this.model('wx_keywords');
        let isKey = await kmodel.field('rule_id').where({keyword_name: key}).find();
        if(!think.isEmpty(isKey)){
            //是关键字
            let rulemodel = this.model('wx_keywords_rule');
            let replyliststr = await rulemodel.where({id: isKey.rule_id}).getField('reply_id', true);
            let replylisttmp = replyliststr.split(',');
            let replylist = [];
            for(let i in replylisttmp){
                if(replylisttmp[i] != ''){
                    replylist.push(replylisttmp[i]);
                }
            }
            if(!think.isEmpty(replylist)){
                let  randomi = parseInt(Math.random()*replylist.length);
                let replymodel = this.model('wx_replylist');
                let data = await replymodel.where({id: replylist[randomi]}).getField('content', true);
                return this.reply(data);
            }
        }
        //普通消息回复
        let replymodel = this.model('wx_replylist');
        let datas = await replymodel.where({reply_type: 2}).order("create_time DESC").select();
        let data = datas[0];
        let content;
        switch (data.type){
            case "text":
               content = data.content;
            break;
            case "news":
                content = JSON.parse(data.content);
                break;
        }
        this.reply(content);
    }

    /*
    { appid: 'wxa941b7ebde89ee07',
      bank_type: 'BOC_CREDIT',
      cash_fee: '20',
      fee_type: 'CNY',
      is_subscribe: 'Y',
      mch_id: '1440578102',
      nonce_str: 'PLHrkqC4OhkO5Oacs7sYdV9mwRu6XPdw',
      openid: 'oHkF3v0OyT1Bs9Z8T9H0l0jZiHjA',
      out_trade_no: 'c991488626824867',
      result_code: 'SUCCESS',
      return_code: 'SUCCESS',
      sign: '9B6CF7A4DF8592BAA01666E2E0AF9325',
      time_end: '20170304192719',
      total_fee: '20',
      trade_type: 'JSAPI',
      transaction_id: '4007402001201703042227033753' }
  */
    async payAction(){
      console.log("payAction:", this.http._wxpay);
      let wxpay = this.http._wxpay;
      let model = this.model('order');

      if (think.isEmpty(wxpay)){
        return this.end("<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[参数错误]]></return_msg></xml>");
      }
      let order = await model.where({order_no:wxpay.out_trade_no, pay_status:0}).find();
      if (think.isEmpty(order)){
        return this.end("<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[参数错误]]></return_msg></xml>");
      }

      //发货状态 type 0:普通，1:充值     
      try{
        await model.startTrans();
        // 更新充值金额 和 付款状态
        let fee = parseInt(wxpay.total_fee);
        if (isNaN(fee)){
          fee = 0;
        }
        if (order.type == 1){
          await model.where({id:order.id}).update({order_amount:fee, pay_status:1});
        }
        await this.model('member').where({id:order.user_id}).increment('amount', fee);
        await this.model("doc_receiving").where({order_id: order.id}).update({amount:fee, pay_status:1});

        await model.commit();
      }catch(e){
        await model.rollback();
      }

      return this.end("<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>");
    }

    //事件关注
 async eventAction(){
    let message = this.post();
      switch (message.Event){

          case "subscribe":  //首次关注
              console.log(message);
              let openid = message.FromUserName;
              let key = message.EventKey;
              console.log(message);
              if (key.startsWith("qrscene_")){
                // 新加入用户
                let wid = parseInt(key.substr("qrscene_".length));
                await this.model("wx_user_relation").thenAdd({"openid":openid, "upwid":wid}, {"openid":openid});
              }

              let datas = await this.model("wx_replylist").where({reply_type:1}).order("create_time DESC").select();
              let data = datas[0];
              let content;
              switch (data.type){
                  case "text":
                      content = data.content;
                      break;
                  case "news":
                      content = JSON.parse(data.content);
                      break;
              }
              this.reply(content);
              break;
          case "unsubscribe"://取消关注
              //todo
              break;
          case "CLICK"://click事件坚挺
              let res = await this.model("wx_material").find(message.EventKey);
              let news_item = JSON.parse(res.material_wx_content);
              let list = news_item.news_item;
              for(let v of list){
                  v.picurl = v.thumb_url;
              }
              this.reply(list);
              //todo
              break;
          case "SCAN"://扫码事件监听
              
              
              console.log(message);
              break;
          default:
              console.log(message);
              break;
      }
    // this.reply(JSON.stringify(message));
  }
  __call(){
    this.reply(DEFULT_AUTO_REPLY);
  }


   /**
     * 获取用户分组
     */
    groupsAction(){
        let self = this;
        api.getGroups((err,result)=>{
            if(!think.isEmpty(result)){
                //think.log(result['groups'],"test");
                for(let val of result['groups']){
                    think.log(val['name'],"test");
                };
                self.end(result);
            }else{
                console.error('err'+err);
            }

        });
    }
   
    /**
     * 创建用户分组
     */
    creategroupAction(){
        //let api = new API('wxec8fffd0880eefbe', 'a084f19ebb6cc5dddd2988106e739a07');
        let self = this;
        api.createGroup('旅游',(err,result)=>{
            if(!think.isEmpty(result)){
                think.log(result,"test");
                self.end(result);
            }else{
                console.error('err'+err);
            }

        });
    }

   
    /**
     * 获取永久素材列表
     */
    getmaterialsAction(){
        //let api = new API('wxe8c1b5ac7db990b6', 'ebcd685e93715b3470444cf6b7e763e6');
        let self = this;
        api.getMaterials('image',0,10,(err,result)=>{
            if(!think.isEmpty(result)){
                think.log(result,"test");
                self.end(result);
            }else{
                console.error('err'+err);
            }

        });
    }

   
        
    /**
     * 获取关注者列表
     */
    async getusersAction(){
        //let api = new API('wxec8fffd0880eefbe', 'a084f19ebb6cc5dddd2988106e739a07');
        //let api = new API('wxe8c1b5ac7db990b6', 'ebcd685e93715b3470444cf6b7e763e6');
        let self = this;
        api.getFollowers((err,result)=>{
            if(!think.isEmpty(result)){
                
                think.log(result,"getuser");
                self.end(result['data']);
            }else{
                Console.error('err'+err)
            } 
        });
    }
    /**
     * 获取用户基本信息
     */
    async getuserinfoAction(){
        //let api = new API('wxec8fffd0880eefbe', 'a084f19ebb6cc5dddd2988106e739a07');
        let self = this;
        api.getUser({openid: 'oVe9Ew0zHFp0up1CeNcK2J5RL4xs', lang: 'zh_CN'},(err,result)=>{
            if(!think.isEmpty(result)){
                think.log(result,"getuser");
                self.end(result);
            }else{
                Console.error('err'+err)
            } 
        });
    }
    
    /**
     * 批量获取用户基本信息
     */
    async getusersinfoAction(){
        //let api = new API('wxec8fffd0880eefbe', 'a084f19ebb6cc5dddd2988106e739a07');
        let self = this;
        api.batchGetUsers(['oVe9Ew0zHFp0up1CeNcK2J5RL4xs','oVe9Ewyd7Lw1bKPTtBvCSbB13DtU'],(err,result)=>{
            if(!think.isEmpty(result)){
                think.log(result,"getuser");
                self.end(result);
            }else{
                Console.error('err'+err)
            } 
        });       
    }
    
    /**
     * 
     */
  
}