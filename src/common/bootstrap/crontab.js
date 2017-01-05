// +----------------------------------------------------------------------
// | CmsWing [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.cmswing.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <arterli@qq.com>
// +----------------------------------------------------------------------
import crontab from "node-crontab";


let fn = () => {
    //定时任务具体逻辑
    //调用一个 Action
    //订单在规定时间位付款自动作废方法
    think.http("/admin/crontab/cloa", true);
}

//1 分钟执行一次
// let jobId = crontab.scheduleJob("*/1 * * * *", fn);
// 开发环境下立即执行一次看效果
// if(think.env === "development"){
//     fn();
// }


let spider = () => {
    var exec = require('child_process').exec;
    think.log("start spider  ....................");
    var child = exec("cd " + think.ROOT_PATH + "/spider/alpha;scrapy crawl jiemian", function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null){
            console.log('exec error: ' + error);
        }
    });
}
// 每天隔4小时执行一次
let jobId1 = crontab.scheduleJob("0 */4 * * *", spider);


let scan = () => {
    var fs = require('fs');
    let ArticleService = think.service("article");
    
    var files = fs.readdirSync(think.ROOT_PATH + "/spider/result/");
    files.forEach(function(file){
        fs.readFile(think.ROOT_PATH + "/spider/result/"+file, 'utf8', function (err, data) {
            if (err) throw err; // we'll not consider error handling for now
            // 解析完成之后删除文件
            // TODO: 去重
            fs.unlink(think.ROOT_PATH + "/spider/result/"+file);
            var objs = JSON.parse(data);
            objs.forEach(function(obj){
                let articleService = new ArticleService();

                obj.id = '';
                obj.model_id = '2';
                obj.category_id = '39';
                obj.uid = '1';
                obj.pid = '0';
                obj.topid = '0';
                obj.type = '2';
                obj.link_id = '0';
                obj.display = '1',
                obj['date|||deadline'] = '';
                obj['date|||create_time']= obj.time;
                articleService.addArticle(obj);
            });
        });
    });
}

// 每天隔4小时执行一次
let jobId2 = crontab.scheduleJob("0 */4 * * *", scan);

if (think.env === "development"){
    //spider();
    scan();
}
