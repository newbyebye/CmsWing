# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

import scrapy


class ArticleItem(scrapy.Item):
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
    description = scrapy.Field()
    content = scrapy.Field()

