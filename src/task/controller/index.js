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
    
    if (type == 1){
        let cate = await this.category("task");
        let cateIds =  await this.model('category').get_sub_category(cate.id);
        cateIds.push(cate.id);
        console.log(cateIds);

        let map = {
          'pid':0,
          'status': 1,
          'category_id': {"in": cateIds},
        };

        let data = await this.model('document').where(map).page(this.param('page'),10).countSelect();
        console.log(data);
        this.assign("list",data);
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
    // 任务文章ID
    let p = this.param("p");
    let taskLink = await this.model('task_link').where({user_id: this.user.uid, document_id: p}).find();
    let id = '';
    if (think.isEmpty(taskLink)){
      id = await this.model('task_link').add({user_id: this.user.uid, document_id: p, create_time:new Date().getTime()});
    }
    else{
      id = taskLink.id;
    }

    return this.redirect('/task/detail/show/p/'+id+'.html');
  }
}