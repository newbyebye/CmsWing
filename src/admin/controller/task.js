'use strict';

import Base from './base.js';

export default class extends Base {
    init(http) {
        super.init(http);
        this.tactive = "article";
    }

    async indexAction() {
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

      console.log(data.data);

      this.assign('pagerData', page); //分页展示使用
      this.assign('list', data.data);
      

      return this.display();
    }
}