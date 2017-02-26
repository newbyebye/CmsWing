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
      this.meta_title = '任务管理>修改任务';
      this.assign("title", "修改任务");
    }
    else{
      this.meta_title = '任务管理>新增任务';
      this.assign("title", "新增任务");
    }

    return this.display();
  }

  async setstatusAction(){
    let data = await this.model("task").where({id:["IN",this.param('ids')]}).select();
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
    this.meta_title = '任务承接任务'; 

    let task_id   = this.param("task");
    let task = await this.model("task").where({id:task_id}).find();
    task.doc = await this.model("document").where({id:task.document_id}).find();
    this.assign("task", task);

    let data = await this.model("task_link").where({task_id:task_id}).page(this.get('page'), 20).order('id DESC').countSelect();
    for(let v of data.data){
      let user = await this.model("wx_user").where({uid:v.user_id}).find();
      v.user = user;
    }

    console.log(data);

    let Pages = think.adapter("pages", "page"); //加载名为 dot 的 Template Adapter
    let pages = new Pages(this.http); //实例化 Adapter
    let page = pages.pages(data);

    this.assign('pagerData', page); //分页展示使用
    this.assign('list', data.data);

    return this.display();
  }

  async statAction() {
      let type = this.param("type");
      let data;
      let map = {};
      if (think.isEmpty(type)){// 审核任务
        this.meta_title = '任务管理>任务审核';
        map.status = 0;
        data = await this.model('task_record').where(map).page(this.get('page'),20).order('id DESC').countSelect();
      }
      else{//查看任务
        this.meta_title = '任务管理>任务完成情况';
        let linkId = this.param("id");
        if (!think.isEmpty(linkId)){
          map.task_link_id = linkId;

          let taskLink = await this.model('task_link').where({id:linkId}).find();
          if (!think.isEmpty(taskLink)){
            let task = await this.model('task').where({id:taskLink.task_id}).find();
            task.doc = await this.model('document').where({id:task.document_id}).find();
            this.assign("task", task);

            let user = await this.model("wx_user").where({uid:taskLink.user_id}).find();
            this.assign("user", user);
            this.assign("taskLink", taskLink);
          }
        }
        data = await this.model('task_record').where(map).page(this.get('page'),20).order('id DESC').countSelect();
      }
    
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

    this.assign('pagerData', page); //分页展示使用
    this.assign('list', data.data);
      
    return this.display();
  }

  async setstatAction(){
    let data = await this.model("task_record").where({id:["IN",this.param('ids')]}).select();
    for (let v of data){
        //修改状态
        await this.model("task_record").where({id:v.id}).update({status:this.param('status')});
        let record = await this.model("task_record").where({id:v.id}).find();
        let completed_num = await this.model("task_record").where({task_link_id:record.task_link_id, status:1}).count();
        let taskLink = await this.model('task_link').where({id:record.task_link_id}).find();
        
        // 更新积分，当前积分统一记录到任务承接人名下
        let old_completed = taskLink.completed_num;
        if (old_completed != completed_num){
          let task = await this.model('task').where({id:taskLink.task_id}).find();
          let score;
          if (old_completed > completed_num){
            // 减少用户积分
            score = (old_completed - completed_num)*task.reward;
            await this.model('member').where({id:taskLink.user_id}).decrement('amount', score);
          }
          else{
            // 增加用户积分
            score = (completed_num - old_completed)*task.reward;
            await this.model('member').where({id:taskLink.user_id}).increment('amount', score);
          }
          await this.model('task_link').where({id:record.task_link_id}).update({completed_num:completed_num});
        }   
    }

    return this.json({errno:0, data:{name:"修改成功"}});
  }

}