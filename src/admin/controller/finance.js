// +----------------------------------------------------------------------
// | CmsWing [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.cmswing.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <arterli@qq.com>
// +----------------------------------------------------------------------
'use strict';

import Base from './base.js';

export default class extends Base {
  init(http){
    super.init(http);
    this.tactive = "finance";
  }
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    //auto render template file index_index.html
    return this.display();
  }

  /**
   * 财务日志
   */
  async logAction(){
    let list = await this.model("balance_log").order("id DESC").page(this.get('page')).countSelect();
    //console.log(list);
    let _pages = think.adapter("pages","page");
    let pages = new _pages(this.http);
    let page = pages.pages(list);
    this.assign("pagerData",page);
    for(let itme of list.data){
      itme.user_id = await this.model("member").get_nickname(itme.user_id);
      itme.admin_id = get_nickname(itme.admin_id);
    }
    this.assign("list",list.data);
    this.meta_title = "财务日志";
    this.display();
  }

  async withdrawAction(){
    let list = await this.model("withdraw").where({status: ["IN", "0,1"]}).order("id DESC").page(this.get('page')).countSelect();
    //console.log(list);
    let _pages = think.adapter("pages","page");
    let pages = new _pages(this.http);
    let page = pages.pages(list);
    this.assign("pagerData",page);
    for(let itme of list.data){
      itme.username = await this.model("member").get_nickname(itme.user_id);
      itme.adminname = get_nickname(itme.admin_id);
    }
    this.assign("list",list.data);
    this.meta_title = "提现申请";
    this.display();
  }

  async statusAction(){
    console.log(this.param("status"), "ids:",this.param("ids"));

    let data = await this.model("withdraw").where({id:["IN",this.param('ids')]}).select();
    if(this.param('status') == -1){
        for (let v of data){
            //删除
            await this.model('withdraw').where({id:v.id}).update({status:-1});
        }
    }else{
        for (let v of data){
            //添加到搜索
            if (v.status == 0){
              // 待审核提现
              let payment = think.service("payment");
              let pay = new payment(this.http);
              let wx = await this.model("wx_user").field("openid").where({uid:v.user_id}).find();
              let nowtime = new Date().valueOf();
              let oid = ["t", v.user_id, nowtime];
              let ret = await pay.transfers(oid.join(""), v.amount, "微合宝-广告营销专家-提现", wx.openid);
              if (ret.return_code == "SUCCESS"){
                  // 提现成功修改状态
                  await this.model("withdraw").where({id:v.id}).update({status:1});
              }

            }
        }
    }

    return this.json({errno:0, data:{name:"修改成功"}});
  }

}