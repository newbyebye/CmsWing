# -*- coding: utf-8 -*-

from twisted.enterprise import adbapi
import MySQLdb.cursors

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html
'''
CREATE TABLE `alpha_document_article` (
  `id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '文档ID',
  `parse` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '内容解析类型',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '文章内容',
  `template` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '详情页显示模板',
  `bookmark` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '收藏数',
  `url` varchar(255) NOT NULL DEFAULT '' COMMENT '文章url',
  `md5` char(32) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '文章url md5',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '文章标题',
  `summary` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin  DEFAULT NULL COMMENT '文章摘要',
  `img`  varchar(255)  DEFAULT NULL COMMENT '缩略图',
  `article_img` varchar(255)  DEFAULT NULL COMMENT '大图',
  `article_img_from` varchar(255) DEFAULT NULL COMMENT '大图来源',
  `article_source` varchar(255) DEFAULT NULL COMMENT '文章来源',
  `article_source_link` varchar(255) DEFAULT NULL COMMENT '文章源link',
  `article_source_title` varchar(255) DEFAULT NULL COMMENT '文章源标题',
  `create_time` bigint(13) unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_time` bigint(13) unsigned NOT NULL DEFAULT '0' COMMENT '更新时间',
  `author`  varchar(255)  DEFAULT NULL COMMENT '作者',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='文档模型文章表';

 title = scrapy.Field()
    url   = scrapy.Field()
    md5   = scrapy.Field()
    img   = scrapy.Field()
    author = scrapy.Field()
    time   = scrapy.Field()
    articleImg = scrapy.Field()
    articleImgFrom = scrapy.Field()
    articleSource = scrapy.Field()
    articleSourceLink = scrapy.Field()
    articleSourceTitle = scrapy.Field()
    summary = scrapy.Field()
    content = scrapy.Field()
'''

import json
import datetime

class JsonWriterPipeline(object):

    def open_spider(self, spider):
        self.file = open('../result/%s.json' % (datetime.datetime.now().strftime('%b-%d-%y_%H_%M_%S')), 'w')
        self.file.write('[')
        self.firstLine = True

    def close_spider(self, spider):
        self.file.write(']')
        self.file.close()

    def process_item(self, item, spider):
        if self.firstLine:
            line = json.dumps(dict(item))
            self.firstLine = False
        else:
            line = ",\n" + json.dumps(dict(item))
        self.file.write(line)
        return item

class AlphaPipeline(object):
    def __init__(self):    
        self.db_pool = adbapi.ConnectionPool('MySQLdb',
                                             db='alpha',
                                             user='root',
                                             passwd='123456',
                                             host='127.0.0.1',
                                             port=3307,
                                             charset='utf8',
                                             use_unicode=True)
    
    def process_item(self, item, spider):
        query = self.db_pool.runInteraction(self._conditional_insert, item)
        query.addErrback(self.handle_error)
        return item

    def _conditional_insert(self, tx, item):
        print("select id from alpha_document_article where md5 = %s", (item['md5'], ))

        tx.execute("select id from alpha_document_article where md5 = %s", (item['md5'], ))
        result = tx.fetchone()
        if result:
            pass
        else:
            values = (
                item['title'],
                item['url'],
                item['md5'],
                item['content'],
                item['author'],
                item['summary'],
                item['img'],
                item['articleImg'],
                item['articleImgFrom'],
                item['articleSource'],
                item['articleSourceLink'],
                item['articleSourceTitle'],
                item['time']
                )
            tx.execute("insert into alpha_document_article(title, url, md5, content, author, summary, img, article_img, article_img_from, article_source, article_source_link, article_source_title, create_time) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", values)

    def handle_error(self, e):
        print('error',e)