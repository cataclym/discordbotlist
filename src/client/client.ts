import type { Client as DjsClient, RESTPutAPIApplicationCommandsJSONBody } from "discord.js";
import type { Client as ErisClient } from "eris";
import { clearInterval, setInterval } from "node:timers";
import { TypedEmitter } from "tiny-typed-emitter";
import { BotStats, RecentVotes, Vote, fetchRecentVotes, postBotCommands, postBotStats } from "../api";
import { DBLError } from "../internal";
import { upvoteListener } from "../webhooks";
import { BaseAdapter, DjsAdapter, ErisAdapter } from "./adapters";

const WEBHOOKS_SUGGESTION =
    "[discordbotlist] More than 500 users have voted for your bot in the past 12 hours. You may want to consider switching to webhooks to provide a more seamless experience for your users. Learn more at https://docs.discordbotlist.com/vote-webhooks";

export interface DBLClientEvents<T extends BaseAdapter> {
    error: (error: DBLError<{ client: DBLClient<T>; error: unknown }>, client: DBLClient<T>) => any;
    posted: (stats: BotStats, client: DBLClient<T>) => any;
    vote: (vote: Vote, client: DBLClient<T>) => any;
}

export class DBLClient<T extends BaseAdapter> extends TypedEmitter<DBLClientEvents<T>> {
    private _useWebhooksSuggestionSent = false;
    private _lastVote = new Date();
    private _post: NodeJS.Timer | null = null;
    private _voteCheck: NodeJS.Timer | null = null;

    constructor(public apiKey: string, public adapter: T) {
        super();
    }

    /** Get the bot's recent votes (within the past 12 hours). */
    async fetchRecentVotes(): Promise<RecentVotes> {
        try {
            return await fetchRecentVotes(this.apiKey, this.adapter.botId);
        } catch (e) {
            const error = new DBLError("Failed to fetch recent votes", {
                client: this,
                error: e,
            });
            this.emit("error", error, this);
            throw error;
        }
    }

    /** Post the slash commands your bot supports. These will be shown on your bot page. */
    async postBotCommands(commands: RESTPutAPIApplicationCommandsJSONBody): Promise<void> {
        try {
            await postBotCommands(this.apiKey, this.adapter.botId, commands);
        } catch (e) {
            const error = new DBLError("Failed to post bot commands", {
                client: this,
                error: e,
            });
            this.emit("error", error, this);
            throw error;
        }
    }

    /** Post bot stats to be displayed on the website. */
    async postBotStats(stats?: BotStats): Promise<void> {
        try {
            stats ??= await this.adapter.getBotStats();
            await postBotStats(this.apiKey, this.adapter.botId, stats);
            this.emit("posted", stats, this);
        } catch (e) {
            const error = new DBLError("Failed to post bot stats", {
                client: this,
                error: e,
            });
            this.emit("error", error, this);
            throw error;
        }
    }

    /** Stops this client from posting stats to DBL. */
    stopPosting() {
        if (this._post) {
            clearInterval(this._post);
            this._post = null;
        }
    }

    /**
     * Starts posting stats to DBL with the specified interval.
     * @param interval Frequency with which to post bot stats. Defaults to every hour.
     */
    startPosting(interval = 3600000) {
        this.stopPosting();
        this.postBotStats().catch(() => null);
        this._post = setInterval(() => this.postBotStats().catch(() => null), interval).unref();
    }

    /** Stops this client from polling for recent votes from DBL. */
    stopPolling() {
        if (this._voteCheck) {
            clearInterval(this._voteCheck);
            this._voteCheck = null;
        }
    }

    private async _checkVotes() {
        const recent = await this.fetchRecentVotes().catch(() => null);
        if (!recent) return;
        if (!this._useWebhooksSuggestionSent && recent.votes.length >= 500) {
            console.warn(WEBHOOKS_SUGGESTION);
            this._useWebhooksSuggestionSent = true;
        }
        recent.votes.filter(vote => vote.time > this._lastVote).forEach(vote => this.emit("vote", vote, this));
        this._lastVote = new Date();
    }

    /**
     * Starts polling for recent votes from DBL with the specified interval.
     * @param interval Frequency with which to post bot stats. Defaults to every 5 minutes.
     */
    startPolling(interval = 300000) {
        this.stopPolling();
        this._checkVotes().catch(() => null);
        this._voteCheck = setInterval(() => this._checkVotes().catch(() => null), interval);
    }

    webhook(secret: string) {
        return upvoteListener(secret, vote => this.emit("vote", vote, this));
    }
}

export function createDjsClient(apiKey: string, client: DjsClient<true>) {
    return new DBLClient(apiKey, new DjsAdapter(client));
}

export function createErisClient(apiKey: string, client: ErisClient) {
    return new DBLClient(apiKey, new ErisAdapter(client));
}
