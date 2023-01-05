import type { BotStats } from "../../api";

export abstract class BaseAdapter {
    abstract getBotStats(): BotStats | Promise<BotStats>;
    abstract botId: string;
}
