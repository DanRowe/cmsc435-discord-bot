
/**
 * {@link https://discord.com/api/webhooks/803787431706624020/5zLZjMUlEqP6D8Ic16ycxXM7rWqkkmO6qtWSv_mRiiURMvKur5nx_3OyoXx5qGCza9DX Embed Object}
 */
export interface Embed {
    title?: string
    type?: EmbedType
    description?: string
    url?: string
    /**
     * ISO-8601 timestamp string
     */
    timestamp?: string
    color?: number
    footer?: EmbedFooter
    image?: EmbedImage
    thumbnail?: EmbedThumbnail
    video?: EmbedVideo
    provider?: EmbedProvider
    author?: EmbedAuthor
    fields?: EmbedField[]
}

export type EmbedType = 'rich' | 'image' | 'video' | 'gifv' | 'article' | 'link'
/**
 * {@link https://discord.com/api/webhooks/803787431706624020/5zLZjMUlEqP6D8Ic16ycxXM7rWqkkmO6qtWSv_mRiiURMvKur5nx_3OyoXx5qGCza9DX Embed Footer Object}
 */
export interface EmbedFooter {
    text: string
    icon_url?: string
    proxy_icon_url?: string
}

/**
 * {@link https://discord.com/api/webhooks/803787431706624020/5zLZjMUlEqP6D8Ic16ycxXM7rWqkkmO6qtWSv_mRiiURMvKur5nx_3OyoXx5qGCza9DX Embed Field Object}
 */
export interface EmbedField {
    name?: string
    value?: string
    inline?: boolean
}

// !! TODO !!

interface EmbedImage { }
interface EmbedVideo { }
interface EmbedThumbnail { }
interface EmbedProvider { }
interface EmbedAuthor { }
