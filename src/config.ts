import dotenv from 'dotenv'
dotenv.config()

const { WEBHOOK_URL } = process.env

if (!WEBHOOK_URL) {
    throw new Error('Discord webhook URL not provided. Please set the `WEBHOOK_URL` environment variable.')
}

const config = {

    /**
     * CMSC 435 announcement blog URL.
     */
    blogUrl: 'https://seam.cs.umd.edu/purtilo/435/blog.html',

    /**
     * Discord webhook URL where blog update messages are sent.
     */
    webhookUrl: WEBHOOK_URL,

    /**
     * Path to the current blog state file.
     */
    blogFile: 'src/blogsToday',

    /**
     * URL to the avatar image, displayed as the bot's Discord profile pic.
     */
    avatarUrl: 'https://www.csee.umbc.edu/wp-content/uploads/2012/07/Purtilo1.jpg',

    /**
     * Display name of the bot in Discord.
     */
    username: 'CMSC 435 Bot',

    /**
     * Maximum number of characters allowed in a Discord Embed's `description`
     * field, which is where we put blog posts for rich formatting.
     *
     * @see {@link src/types/embed.ts Embed}
     */
    maxDescLen: 2000
}

export default config
