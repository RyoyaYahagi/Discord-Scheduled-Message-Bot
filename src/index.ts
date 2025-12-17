/**
 * Discord Scheduled Message Bot - Cloudflare Workers版
 * 
 * Cron Triggerで指定時刻にDiscord Webhookへメッセージを送信
 */

export interface Env {
    DISCORD_WEBHOOK_URL: string;
    YOUTUBE_URL: string;
    MENTION_IDS?: string;
}

/**
 * メンションIDをDiscordメンション形式に変換
 * 例: "user:123,role:456" -> "<@123> <@&456>"
 */
function parseMentions(mentionIds: string | undefined): string {
    if (!mentionIds) return "";

    const mentions: string[] = [];
    for (const item of mentionIds.split(",")) {
        const trimmed = item.trim();
        if (trimmed.startsWith("user:")) {
            mentions.push(`<@${trimmed.replace("user:", "")}>`);
        } else if (trimmed.startsWith("role:")) {
            mentions.push(`<@&${trimmed.replace("role:", "")}>`);
        } else if (trimmed) {
            mentions.push(`<@${trimmed}>`);
        }
    }
    return mentions.join(" ");
}

/**
 * Discord Webhookにメッセージを送信
 */
async function sendDiscordMessage(env: Env): Promise<Response> {
    const mentionText = parseMentions(env.MENTION_IDS);
    const mentionPart = mentionText ? `${mentionText} ` : "";
    const message = `${mentionPart}早く来い\n${env.YOUTUBE_URL}`;

    const response = await fetch(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: message,
        }),
    });

    if (!response.ok) {
        console.error(`Discord webhook failed: ${response.status}`);
        return new Response(`Error: ${response.status}`, { status: 500 });
    }

    console.log("Message sent successfully!");
    return new Response("OK", { status: 200 });
}

export default {
    /**
     * Cron Triggerで呼び出される
     */
    async scheduled(
        controller: ScheduledController,
        env: Env,
        ctx: ExecutionContext
    ): Promise<void> {
        console.log(`Cron triggered at ${new Date().toISOString()}`);
        await sendDiscordMessage(env);
    },

    /**
     * HTTPリクエストで手動テスト用
     * GET /test でメッセージを送信
     */
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname === "/test") {
            return await sendDiscordMessage(env);
        }

        return new Response("Discord Scheduled Bot\n\nGET /test - Send test message", {
            status: 200,
        });
    },
};
