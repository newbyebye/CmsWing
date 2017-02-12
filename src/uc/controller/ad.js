'use strict';

import Base from './base.js';
import * as fs from 'fs';
import * as path from 'path';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  //   用户设置
  async indexAction() {
    //判断是否登陆
    await this.weblogin();

    let data = await this.model('ad').where({user_id:this.user.uid}).select();
    for (let v of data){
      let pic = await this.model('picture').where({id: v.picture_id}).find();
      v.picture_url = pic.path;
    }
    this.assign("list",data);
    //console.log(data);
    
    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      this.active = "ad/index";
      return this.display(`mobile/${this.http.controller}/${this.http.action}`);
    } else {
      return this.display();
    }
  }

  async addAction() {
    //判断是否登陆
    await this.weblogin();

    let ad = {id : 0, type: this.param("type"), is_weixin: false};
    if (is_weixin(this.userAgent())){
      ad.is_weixin = true;

      let wxUser = await this.model("wx_user").where({uid: this.user.uid}).find();
      if (!think.isEmpty(wxUser)){
        ad.title = wxUser.nickname;
        ad.picture_url = wxUser.headimgurl;
        ad.phone = this.user.mobile;
      }
    }

    this.assign("ad", ad);
    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      this.active = "ad/add";
      return this.display(`mobile/${this.http.controller}/${this.http.action}`);
    } else {
      return this.display();
    }
  }

  async typeAction() {
    await this.weblogin();

    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      this.active = "ad/add";
      return this.display(`mobile/${this.http.controller}/${this.http.action}`);
    } else {
      return this.display();
    }

  }

  async defaultAction(){
    await this.weblogin();
    let data = await this.model('ad').where({user_id:this.user.uid, id: this.param("id")}).find();
    if (!think.isEmpty(data)){
      data.default = 1;
      await this.model("ad").where({id:this.param("id")}).update(data);

      let list = await this.model('ad').where({user_id:this.user.uid, id:{"!=":this.param("id")}}).select();
      for (let v of list){
        v.default = 0;
        await this.model("ad").where({id:v.id}).update(v);
      }

    }

    this.redirect("/uc/ad");
  }

  async editAction() {
    //判断是否登陆
    await this.weblogin();
    let data = await this.model('ad').where({user_id:this.user.uid, id: this.param("id")}).find();
    let pic = await this.model('picture').where({id: data.picture_id}).find();
    data.picture_url = pic.path;

    this.assign("ad", data);

    //判断浏览客户端
    if (checkMobile(this.userAgent())) {
      this.active = "ad/add";
      return this.display(`mobile/${this.http.controller}/add`);
    } else {
      return this.display();
    }
  }

  async delAction() {
    await this.weblogin();
    await this.model('ad').where({user_id:this.user.uid, id: this.param("id")}).delete();
    this.redirect("/uc/ad");
  }

  async updateAction(){
    await this.weblogin();

    let type = parseInt(this.param("ad_type"));
    
    let file;
    let title;
    let serverId;
    if (type == 0){
      file = think.extend({}, this.file('file'));
      title = this.param("ad_title");
      serverId = this.param("wx_serverId1");
    }
    else{
      file = think.extend({}, this.file('file2'));
      title = this.param("ad_title2");
      serverId = this.param("wx_serverId2");
    }
    console.log("*** ", file, title, serverId, this.param("ad_picUrl"));

    let res;
    if (file.originalFilename != ""){
        let filepath = file.path;
        let basename = path.basename(filepath);
        /*
        if(this.setup.IS_QINIU==1){
            let qiniu = think.service("qiniu");
            let instance = new qiniu();
            let uppic = await instance.uploadpic(filepath,basename);
            if(!think.isEmpty(uppic)){
                let data ={
                    create_time:new Date().getTime(),
                    status:1,
                    type:2,
                    sha1:uppic.hash,
                    path:uppic.key
                };
               res = await this.model("picture").data(data).add();
            }
        } else 
        */
        {
            let uploadPath = think.RESOURCE_PATH + '/upload/picture/'+dateformat("Y-m-d",new Date().getTime());
            think.mkdir(uploadPath);
            if(think.isFile(filepath)){
                fs.renameSync(filepath, uploadPath + '/' + basename);
            }else {
                console.log("文件不存在！")
            }
            file.path = uploadPath + '/' + basename;
            if(think.isFile(file.path)){
                let data ={
                    path:'/upload/picture/'+dateformat("Y-m-d",new Date().getTime())+ '/' + basename,
                    create_time:new Date().getTime(),
                    status:1,
                }
                res = await this.model("picture").data(data).add();
            }else{
                console.log('not exist')
            }
        }
    }

    if (this.param("ad_id") == 0){
      // 新增
      if (!think.isEmpty(res)){
        let data = {
          user_id : this.user.uid,
          picture_id: res,
          title : title,
          redirect : this.param("ad_redirect"),
          type: type,
          memo: this.param("ad_memo"),
          phone: this.param("ad_phone")
        }
        let ad = await this.model("ad").where({user_id:this.user.uid}).find();
        if (think.isEmpty(ad)){
          data.default = 1;
        }
        await this.model("ad").data(data).add();
      }
    }
    else{
      // updata
      let data = {
          title : title,
          redirect : this.param("ad_redirect"),
          memo: this.param("ad_memo"),
          phone: this.param("ad_phone")
      }
      if (!think.isEmpty(res)){
          data.picture_id = res;
      }
      await this.model("ad").where({id:this.param("ad_id"), user_id:this.user.uid}).update(data);
    }

    this.redirect("/uc/ad");
  }
  
  async adhitsAction(){
    //访问统计
    await this.model('ad').where({id:this.param("id")}).increment('view');
    this.json({});
  }
}