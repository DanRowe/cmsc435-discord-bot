import axios from 'axios'
import { JSDOM } from 'jsdom'
import TurndownService from 'turndown'
import { ExecuteWebhookBody } from './types/interface'

const turndownService = new TurndownService()

export const parseTableData = async (td: HTMLTableCellElement): Promise<ExecuteWebhookBody> => {

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
