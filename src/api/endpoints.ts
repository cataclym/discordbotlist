import type { RESTPutAPIApplicationCommandsJSONBody } from "discord.js";
import { fetch, Headers } from "discord.js/node_modules/undici";
import { DBLError } from "../internal";
import type { APIRecentUpvotesResponse, BotStats, RecentVotes } from "./types";

export const BASE_URL = "https://discordbotlist.com/api/v1";

export function route<Path extends string>(path: Path): `${typeof BASE_URL}${Path}` {
    return `${BASE_URL}${path}`;
}

/**
 * Post bot stats to be displayed on the website.
 * @param apiKey API key generated by selecting "Generate token" in the Admin section of your bot's page. **Do not use your Discord bot token.**
 * @param botId ID of the bot to post stats for.
 * @param stats Stats as they should appear on the website.
 */
export async function postBotStats(apiKey: string, botId: string, stats: BotStats): Promise<void> {
    const res = await fetch(route(`/bots/${botId}/stats`), {
        body: JSON.stringify(stats),
        headers: new Headers({
            Authorization: apiKey,
            "Content-Type": "application/json",
        }),
        method: "POST",
    });
    if (!res.ok) throw new DBLError(res.statusText, { response: res });
}

/**
 * Get recent votes (within the past 12 hours) for a bot.
 * @param apiKey API key generated by selecting "Generate token" in the Admin section of your bot's page. **Do not use your Discord bot token.**
 * @param botId ID of the bot to get recent votes for.
 */
export async function fetchRecentVotes(apiKey: string, botId: string): Promise<RecentVotes> {
    const res = await fetch(route(`/bots/${botId}/upvotes`), {
        headers: new Headers({
            Authorization: apiKey,
        }),
    });
    if (!res.ok) throw new DBLError(res.statusText, { response: res });
    const data = (await res.json()) as APIRecentUpvotesResponse;
    return {
        total: data.total,
        votes: data.upvotes.map(vote => ({
            avatar: vote.avatar,
            discriminator: vote.discriminator,
            id: vote.user_id,
            username: vote.username,
            time: new Date(vote.timestamp),
        })),
    };
}

/**
 * Post the slash commands your bot supports. These will be shown on your bot page.
 * @param apiKey API key generated by selecting "Generate token" in the Admin section of your bot's page. **Do not use your Discord bot token.**
 * @param botId ID of the bot to post commands for.
 * @param commands The commands to post, in the same format as they'd be sent to Discord.
 */
export async function postBotCommands(
    apiKey: string,
    botId: string,
    commands: RESTPutAPIApplicationCommandsJSONBody
): Promise<void> {
    const res = await fetch(route(`/bots/${botId}/commands`), {
        body: JSON.stringify(commands),
        headers: new Headers({
            Authorization: apiKey,
            "Content-Type": "application/json",
        }),
        method: "POST",
    });
    if (!res.ok) throw new DBLError(res.statusText, { response: res });
}
