'use strict';

import Base from '../../common/controller/base.js';

export default class extends Base {
  async showAction(){
    let p = this.param("p");
    await this.action("uc/weixin", "_oauth");

    await this.weblogin();
    console.log(this.user);
    
    this.assign('id', p);
    let taskLink = await this.model('task_link').where({id:p}).find();
    if (think.isEmpty(taskLink)){
      this.http.error = new Error('链接不存在！');
      return think.statusAction(404, this.http);
    }

    this.model('task_link').where({id:p}).increment("view_num", 1);

    let user = await this.model('wx_user').where({uid: taskLink.user_id}).find();
    this.assign('user', user);

    let doc = await this.model('document').where({id: taskLink.document_id}).find();
    let content = await this.model('document_article').where({id: taskLink.document_id}).find();

    doc.content = content.content.split("_ueditor_page_break_tag_");


    this.assign('info', doc); 

    return this._display();
  }

  async adhitsAction(){
    await this.weblogin();
    console.log(this.user, this.http.ip());

    let taskLink = await this.model('task_link').where({id:this.param("id")}).find();
    if (think.isEmpty(taskLink)){
      return this.json({"errno":404,"errmsg":"error"});
    }
    
    let result = await this.model("task_record").thenAdd({task_link_id: this.param("id"), user_id: this.user.uid, action_ip:_ip2int(this.http.ip()), create_time: new Date().getTime()}, {task_link_id: this.param("id"), user_id: this.user.uid});
    if (result.type == "add"){
      this.model('task_link').where({id:this.param("id")}).increment("redirect_num", 1);
    }

    return this.json({});
  }
}