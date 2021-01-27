import axios from 'axios'
import { JSDOM } from 'jsdom'
import { parseTableData } from './parse'
import Bluebird from 'bluebird'
// @ts-ignore
global.Promise = Bluebird.Promise

const blog = 'https://seam.cs.umd.edu/purtilo/435/blog.html'
const webhook = 'https://discord.com/api/webhooks/803841404576333825/9MQnRPAfxMdqsx3KxNsUy3G0juVZn1FLB1kHy_SyNGQYP8h_go-o8Hs1fmSrszCnkcP0'

const getTableElements = async (): Promise<HTMLTableCellElement[]> => {
    const res = await axios.get<string>(blog)
    const dom = new JSDOM(res.data)
    const { document } = dom.window
    // First is a page header and can be discarded
    const [first, ...rest] = document.querySelectorAll<HTMLTableCellElement>('table td')

    return rest || []
}


const main = async () => {
    // const data = await Promise.all((await getTableElements()).map(parseTableData).reverse())
    const data = await getTableElements().map(parseTableData)
    // let res = await parseTableData(data[0])
    for (let post of data) {
        for (let part of post) {
            await axios.post(webhook, part).catch(err => {
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
    // console.log(await parseTableData(data[0]))
    // let { message, metadata } = await compileAST(data[0])
    // console.log(message)
    // data.forEach((el => console.log(JSON.stringify(el, undefined, 2))))

}

main()
