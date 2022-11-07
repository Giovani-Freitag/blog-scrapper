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

    async run(pageAmount){
        
        let links = await this.fetchPagination(this.entry, pageAmount);

        return Promise.all(links.map((link, i) => this.fetchPostQueue(link, i)));
    }

    async fetchPagination(link, pageAmount = null){

        let finished = false;
        let page = 0;
        let stack = [];

        while(!finished && (!pageAmount || page < pageAmount)){
            
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

        let posts = $(process.env.SELECTOR_POST_LINK)
            .map(function(){
                return $(this).attr('href');
            })
            .get();

        let nextLink = $(process.env.SELECTOR_NEXT_PAGE_LINK).attr('href');
    
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

        let title = $(process.env.SELECTOR_POST_TITLE).text().trim();

        let author = $(process.env.SELECTOR_POST_AUTHOR).text();

        let tags = $(process.env.SELECTOR_POST_TAGS)
            .map(function(){
                return $(this).text();
            })
            .get();

        let content = $(process.env.SELECTOR_POST_CONTENT).prop('outerHTML');
        
        return {title, author, tags, content};
    }
}