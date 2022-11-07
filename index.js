import Scrapper from "./src/Scrapper.js";
import FS from "fs-extra";
import * as dotenv from 'dotenv';

dotenv.config();

(new Scrapper(process.argv[2]))
    .run(process.argv[3])
    .then(res => FS.writeJson(`./output.json`, res));