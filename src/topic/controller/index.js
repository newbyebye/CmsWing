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
    //auto render template file index_index.html
    this.meta_title = "首页";//标题1
    this.keywords = this.setup.WEB_SITE_KEYWORD ? this.setup.WEB_SITE_KEYWORD : '';//seo关键词
    this.description = this.setup.WEB_SITE_DESCRIPTION ? this.setup.WEB_SITE_DESCRIPTION : "";//seo描述
    //debugger;
    //判断浏览客户端
    if(checkMobile(this.userAgent())){
      //跨域
      let method = this.http.method.toLowerCase();
      if(method === "options"){
        this.setCorsHeader();
        this.end();
        return;
      }
      this.setCorsHeader();

      return this.display(`mobile/${this.http.controller}/${this.http.action}`)
    }else{
      //debugger;
      //console.log(think.datetime(new Date(), "YYYY-MM-DD"));
      return this.display();
    }

  }
  /**
   * 解析路由，判断是频道页面还是列表页面
   */
  async routeAction(){
    // this.end( this.get('category'));
    console.log("*************" + this.get('category'));
    let cate = await this.category(this.get('category').split("/")[0]);
    console.log("routeAction ******** ", cate);

    if (cate.name == "article"){
      await this.action("article", "index");
      return;
    }

    let a = "index";
    if (this.get('category').indexOf("/") != -1){
       a = this.get('category').split("/")[1];
    }
    console.log("&&&&&&&&&", a);
    if (cate.name == "chunlian"){
      await this.action("chunlian", a);
      return;
    }

    let type = cate.allow_publish;
    if(cate.mold == 2){
      type = 'sp'; // 单页面
    }

    switch (type){
      case 0:
        if(cate.mold==1){ // 独立模型
          await this.action("mod/index","index");
        }else {// 系统模型
          await this.action("cover","index");
        }
            break;
      case 1:
      case 2:
        if(cate.mold==1){
         // await this.action('question/list', 'index', 'mod')
          await this.action("mod/index","list");
        }else {
          await this.action("list","index");
        }
            break;
      case 'sp':
         await this.action("sp","index");
            break;
      default:
        this.end(111)
    }
    //this.end(cate.allow_publish)
    // 获取当前栏目的模型
    //let models = await this.model("category",{},'admin').get_category(cate.id, 'model');
  }
}
