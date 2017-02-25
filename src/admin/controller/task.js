'use strict';

import Base from './base.js';

export default class extends Base {
    init(http) {
        super.init(http);
        this.tactive = "article";
    }

    async indexAction() {
      this.meta_title = '任务管理';  
      let data = await this.model('task').page(this.get('page'),20).order('id DESC').countSelect();
      let Pages = think.adapter("pages", "page"); //加载名为 dot 的 Template Adapter
      let pages = new Pages(this.http); //实例化 Adapter
      let page = pages.pages(data);

      for(let v of data.data){
        let doc = await this.model('document').where({id:v.document_id}).find();
        v.doc = doc;

        // 承接任务人数
        let accept_num = await this.model('task_link').where({task_id:v.id}).count();
        v.accept_num = accept_num;

        let complete_num = await this.model('task_link').where({task_id:v.id}).sum('completed_num');
        if (think.isEmpty(complete_num)){
          complete_num = 0;
        }
        v.complete_num = complete_num;

      }

      //console.log(data.data);
      this.assign('pagerData', page); //分页展示使用
      this.assign('list', data.data);
      
      //console.log(data.data);
      
      return this.display();
    }

  async addAction(){

    let id = this.param("id");

    let cate = await this.category("task");
    let cateIds =  await this.model('category').get_sub_category(cate.id);
    cateIds.push(cate.id);

    let map = {
      'pid':0,
      'category_id': {"in": cateIds},
    };

    let data = await this.model('document').where(map).select();
    //console.log(data);
    this.assign("list",data);

    if (!think.isEmpty(id)){
      let task = await this.model("task").where({id: this.param("id")}).find();
      this.assign("info", task);
      this.assign("title", "修改任务");
    }
    else{
      this.assign("title", "新增任务");
    }

    return this.display();
  }

  async setstatusAction(){
    console.log(this.param("status"), this.param("ids"));

    let data = await this.model("task").where({id:["IN",this.param('ids')]}).select();
    //console.log(data);
    if(this.param('status') == -1){
        for (let v of data){
            //删除
            await this.model('task').where({id:v.id}).delete();
        }
    }else{
        for (let v of data){
            //添加到搜索
            await this.model("task").where({id:v.id}).update({status:this.param('status')});
        }
    }


    // status -1 删除, 

    return this.json({errno:0, data:{name:"修改成功"}});
  }

  async updateAction() {
    console.log(this.param("reward"), this.param("area_id"), this.param("ids"), this.param("id"));
    
    // 新增
    if (think.isEmpty(this.param("id"))){
      let doc = await this.model("task").where({document_id: this.param("ids")}).find();
      if (think.isEmpty(doc)){
          await this.model("task").add({user_id:this.user.id, document_id: this.param("ids"), reward: this.param("reward"), create_time:new Date().getTime(), update_time:new Date().getTime()});
      }
    }
    else{// 更新
      let doc = await this.model("task").where({document_id: this.param("ids"), id:{"!=": this.param("id")}}).find();
      if (think.isEmpty(doc)){
          await this.model("task").where({id:this.param("id")})
            .update({user_id:this.user.id, document_id: this.param("ids"), 
            reward: this.param("reward"), update_time:new Date().getTime()});
      }
    }

    return this.redirect("/admin/task");
  }

  async linkAction(){
    let task_id   = this.param("task");

    let data = await this.model("task_link").where({task_id:task_id}).page(this.get('page'), 20).order('id DESC').countSelect();
    let Pages = think.adapter("pages", "page"); //加载名为 dot 的 Template Adapter
    let pages = new Pages(this.http); //实例化 Adapter
    let page = pages.pages(data);

    this.assign('pagerData', page); //分页展示使用
    this.assign('list', data.data);

    return this.display();
  }

  async statAction() {
    
      this.meta_title = '任务管理';
      this.assign({
            "navxs": true,
      });

      let map = {'status': ['>', -1]}
        if(!think.isEmpty(this.get("username"))){
            map.username= ["like", "%"+this.get("username")+"%"]
        }
      
      let data = await this.model('task_record').page(this.get('page'),20).order('id DESC').countSelect();
      let Pages = think.adapter("pages", "page"); //加载名为 dot 的 Template Adapter
      let pages = new Pages(this.http); //实例化 Adapter
      let page = pages.pages(data);

      for(let v of data.data){
        //console.log(await this.model("member_group").getgroup({groupid:v.groupid}));
        let wx_user = await this.model("wx_user").where({id:v.user_id}).find();
        if (!think.isEmpty(wx_user)){
          v.headimgurl = wx_user.headimgurl;
          v.nickname = wx_user.nickname;
          v.province = wx_user.province;
          v.country = wx_user.country;
          v.city = wx_user.city;
        }

        v.wx_user = wx_user;
      }
    

    //console.log(data.data);

    this.assign('pagerData', page); //分页展示使用
    this.assign('list', data.data);
      

      return this.display();
    }

}