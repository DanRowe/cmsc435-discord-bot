import axios from 'axios'
import { JSDOM } from 'jsdom'
import TurndownService from 'turndown'
import assert from 'assert'
import { ExecuteWebhookBody } from './types/interface'
import cron from 'node-cron'

const turndownService = new TurndownService()
const blog = 'https://seam.cs.umd.edu/purtilo/435/blog.html'
// https://discord.com/api/webhooks/803787431706624020/5zLZjMUlEqP6D8Ic16ycxXM7rWqkkmO6qtWSv_mRiiURMvKur5nx_3OyoXx5qGCza9DX
const webhook = 'https://discord.com/api/webhooks/803787431706624020/5zLZjMUlEqP6D8Ic16ycxXM7rWqkkmO6qtWSv_mRiiURMvKur5nx_3OyoXx5qGCza9DX'

const getTableElements = async (): Promise<HTMLTableCellElement[]> => {
    const res = await axios.get<string>(blog)
    const dom = new JSDOM(res.data)
    const { document } = dom.window
    // First is a page header and can be discarded
    const [first, ...rest] = document.querySelectorAll<HTMLTableCellElement>('table td')

    return rest || []
}

const parseTableData = async (td: HTMLTableCellElement): Promise<ExecuteWebhookBody> => {

    const { children } = td

    // Extract data and shit
    const [firstParagraph] = Array.from(children)
    // [ strong tag with date string, a tag with id ]
    const [date, idATag] = Array.from(firstParagraph.children)
    const markdown = turndownService.turndown(td)
    const now = new Date()
    const postTime = new Date(date.innerHTML)

    let timestamp = ''

    if (
        now.getFullYear() === postTime.getFullYear() &&
        now.getMonth() === postTime.getMonth() &&
        now.getDate() === postTime.getDate()
    ) {
        /* Post happened today. Because this is a cron job, this means
           that it happened about when this was checked and isn't a backlog
           or whatever, so we can use the current time */
        timestamp = now.toISOString()
    } else {
        // Convert to EST
        timestamp = postTime.toISOString();
        timestamp = timestamp.substr(0, timestamp.length - 1) // remove the Z
        timestamp += '-05:00'
    }


    return {
        embeds: [
            {
                title: idATag.id,
                description: markdown,
                timestamp
            },
        ]
    }
}

type Metadata = {
    date?: string
} & Record<string, any>
type CompileResult = {
    message: string
    metadata: Metadata
}

const main = async () => {
    const data = await getTableElements()
    let res = await parseTableData(data[0])
    await axios.post(webhook, res).catch(err => {
        if (err.response) {
            const { status, headers, data } = err.response
            console.error(`${status}: ${JSON.stringify(data, undefined, 2)}`)
        } else if (err.message) {
            console.error(err.message)
        } else {
            console.error(err)
        }
    })
    // console.log(await parseTableData(data[0]))
    // let { message, metadata } = await compileAST(data[0])
    // console.log(message)
    // data.forEach((el => console.log(JSON.stringify(el, undefined, 2))))

}

cron.schedule("0 * * * *", () => {
    main()
})
