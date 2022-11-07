# Blog Scrapper

Simple script to scrap a blog


## Install / Usage

Clone the repo or download:
```sh
git clone https://github.com/Giovani-Freitag/blog-scrapper.git
```

Install dependencies:
```sh
npm i
```

Configure a scrapper profile:
- rename `.env-example` to `.env`;
- Populate the `.env` entries with css selectors that matches the blog template

Run:
```sh
npm run scrap <blog-url> <?page-amount>
```

A file named `output.json` will appears in the project root with all the scrapped content.