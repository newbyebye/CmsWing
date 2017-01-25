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
    console.log(this.param("up"), this.param("down"), this.param("title"));

    let img = await gen_chunlian(this.param("up"), this.param("down"), this.param("title"));

    let info = {"up": this.param("up"), "down": this.param("down"), "title": this.param("title"), "img":img};
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
