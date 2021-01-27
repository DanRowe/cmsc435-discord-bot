export type snowflake = string
export interface User {

}

/**
 * The structure of the payload for Discord Webhooks
 *
 * @see https://discord.com/developers/docs/resources/webhook#webhook-resource
 */
export interface Webhook {
    /** the id of the webhook */
    id: snowflake
    /**
     * the {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types type} of the webhook
     */
    type: number
    /** the guild id this webhook is for */
    guild_id?: snowflake
    /**	the channel id this webhook is for */
    channel_id: string
    /**	the user this webhook was created by (not returned when getting a webhook with its token) */
    user?: User
    /** the default name of the webhook */
    name?: string
    /** the default avatar of the webhook */
    avatar?: string
    /** the secure token of the webhook (returned for Incoming Webhooks) */
    token?: string
    /** the bot/OAuth2 application that created this webhook */
    application_id?: snowflake
}


export type EmbedType = "rich" | "image" | "video" | "gifv" | "article" | "link"

export type AllowedMentionType = "roles" | "users" | "everyone"

/**
 * {@link https://discord.com/api/webhooks/803787431706624020/5zLZjMUlEqP6D8Ic16ycxXM7rWqkkmO6qtWSv_mRiiURMvKur5nx_3OyoXx5qGCza9DX Allowed Mentions Object}
 */
export interface AllowedMentions {
    parse: AllowedMentionType[]
    roles?: snowflake[]
    users?: snowflake[]
    replied_user?: boolean
}
