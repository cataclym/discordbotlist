import type { Client } from "discord.js";
import type { BotStats } from "../../api";
import { BaseAdapter } from "./base";

export class DjsAdapter extends BaseAdapter {
    public botId: string;

    constructor(protected client: Client<true>) {
        super();
        this.botId = client.user.id;
    }

    getBotStats(): BotStats {
        return {
            guilds: this.client.guilds.cache.size,
            users: this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
        };
    }
}
