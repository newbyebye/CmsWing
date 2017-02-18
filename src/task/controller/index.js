'use strict';

import Base from '../../common/controller/base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    //auto render template file index_index.html
    return this._display();
  }
}