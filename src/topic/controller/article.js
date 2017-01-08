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
    let map = {
      'pid':0,
      'status': 1,
      'category_id': {"in": cateIds},
    };
    //排序
    let o = {};
    //let order =this.get('order')||100;
    //console.log(order);
    order = Number(order);
    switch (order){
      case 1:
        o.update_time = 'ASC';
        break;
      case 2:
        o.view = 'DESC';
        break;
      case 3:
        o.view = 'ASC';
        break;
      default:
        o.update_time = 'DESC';
    }

    this.assign('order',order);   
    let data = await this.model('document').where(map).page(this.param('page'),10).order(o).countSelect();
    this.assign("list",data);
    //console.log(data);
    if(this.isAjax("get")){
      for(let v of data.data){
        if(!think.isEmpty(v.pics)){
          let arr = []
          for (let i of v.pics.split(",")){
            arr.push(await get_pic(i,1,300,169))
          }
          v.pics = arr;
        }
        if(!think.isEmpty(v.cover_id)){
          v.cover_id = await get_pic(v.cover_id,1,300,169);
        }
        if(!think.isEmpty(v.price)){
          if(!think.isEmpty(get_price_format(v.price,2))){
            v.price2 = get_price_format(v.price,2);
          }
          v.price = get_price_format(v.price,1);

        }
        v.uid = await get_nickname(v.uid);
        v.url = get_url(v.name,v.id);
        v.update_time = moment(v.update_time).fromNow()
      }
      return this.json(data);
    }

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
