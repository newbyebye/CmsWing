'use strict';

import Base from '../../common/controller/base.js';

export default class extends Base {
  async showAction(){
    let p = this.param("p");
    await this.action("uc/weixin", "oauth");
    //await this.weblogin();
    
    this.assign('id', p);
    let taskLink = await this.model('task_link').where({id:p}).find();
    if (think.isEmpty(taskLink)){
      this.http.error = new Error('链接不存在！');
      return think.statusAction(404, this.http);
    }

    this.model('task_link').where({id:p}).increment("view_num", 1);

    let user = await this.model('wx_user').where({uid: taskLink.user_id}).find();
    this.assign('user', user);

    let task = await this.model('task').where({id: taskLink.task_id}).find();
    this.assign('task', task);

    let doc = await this.model('document').where({id: task.document_id}).find();
    let content = await this.model('document_article').where({id: task.document_id}).find();

    doc.content = content.content.split("_ueditor_page_break_tag_");

    this.assign('info', doc); 

    return this._display();
  }

  async adhitsAction(){
    await this.action("uc/weixin", "oauth");
    //await this.weblogin();
    console.log(this.param("id"), this.param("remark"));

    let taskLink = await this.model('task_link').where({id:this.param("id")}).find();
    if (think.isEmpty(taskLink)){
      return this.fail(404, "error");
    }

    let linkids = [];
    let ids = await this.model('task_link').field("id").where({task_id:taskLink.task_id}).select();
    for (let id of ids){
      if (id.id != this.param("id")){
        linkids.push(id.id);
      }
    }

    let wid = this.user.wid;
    if (think.isEmpty(wid)){
      let user = await this.model('wx_user').where({uid: this.user.uid}).find();
      if (!think.isEmpty(user)){
        wid = user.id;
      }
    }
    if (think.isEmpty(wid)){
      return this.fail(404, "error");
    }

    let data = await this.model("task_link").where({id:["IN", linkids], user_id: wid}).find();
    if (!think.isEmpty(data)){
      return this.fail(501, "只能做一次任务");
    }

    let record = await this.model("task_record").where({task_link_id: this.param("id"), user_id: wid}).find();
    if (think.isEmpty(this.param("remark"))){
      let result = await this.model("task_record").add({task_link_id: this.param("id"), user_id: wid,
       action_ip:_ip2int(this.http.ip()), create_time: new Date().getTime()});
      if (result.type == "add"){
        this.model('task_link').where({id:this.param("id")}).increment("redirect_num", 1);
      }
    }
    else{
      if (think.isEmpty(record)){
        return this.fail(600, "请先完成任务");
      }

      await this.model("task_record").where({id:record.id}).update({remark:this.param("remark")});
    }

    return this.success({"name":"提交成功"});
  }

  

}