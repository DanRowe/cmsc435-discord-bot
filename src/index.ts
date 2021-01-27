import axios from 'axios'
import Bluebird from "bluebird";
import { JSDOM } from "jsdom";
import fs from "fs";
import dotenv from "dotenv";
import { parseTableData } from "./parse";
import { ExecuteWebhookBody } from "./types/interface";
// @ts-ignore
global.Promise = Bluebird.Promise
dotenv.config();

const blogUrl = 'https://seam.cs.umd.edu/purtilo/435/blog.html'
const webhookUrl = process.env.WEBHOOK_URL || "";

const blogs = fs.readFileSync("src/blogsToday", "utf8").split("\n");

const today = new Date();
const todaysDate =
  today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

const getTableElements = async (): Promise<HTMLTableCellElement[]> => {
  const res = await axios.get<string>(blogUrl);
  const dom = new JSDOM(res.data);
  const { document } = dom.window;
  // First is a page header and can be discarded
  const [first, ...rest] = document.querySelectorAll<HTMLTableCellElement>(
    "table td"
  );

  let result = rest.filter(
    (e) =>
      e.children[0].children[0].innerHTML.localeCompare(todaysDate) == 0 &&
      !blogs.includes(e.children[0].children[1].id)
  );

  result.forEach((e) => {
    fs.appendFile(
      "src/blogsToday",
      `${e.children[0].children[1].id}\n`,
      (err) => {
        if (err) console.error(err);
        console.log(`Saved ${e.children[0].children[1].id}!`);
      }
    );
  });

  return result;
};

const sendDiscordNotifications = async (data: ExecuteWebhookBody[]) => {
    for (let post of data) {
        await axios.post(webhookUrl, post).catch(err => {
            if (err.response) {
                console.error(err.response)
                console.error("==========================")
                console.error(JSON.stringify(post, undefined, 2))
            } else if (err.message) {
                console.error(err.message)
            } else {
                console.error(err)
            }
        })
    }
}

const main = async () => {
    const data = await getTableElements().map(parseTableData)
    await sendDiscordNotifications(data.reverse())
}

main();
