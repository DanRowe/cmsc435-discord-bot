import axios from 'axios'
import Bluebird from 'bluebird'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import config from './config'
import { parseTableData } from './parse'
import { ExecuteWebhookBody } from './types/interface'
// @ts-ignore
global.Promise = Bluebird.Promise

const { blogUrl, webhookUrl, blogFile } = config
// const blogUrl = 'https://seam.cs.umd.edu/purtilo/435/blog.html'
// const webhookUrl = process.env.WEBHOOK_URL || ''

const blogs = fs.readFileSync(blogFile, 'utf8').split('\n')

const today = new Date()
const todaysDate =
  `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

const getTableElements = async (): Promise<HTMLTableCellElement[]> => {
    const res = await axios.get<string>(blogUrl)
    const dom = new JSDOM(res.data)
    const { document } = dom.window
    // First is a page header and can be discarded
    const [ first, ...rest ] = document.querySelectorAll<HTMLTableCellElement>(
        'table td'
    )

    const newPosts = getNewPosts(rest)

    updateBlogsToday(newPosts)

    return newPosts
}

const getNewPosts = (posts: HTMLTableCellElement[]): HTMLTableCellElement[] => {
    return posts.filter(e => {
        const date = e.children[0].children[0].innerHTML
        const id = e.children[0].children[1].id

        const isToday = date.localeCompare(todaysDate) === 0
        const isNew = !blogs.includes(id)

        return isToday && isNew
    })
}

const updateBlogsToday = (posts: HTMLTableCellElement[]) => {
    posts.forEach((e) => {
        const postId = e.children[0].children[1].id
        fs.appendFile(
            blogFile,
            `${postId}\n`,
            (err) => {
                if (err) console.error(err)
                console.log(`Saved ${postId}!`)
            }
        )
    })
}

const sendDiscordNotifications = async (data: ExecuteWebhookBody[]) => {
    for (const post of data) {
        await axios.post(webhookUrl, post).catch(err => {
            if (err?.response) {
                console.error(err.response)
                console.error('==========================')
                console.error(JSON.stringify(post, undefined, 2))
            } else if (err.message) {
                console.error(err.message)
            } else {
                console.error(err)
            }
        })
    }
}

const main = async (): Promise<void> => {
    const data = await getTableElements().map(parseTableData)
    await sendDiscordNotifications(data.reverse())
}

void main()
