import type { Client } from "eris";
import type { BotStats } from "../../api";
import { BaseAdapter } from "./base";

export class ErisAdapter extends BaseAdapter {
    public botId: string;

    constructor(protected client: Client) {
        super();
        this.botId = client.user.id;
    }

    getBotStats(): BotStats {
        return {
            guilds: this.client.guilds.size,
            users: this.client.guilds.reduce((acc, guild) => acc + guild.memberCount, 0),
        };
    }
}
