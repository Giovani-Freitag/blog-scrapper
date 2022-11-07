import Scrapper from "./src/Scrapper.js";
import FS from "fs-extra";

(new Scrapper(process.argv[2]))
    .run()
    .then(res => FS.writeJson(`./output.json`, res));