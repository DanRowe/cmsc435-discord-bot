import TurndownService from 'turndown'
import config from './config'
import { Embed } from './types/embed'
import { ExecuteWebhookBody } from './types/interface'

const { blogUrl, avatarUrl, username, maxDescLen } = config
const turndownService = new TurndownService()

/**
 * Given a paragraph, returns a shortened paragraph that does not exceed `len`
 * characters. The cut will occur at a word boundary, meaning that words will
 * not be split internally. If `str` is shorter than `len`, no split occurs.
 *
 * This split should result in the longest possible portion of the paragraph
 * that does not split a word.
 *
 * @private
 *
 * @param str The paragraph to cut.
 * @param len The maximum number of characters of the result portion.
 *
 * @returns The longest possible portion of `str`, starting at the beginning.
 */
export const cutAtWord = (str: string, len: number = maxDescLen): string => {
    let index = len
    const curr = str.charAt(index)

    const isWhitespace = (c: string) => c.length == 1 && /\s/.test(c)
    const isSymbol = (c: string) => c.length == 1 && /\S/.test(c)

    // String is within length requirement, no trimming needed
    if (str.length <= len) {
        return str
    }

    // trim location is not on whitespace
    if(isSymbol(curr)) {
        const pred = str.charAt(len + 1)

        // Trim location starts at a word boundary, no more to do
        if (pred === '' || isWhitespace(pred)) {
            return str.substr(0, len)
        }

        while (isSymbol(str.charAt(index))) {
            index--
        }
    }

    while (isWhitespace(str.charAt(index))) {
        index--
    }

    return str.substr(0, index + 1)
}

/**
 * Builds a discord webhook payload from a blog entry
 *
 * This function extracts and processes data in one of Dr. Purtilo's blog posts.
 * Rich formatting is added where possible. Embeds and footers are added where
 * desired and/or necessary. Measures are taken to conform to relevant discord
 * API constraints.
 *
 * - The title of each embed is the id of the anchor tag enclosed, equivalent to
 *   the date suffixed by an a for the first post, b for the second post, etc. If
 *   there is only 1 post for that day, no suffix is included
 * - If multiple embeds are required, a footer is added specifying the "part" number
 *   for each embed.
 * - The maximum embed description length is 2000 characters.
 * @public
 *
 * @param td The blog entry to parse
 *
 * @returns The extracted and processed data transformed into a discord webhook
 * response payload.
 *
 * @see ExecuteWebhookBody
 * @see Embed
 */
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
     *
     * @param data
     * @param count
     *
     * @see Embed
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
