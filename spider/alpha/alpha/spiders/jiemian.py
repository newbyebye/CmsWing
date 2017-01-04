# -*- coding: utf-8 -*-
import scrapy
import datetime
from alpha.items import *
from scrapy.http import Request
import hashlib

class JiemianSpider(scrapy.Spider):
    name = "jiemian"
    allowed_domains = ["m.jiemian.com"]
    start_urls = ['http://m.jiemian.com/lists/2_1.html']

    def parse(self, response):
        print(response.url)

        items = []

        today = datetime.datetime.now().strftime('%m/%d')    
        oneday=datetime.timedelta(days=1)  
        yesterday=(datetime.date.today()-oneday).strftime('%m/%d')

        for quote in response.css('div.news-view'):
            item = ArticleItem()
            item['title'] = quote.css('div.news-left a::text').extract_first()
            item['url'] = quote.css('div.news-right a::attr(href)').extract_first()
            item['img'] = quote.css('div.news-right img::attr(src)').extract_first()
            item['author'] = quote.css('div.news-footer span a::text').extract_first()
            items.append(item)

        for item in items:
            yield Request(url = item['url'], meta={'item': item}, callback=self.articleParse)


    def articleParse(self, response):
        item = response.meta['item']

        articleItem = ArticleItem()
        articleItem['title'] = item['title']
        articleItem['url'] = item['url']
        articleItem['md5'] = hashlib.md5(item['url'].encode("utf8")).hexdigest().upper()
        articleItem['img'] = item['img']
        articleItem['author'] = item['author']
        articleItem['time'] = response.css('div.info span.date::text').extract_first()
        articleItem['description'] = response.css('p.summary::text').extract_first()
        articleItem['articleImg'] = response.css('div.article-img img::attr(src)').extract_first()
        articleItem['articleImgFrom'] = response.css('div.article-img p span::text').extract_first()
        articleItem['content'] = response.css('div.article-content').extract_first()
        articleItem['articleSource'] = response.css('div.article-source p::text').extract_first()
        articleItem['articleSourceLink'] = response.css('div.article-source p a::attr(href)').extract_first()
        articleItem['articleSourceTitle'] = response.css('div.article-source p a::text').extract_first()

        yield articleItem
            

