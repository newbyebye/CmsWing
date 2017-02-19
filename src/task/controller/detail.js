'use strict';

import Base from '../../common/controller/base.js';

export default class extends Base {
  async showAction(){
    let p = this.param("p");
    
    this.assign('id', p);
    let taskLink = await this.model('task_link').where({id:p}).find();
    if (think.isEmpty(taskLink)){
      this.http.error = new Error('链接不存在！');
      return think.statusAction(404, this.http);
    }

    let user = await this.model('wx_user').where({uid: taskLink.user_id}).find();
    this.assign('user', user);

    let doc = await this.model('document').where({id: taskLink.document_id}).find();
    let content = await this.model('document_article').where({id: taskLink.document_id}).find();

    doc.content = content.content.split("_ueditor_page_break_tag_");

    this.assign('info', doc); 

    return this._display();
  }

  async adhitsAction(){
    return this.json({});
  }
}