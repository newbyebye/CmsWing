'use strict';

import Base from './base.js';
import WechatAPI from 'wechat-api';
import nunjucks from 'nunjucks';
export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {
      
      let get_model_field = await getmodelfield(4,66,"total_stock")
      console.log(get_model_field);
      this.end(111);
    //return this.display();
  }
  weixinAction(){
      let self = this;
      var api = new WechatAPI("wxadce60f0c68b9b58", "41318d0bc30d292f278a720758d14833");
      api.getUser("on47Ms4t43aQfpsPAQHL5VC2iDaU", function(err,res){
         // self.assign('url',res.headimgurl);
          console.log(res.headimgurl);
      });
      
     this.assign('url',"http://wx.qlogo.cn/mmopen/CjI64f6iblexHK4xia2Sf5KepCRL3geeUZa5FalTA0lvIEf6pzfAMasrVJKYiaMDJB3cnVMcFMSIWFaNIwQKAw2XosEg6qtF7Mc/0");
     this.display();
      
  }
 
}
