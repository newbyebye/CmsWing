// +----------------------------------------------------------------------
// | CmsWing [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.cmswing.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <arterli@qq.com>
// +----------------------------------------------------------------------
'use strict'

global.wrapper = function (callback) {
  return function (err, data, res) {
    callback = callback || function () {};
    if (err) {
      err.name = 'WeChatAPI' + err.name;
      return callback(err, data, res);
    }
    if (data && data.errcode) {
      err = new Error(data.errmsg);
      err.name = 'WeChatAPIError';
      err.code = data.errcode;
      return callback(err, data, res);
    }
    callback(null, data, res);
  };
};

 /* global massend 群发图文消息 */
global.massSendNews=(api,media_id,receivers)=>{
    let deferred = think.defer();
    api.massSendNews(media_id,receivers,(err,result)=>{
        //console.log(result)
        if(!think.isEmpty(result)){
            deferred.resolve(result);
            //self.end(result);
        }else{
            console.error('err'+err);
            //deferred.reject(err);
        }
    });
    return deferred.promise;
}

 /* global massend 群发文本消息 */
global.massSendText=(api,content,receivers)=>{
    let deferred = think.defer();
    api.massSendText(content,receivers,(err,result)=>{
        //console.log(result)
        if(!think.isEmpty(result)){
            deferred.resolve(result);
            //self.end(result);
        }else{
            console.error('err'+err);
            //deferred.reject(err);
        }
    });
    return deferred.promise;
}

 /* global massend 群发图片消息 */
global.massSendImage=(api,media_id,receivers)=>{
    let deferred = think.defer();
    api.massSendImage(media_id,receivers,(err,result)=>{
        //console.log(result)
        if(!think.isEmpty(result)){
            deferred.resolve(result);
            //self.end(result);
        }else{
            console.error('err'+err);
            //deferred.reject(err);
        }
    });
    return deferred.promise;
}

 /* global massend 群发语音消息 */
global.massSendVoice=(api,media_id,receivers)=>{
    let deferred = think.defer();
    api.massSendVoice(media_id,receivers,(err,result)=>{
        //console.log(result)
        if(!think.isEmpty(result)){
            deferred.resolve(result);
            //self.end(result);
        }else{
            console.error('err'+err);
            //deferred.reject(err);
        }
    });
    return deferred.promise;
}

 /* global massend 群发视频消息 */
global.massSendVideo=(api,media_id,receivers)=>{
    let deferred = think.defer();
    api.massSendVideo(media_id,receivers,(err,result)=>{
        //console.log(result)
        if(!think.isEmpty(result)){
            deferred.resolve(result);
            //self.end(result);
        }else{
            console.error('err'+err);
            //deferred.reject(err);
        }
    });
    return deferred.promise;
}
/**
 * 获取用户基本信息
 * 详情请见：http://mp.weixin.qq.com/wiki/14/bb5031008f1494a59c6f71fa0f319c66.html
 * @param openid
 * @returns {Promise}
 */
global.getUser=(api,openid, isOpen)=>{
    let deferred = think.defer();
    if (isOpen){
        api.request(url, {dataType: 'json'}, wrapper(function (err, data) {
            if (!think.isEmpty(data)){
                deferred.resolve(result);
            }
            else{
                console.error('err'+err);
            }
            
        }));
    }
    else{
        api.getUser(openid, function (err, result) {
            if(!think.isEmpty(result)){
                deferred.resolve(result);
                //self.end(result);
            }else{
                console.error('err'+err);
                //deferred.reject(err);
            }
        });
    }
    return deferred.promise;
}
/**
 * 创建永久二维码 详细请看：http://mp.weixin.qq.com/wiki/18/28fc21e7ed87bec960651f0ce873ef8a.html
 * @param api
 * @param sceneId 场景ID。数字ID不能大于100000，字符串ID长度限制为1到64
 * @returns {Promise}
 */
global.createLimitQRCode=(api,sceneId)=>{
    let deferred = think.defer();
    api.createLimitQRCode(sceneId, function (err, result) {
        if(!think.isEmpty(result)){
            deferred.resolve(result);
            //self.end(result);
        }else{
            console.error('err'+err);
            //deferred.reject(err);
        }
    });
    return deferred.promise;
}
