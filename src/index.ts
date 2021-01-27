import axios from 'axios'
import { JSDOM } from 'jsdom'
import TurndownService from 'turndown'
import assert from 'assert'
import { ExecuteWebhookBody } from './types/interface'
import cron from 'node-cron'
import { parseTableData } from './parse'

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


type Metadata = {
    date?: string
} & Record<string, any>
type CompileResult = {
    message: string
    metadata: Metadata
}

const main = async () => {
    const data = await Promise.all((await getTableElements()).map(parseTableData).reverse())
    // let res = await parseTableData(data[0])
    for (let post of data) {
        await axios.post(webhook, post).catch(err => {
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
    // console.log(await parseTableData(data[0]))
    // let { message, metadata } = await compileAST(data[0])
    // console.log(message)
    // data.forEach((el => console.log(JSON.stringify(el, undefined, 2))))

}

cron.schedule("0 * * * *", () => {
    main()
})
