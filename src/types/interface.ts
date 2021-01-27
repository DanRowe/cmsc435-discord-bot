import { AllowedMentions } from './types'
import { Embed } from './embed'

/**
 * POST /webhooks/{webhook.id}/{webhook.token}
 *
 * @see {@link https://discord.com/api/webhooks/803787431706624020/5zLZjMUlEqP6D8Ic16ycxXM7rWqkkmO6qtWSv_mRiiURMvKur5nx_3OyoXx5qGCza9DX ExecuteWebhook docs}
 */
export interface ExecuteWebhookBody {
    content?: string
    username?: string
    avatar_url?: string
    tts?: boolean
    file?: string
    embeds?: Embed[]
    payload_json?: string
    allowed_mentions?: AllowedMentions
}
