import TurndownService from 'turndown'
import config from './config'
import { Embed } from './types/embed'
import { ExecuteWebhookBody } from './types/interface'

const { blogUrl, avatarUrl, username, maxDescLen } = config
const turndownService = new TurndownService()

const cutAtWord = (str: string, len: number = maxDescLen) => {
    let index = len - 1

    while (/\s/.test(str.charAt(index))) {
        index--
    }

    return str.substr(0, index)
}

export const parseTableData = (td: HTMLTableCellElement): ExecuteWebhookBody => {

    const { children } = td
    const markdown = turndownService.turndown(td)
    // Extract data and shit
    const [ firstParagraph ] = Array.from(children)
    // [ strong tag with date string, a tag with id ]
    const [ date, idATag ] = Array.from(firstParagraph.children)
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
        timestamp = postTime.toISOString()
        timestamp = timestamp.substr(0, timestamp.length - 1) // remove the Z
        timestamp += '-05:00'
    }

    /**
     * Creates a list of Embeds to add to the message. If the blog post is over
     * discord's maximum description length (`2000`), then more than one embed
     * is needed. This function splits said description appropriately. It also
     * adds the part number in the footer if a split occurs.
     * @param data
     * @param count
     */
    const buildBaseEmbeds = ({ title, description = '', timestamp }: Embed, count = 1): Embed[] => {
        const needsAnotherPart = description.length >= maxDescLen
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
                    'name':  'Blog Post',
                    'value': `${blogUrl}#${id}`
                }
            ]

        return [{
            title:       count === 1 ? title : undefined,
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
        ) ]
    }


    // return buildBaseEmbeds({ title: idATag.id, description: markdown, timestamp })
    return {
        embeds:     buildBaseEmbeds({ title: id, description: markdown, timestamp }),
        avatar_url: avatarUrl,
        username
    }
}
