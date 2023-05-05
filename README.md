# discordbotlist

Easily add support for voting and display your bot's stats on [discordbotlist.com](https://discordbotlist.com) with just a few lines of code. This package provides support out of the box for [discord.js](https://www.npmjs.com/package/discord.js) and [eris](https://www.npmjs.com/package/eris) bots, but can easily be adapted to work with any library of your choosing.

## Installation and Requirements

This package requires **Node 16** or newer. If you're using discord.js v14, you should already meet this requirement. Install discordbotlist using:

```
npm i --save discordbotlist
```

### Creating an API token

To post stats and fetch recent votes using this package, you'll need a discordbotlist API token. **This is not your Discord bot token. Do not use your Discord bot token as an API token or webhook secret.** To create an API token for your bot:

-   Visit its page on [discordbotlist.com](https://discordbotlist.com)
-   Locate the Admin section
-   Click "Generate Token"

### Setting up a Webhook Secret

To use webhooks, you will first need to create a Webhook Secret. **This is not your Discord bot token. Do not use your Discord bot token as an API token or webhook secret.** To configure your bot's Webhook Secret:

-   Visit its page on [discordbotlist.com](https://discordbotlist.com)
-   Click the "Edit" button
-   Enter a value in the Webhook Secret input and click "Edit"

## Creating a Client

For most, the easiest way to use this package will be by creating a client using the wrapper function for your library.

### Creating a Client (discord.js)

```ts
import { createDjsClient } from "discordbotlist";
import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("ready", () => {
    const dbl = createDjsClient(DBL_API_TOKEN, client);
});

client.login(TOKEN);
```

### Creating a Client (eris)

```ts
import { createErisClient } from "discordbotlist";
import { Client } from "eris";

const client = new Client(TOKEN, { intents: ["guilds"] });

client.on("ready", () => {
    const dbl = createErisClient(DBL_API_TOKEN, client);
});

client.connect();
```

## Posting Bot Stats

After creating a client, you can start automatically posting your bot's stats to discordbotlist:

```ts
dbl.startPosting(/* optional interval, defaults to every hour */);
```

## Setting up Voting

This package can be used to implement voting by either exposing a webhook endpoint discordbotlist will call, or periodically checking for recent votes. The former is recommended in most cases and should be preferred if it can be used for your bot.

### Using Webhooks

This package provides [express](https://www.npmjs.com/package/express) middleware that can be used to easily set up vote rewards using webhooks.

### Using Webhooks (with a Client)

After creating a dbl client, it can be used to set up vote rewards with an event-based interface:

```ts
import express from "express";

const app = express();
app.use(express.json());

app.post("/dbl", dbl.webhook(DBL_WEBHOOK_SECRET));

dbl.on("vote", vote => {
    console.log(`${vote.username}#${vote.discriminator} voted!`);
});

app.listen(PORT);
```

### Using Webhooks (no Client)

If you don't want to use a client, you can use the `upvoteListener` function instead:

```ts
import { upvoteListener } from "discordbotlist";
import express from "express";

const app = express();
app.use(express.json());

app.post(
    "/dbl",
    upvoteListener(DBL_WEBHOOK_SECRET, vote => {
        console.log(`${vote.username}#${vote.discriminator} voted!`);
    })
);

app.listen(PORT);
```

### Using Polling

If you're running in an environment where webhooks aren't suitable, you can also support voting by using polling. To use polling, call `Client#startPolling`, then listen for the `vote` event just like webhooks:

```ts
dbl.startPolling(/* optional interval, defaults to every five minutes */);

dbl.on("vote", vote => {
    console.log(`${vote.username}#${vote.discriminator} voted!`);
});
```

## Post Bot Commands

If your bot uses slash commands, you can display your bot's commands on DBL! You can post your commands to DBL the same way you post them to Discord. Use `Client#postBotCommands` to post your bot's commands:

```ts
dbl.postBotCommands([
    {
        name: "help",
        description: "View a list of the bot's commands.",
    },
]);
```

## Discord Bot List API

This package also provides a strongly typed interface for interacting with DBL's REST API if desired. All types and functionality for this API wrapper is accessible from `discordbotlist/api`. For example, to manually post a bot's stats without a Client instance:

```ts
import { postBotStats } from "discordbotlist";

postBotStats(DBL_API_TOKEN, DISCORD_BOT_ID, {
    guilds: 100,
    users: 1000,
});
```
