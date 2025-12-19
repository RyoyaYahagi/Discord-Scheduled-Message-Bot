/**
 * Discord Scheduled Message Bot - Cloudflare Workers版
 * 
 * Cron Triggerで指定時刻にDiscord Webhookへメッセージを送信
 */

export interface Env {
    DISCORD_WEBHOOK_URL: string;
    YOUTUBE_API_KEY?: string;
    YOUTUBE_CHANNEL_ID?: string;
    YOUTUBE_URL?: string;
    YOUTUBE_URLS?: string;
    MENTION_IDS?: string;
    TEST_SECRET?: string;
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
 * YouTube URLをランダムに1つ選択
 * YOUTUBE_URLS (カンマ区切り) を優先、なければ YOUTUBE_URL を使用
 */
function getRandomYoutubeUrl(env: Env): string {
    const urls = env.YOUTUBE_URLS || env.YOUTUBE_URL || "";
    const urlArray = urls.split(",").map(u => u.trim()).filter(u => u);
    if (urlArray.length === 0) {
        return "";
    }
    return urlArray[Math.floor(Math.random() * urlArray.length)];
}

/**
 * YouTube Data API playlistItems レスポンスの型定義
 */
interface YouTubePlaylistResponse {
    items?: Array<{
        snippet?: {
            resourceId?: {
                videoId?: string;
            };
        };
    }>;
    error?: {
        message: string;
    };
}

/** SUSURU TV のデフォルトチャンネルID */
const DEFAULT_CHANNEL_ID = "UCXcjvt8cOfwtcqaMeE7-hqA";

/**
 * YouTube Data API v3 を使ってチャンネルの最新動画を取得
 * playlistItems.list APIを使用（search.listより効率的）
 * @param env 環境変数
 * @returns 動画URL、見つからない場合やエラー時は null
 */
async function getLatestChannelVideo(env: Env): Promise<string | null> {
    if (!env.YOUTUBE_API_KEY) {
        console.error("YOUTUBE_API_KEY が設定されていません");
        return null;
    }

    // チャンネルID "UCxxx" → アップロードプレイリストID "UUxxx"
    const channelId = env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID;
    const uploadsPlaylistId = channelId.replace("UC", "UU");

    const apiUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    apiUrl.searchParams.set("key", env.YOUTUBE_API_KEY);
    apiUrl.searchParams.set("playlistId", uploadsPlaylistId);
    apiUrl.searchParams.set("part", "snippet");
    apiUrl.searchParams.set("maxResults", "1");

    try {
        const response = await fetch(apiUrl.toString());
        if (!response.ok) {
            console.error(`YouTube API エラー: ${response.status}`);
            return null;
        }

        const data = await response.json() as YouTubePlaylistResponse;
        if (data.error) {
            console.error(`YouTube API エラー: ${data.error.message}`);
            return null;
        }

        const videoId = data.items?.[0]?.snippet?.resourceId?.videoId;
        if (!videoId) {
            console.error("動画が見つかりませんでした");
            return null;
        }

        console.log(`YouTube最新動画取得成功: videoId=${videoId}`);
        return `https://www.youtube.com/watch?v=${videoId}`;
    } catch (error) {
        console.error(`YouTube API 呼び出し失敗: ${error}`);
        return null;
    }
}

/**
 * Discord Webhookにメッセージを送信
 */
async function sendDiscordMessage(env: Env): Promise<Response> {
    if (!env.DISCORD_WEBHOOK_URL) {
        console.error("DISCORD_WEBHOOK_URL が設定されていません");
        return new Response("Error: Webhook URL not configured", { status: 500 });
    }

    const mentionText = parseMentions(env.MENTION_IDS);
    const mentionPart = mentionText ? `${mentionText} ` : "";

    // YouTube API を優先、失敗時はフォールバック
    let youtubeUrl = await getLatestChannelVideo(env);
    let videoSource = "【今日のSUSURU TV】";
    if (!youtubeUrl) {
        youtubeUrl = getRandomYoutubeUrl(env);
        videoSource = "【今日の音MAD】";
        console.log("フォールバック: YOUTUBE_URLS から選択");
    }
    const message = `${mentionPart}早く来い\n${videoSource}\n${youtubeUrl}`;

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
        console.error(`Discord Webhook送信失敗: ${response.status}`);
        return new Response(`Error: ${response.status}`, { status: 500 });
    }

    console.log("メッセージ送信成功");
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
            // 認証チェック
            const token = url.searchParams.get("token");
            if (!env.TEST_SECRET || token !== env.TEST_SECRET) {
                console.error("認証失敗: 無効なトークン");
                return new Response("Unauthorized", { status: 401 });
            }
            return await sendDiscordMessage(env);
        }

        return new Response("Discord Scheduled Bot\n\nGET /test - Send test message", {
            status: 200,
        });
    },
};
