import axios from 'axios'
import Bluebird from 'bluebird'
import { JSDOM } from 'jsdom'
import { Stats, promises as fs } from 'fs'

import config from './config'
import { parseTableData } from './parse'
import { ExecuteWebhookBody } from './types/interface'
// @ts-ignore
global.Promise = Bluebird.Promise

const { blogUrl, webhookUrl, blogFile } = config
const loadBlogFile = async (): Promise<string[]> => {
    let s: Stats
    try {
        s = await fs.stat(blogFile)
    } catch (e) {
        return []
    }

    if (s.isDirectory()) {
        throw new Error(`Bad blog file: ${blogFile} is a directory`)
    }

    return (await fs.readFile(blogFile, 'utf8')).split('\n')
}

const blogs = loadBlogFile()
const today = new Date()
const todaysDate =
    `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

/**
 * Fetches a webpage and pulls out the table data
 *
 * @param url URL of the page to scrape
 */
const getTableElements = async (url = blogUrl): Promise<HTMLTableCellElement[]> => {
    const res = await axios.get<string>(url)
    const dom = new JSDOM(res.data)
    const { document } = dom.window
    // First is a page header and can be discarded
    const [ _, ...content ] = document.querySelectorAll<HTMLTableCellElement>(
        'table td'
    )

    const newPosts = await getNewPosts(content)

    await updateBlogFile(newPosts)

    return newPosts
}

const getNewPosts = async (posts: HTMLTableCellElement[]): Promise<HTMLTableCellElement[]> => {
    const b = await blogs
    return posts.filter(e => {
        const date = e.children[0].children[0].innerHTML
        const id = e.children[0].children[1].id

        const isToday = date.localeCompare(todaysDate) === 0
        const isNew = !b.includes(id)

        return isToday && isNew
    })
}

const updateBlogFile = (posts: HTMLTableCellElement[]) => Promise.all(
    posts.map(e => fs.appendFile(
        blogFile,
        `${e.children[0].children[1].id}\n`
    )))

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
