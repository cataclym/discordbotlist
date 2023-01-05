/** Bot stats to be displayed on the website. */
export interface BotStats {
    /** The amount of guilds. */
    guilds: number;
    /** The shard ID if you wish to send per-shard statistics. The statistics will be grouped together and displayed on the website. */
    shard_id?: number;
    /** The amount of users. */
    users?: number;
    /** The amount of voice connections. */
    voice_connections?: number;
}

export interface APIRecentUpvotesResponse {
    upvotes: APIRecentUpvote[];
    total: number;
}

export interface APIRecentUpvote {
    avatar?: string;
    discriminator: string;
    username: string;
    user_id: string;
    timestamp: string;
}

/** Votes a bot received within the past 12 hours. */
export interface RecentVotes {
    votes: Vote[];
    total: number;
}

/** A vote for a bot. */
export interface Vote {
    /** The avatar hash of the user. */
    avatar?: string;
    /** The discriminator of the user who voted. */
    discriminator: string;
    /** The ID of the user who voted. */
    id: string;
    /** The username of the user who voted. */
    username: string;
    /** The time this user voted. */
    time: Date;
}
