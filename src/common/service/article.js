'use strict';

export default class extends think.service.base {
  /**
   * init
   * @return {}         []
   */
  init(...args){
    super.init(...args);
  }

  /**
   * 新增文档
   */
  async addArticle(data){
      let res = await this.model('document').updates_robot(data);
  }
}