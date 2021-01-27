import axios from 'axios'
import { JSDOM } from 'jsdom'
import TurndownService from 'turndown'
import { Embed } from './types/embed'
import { ExecuteWebhookBody } from './types/interface'

const turndownService = new TurndownService()
const MAX_LEN = 2000

const cutAtWord = (str: string, len: number = MAX_LEN) => {
    let index = len - 1

    while (/\s/.test(str.charAt(index))) {
        index--
    }

    return str.substr(0, index)
}

export const parseTableData = async (td: HTMLTableCellElement): Promise<ExecuteWebhookBody> => {

    const { children } = td

    // Extract data and shit
    const [firstParagraph] = Array.from(children)
    // [ strong tag with date string, a tag with id ]
    const [date, idATag] = Array.from(firstParagraph.children)
    const markdown = turndownService.turndown(td)
    const { id } = idATag
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

    const buildBaseEmbeds = ({ title, description = "", timestamp }: Embed, count = 1): Embed[] => {
        const needsAnotherPart = description.length >= MAX_LEN
        let splitAt = -1
        let cleanedDescription = ''

        // If the embed doesn't need to be split, don't include 'Part 1' in the footer.
        const footer = !needsAnotherPart && count === 1
            ? undefined
            : { text: `Part ${count}` }

        //
        // split and clean the description as needed
        if (needsAnotherPart) {
            cleanedDescription = cutAtWord(description)
            splitAt = cleanedDescription.length
        } else {
            cleanedDescription = description
        }

        cleanedDescription = cleanedDescription.trim()
        const fields = needsAnotherPart
            ? []
            : [
                {
                    "name": "Blog Post",
                    "value": `https://seam.cs.umd.edu/purtilo/435/blog.html#${id}`
                }
            ]

        return [{
            title: count === 1 ? title : undefined,
            description: cleanedDescription,
            timestamp,
            footer,
            fields
        },
        ...(
            // Call recursively if we need to split again, otherwise we're done
            needsAnotherPart
                ? buildBaseEmbeds({
                    title,
                    description: description.substr(splitAt),
                    timestamp
                }, count + 1)
                : []
        )]
    }


    // return buildBaseEmbeds({ title: idATag.id, description: markdown, timestamp })
    return {
        embeds: buildBaseEmbeds({ title: id, description: markdown, timestamp }),
        avatar_url: "https://www.csee.umbc.edu/wp-content/uploads/2012/07/Purtilo1.jpg",
        username: "CMSC 435 Bot"
    }
}
