import { readFileSync } from "fs";

import {
  CategoryChannel,
  Client,
  ClientOptions,
  EmbedBuilder,
  GatewayIntentBits,
  Snowflake,
  codeBlock,
} from "discord.js";

import { QuickDB } from "quick.db";

import loadCommands from "handlers/commandLoader";
import database from "handlers/databaseLoader";
import loadEvents from "handlers/eventLoader";

import { MessageCommand, SlashCommand } from "modules/command";

const package_json = JSON.parse(readFileSync("./package.json", "utf-8"));

export interface Config {
  bot: {
    token: string;
    prefix: string;

    owners: string[];
    managers: string[];

    channels: {
      error: string;
    };
  };
}

const config = (await import("./config")).default;

interface Options extends ClientOptions {
  version: string;
  prefix?: string;

  owners?: string[];
  managers?: string[];
}

export default class Bot extends Client {
  constructor(options: Options) {
    super(options);

    this.version = options.version;
    this.prefix = options.prefix || "c!";

    this.owners = options.owners || [];
    this.managers = options.managers || [];

    this.messageCommands = new Map();
    this.slashCommands = new Map();

    this.db = database;

    loadEvents(this);
    loadCommands(this);
  }

  public readonly prefix: string;

  public readonly version: string;

  public async reportError(error: {
    stack?: string;
    message: string;
  }): Promise<void> {
    const channel = await this.channels.fetch(config.bot.channels.error);
    if (!channel || !channel.isTextBased()) return;
    if (channel instanceof CategoryChannel) return;

    channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("An error has occurred!")
          .setDescription(codeBlock("js", error.stack || error.message))
          .setColor("Random"),
      ],
    });
  }

  public readonly owners: Snowflake[];
  public readonly managers: Snowflake[];

  public readonly messageCommands: Map<string, MessageCommand>;
  public readonly slashCommands: Map<string, SlashCommand>;

  public readonly db: QuickDB;
}

const bot = new Bot({
  intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
  version: package_json.version,
  prefix: config.bot.prefix,

  owners: config.bot.owners,
  managers: config.bot.managers,
});

bot.login(config.bot.token);
