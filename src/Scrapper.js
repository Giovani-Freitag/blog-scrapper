import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { TaskQueue } from "cwait";

export default class Scrapper{

    constructor(entry){

        this.entry = entry;
        this.makeQueues();
    }

    makeQueues(){

        let queue = new TaskQueue(Promise, 20);
        this.fetchPostQueue = queue.wrap(this.fetchPost.bind(this));
    }

    async run(){
        
        let links = await this.fetchPagination(this.entry);

        return Promise.all(links.map((link, i) => this.fetchPostQueue(link, i)));
    }

    async fetchPagination(link){

        let finished = false;
        let page = 0;
        let stack = [];

        while(!finished && page < 2){
            
            console.log(`Fetching: ${link}, Fetched posts: ${stack.length}`);

            let req = await fetch(link);
            let html = await req.text();
            let {posts, nextLink} = this.parsePagination(html);

            stack = stack.concat(posts);
            page += 1;
            
            if(nextLink)
                link = nextLink;
            
            else
                finished = true;
        }

        return stack;
    }

    parsePagination(html){

        let $ = cheerio.load(html);

        let posts = $('.blog-post .post-title a')
            .map(function(){
                return $(this).attr('href');
            })
            .get();

        let nextLink = $('.blog-pager-older-link').attr('href');
    
        return { posts, nextLink };
    }

    async fetchPost(link){

        console.log(`Fetching: ${link}`);

        let req = await fetch(link);
        let html = await req.text();

        return {
            ...this.parsePost(html),
            link
        };
    }
    
    parsePost(html){

        let $ = cheerio.load(html);

        let title = $('.blog-post .post-title').text().trim();

        let author = $('.blog-post .post-author').text();

        let tags = $('.post-labels .label-link')
            .map(function(){
                return $(this).text();
            })
            .get();

        let content = $('.post-body.post-content').prop('outerHTML');
        
        return {title, author, tags, content};
    }
}