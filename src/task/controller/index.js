'use strict';

import Base from '../../common/controller/base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction(){
    let type = parseInt(this.param("type")) || 1;
    this.assign('type', type);  
    
    // type=1 体验类任务
    if (type == 1){
        let tasks = await this.model('task').where({status:2, type:1}).page(this.param('page'),10).countSelect();
        for(let v of tasks.data){
          let doc = await this.model('document').where({id:v.document_id}).find();
          v.doc = doc;
        }
        //console.log(data);
        this.assign("list",tasks);
    }
    
    //auto render template file index_index.html
    return this._display();
  }

  async addAction(){
    return this._display();
  }

  async showAction(){    
    // 判断是否登陆
    await this.weblogin();
    // 任务ID
    let id = this.param("id");
    // 查询用户是否已经承接任务，如果未承接则新增
    let taskLink = await this.model('task_link').where({user_id: this.user.uid, task_id: id}).find();
    let link_id ='';
    if (think.isEmpty(taskLink)){
      link_id = await this.model('task_link').add({user_id: this.user.uid, task_id: id, create_time:new Date().getTime()});
    }
    else{
      link_id = taskLink.id;
    }

    return this.redirect('/task/detail/show/p/'+link_id+'.html');
  }
}