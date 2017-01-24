// +----------------------------------------------------------------------
// | CmsWing [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.cmswing.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: Arterli <arterli@qq.com>
// +----------------------------------------------------------------------
'use strict';
import moment from "moment"
moment.locale('zh-cn');
import Base from './base.js';
export default class extends Base {
  init(http){
    super.init(http);
  }
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction(){
    let get = this.get('category') || 0;
    let id=0;
    let order = 0;
    if(get != 0){
      id = get.split("-")[0];
      order = get.split("-")[1];
    }
    let cate = await this.category(id);
    cate = think.extend({}, cate);
    this.assign('category', cate);

    this.meta_title = cate.meta_title ? cate.meta_title : cate.title; //标题
    this.keywords = cate.keywords ? cate.keywords : ''; //seo关键词
    this.description = cate.description ? cate.description : ""; //seo描述

    //auto render template file index_index.html
    //debugger;
    let cateIds =  await this.model('category').get_sub_category(cate.id);
    cateIds.push(cate.id);
    //跨域
    let method = this.http.method.toLowerCase();
    if(method === "options"){
      this.setCorsHeader();
      this.end();
      return;
    }
    this.setCorsHeader();
    

    //判断浏览客户端
    if(checkMobile(this.userAgent())){
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    }else{
      //debugger;
      //console.log(think.datetime(new Date(), "YYYY-MM-DD"));
      return this.display();
    }
  }

  async genAction(){
    console.log(this.param("name"), this.param("msg"));

    var token = require('crypto').randomBytes(32).toString('hex')+".png";

    var gm = require('gm');
    var imageMagick = gm.subClass({ imageMagick: true });
    let img = imageMagick(560, 960, 'red');
    await img.font(think.RESOURCE_PATH+"/static/chunlian/msyh.ttf").fontSize(60)
      .fill('yellow')
      .drawText(50, 250, "丹")
      .drawText(50, 320, "凤")
      .drawText(50, 390, "来")
      .drawText(50, 460, "仪")
      .drawText(50, 530, "春")
      .drawText(50, 600, "回")
      .drawText(50, 670, "大")
      .drawText(50, 740, "地")
      .drawText(440, 250, "金")
      .drawText(440, 320, "鸡")
      .drawText(440, 390, "报")
      .drawText(440, 460, "晓")
      .drawText(440, 530, "福")
      .drawText(440, 600, "满")
      .drawText(440, 670, "人")
      .drawText(440, 740, "间")
      .draw('image over 205,800,150,150 "'+think.RESOURCE_PATH+"/static/qt.png"+'"')
      .write(think.RESOURCE_PATH+"/static/chunlian/" + token, function(err){
        if (err) {console.log(err);}
        else{
            console.log(think.RESOURCE_PATH+"/static/chunlian/" + token);
        }
      });

    let info = {"name": this.param("name"), "msg": this.param("msg"), "img": "/static/chunlian/" + token};
    this.assign("info", info);

    //判断浏览客户端
    if(checkMobile(this.userAgent())){
      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    }else{
      //debugger;
      //console.log(think.datetime(new Date(), "YYYY-MM-DD"));
      return this.display();
    }
  }
  
}
