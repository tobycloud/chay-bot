import { lstatSync, readdirSync } from "fs";

import Bot from "bot";
import { MessageCommand, SlashCommand } from "modules/command";

export default async function loadCommands(bot: Bot) {
  async function loadCommand(root: string, item: string): Promise<any> {
    if (lstatSync(root + item).isDirectory()) {
      const newRoot = root + item + "/";
      return readdirSync(newRoot).forEach(async (item) =>
        loadCommand(newRoot, item)
      );
    }
    const command = (await import(`.${root}${item}`)).default as
      | MessageCommand
      | SlashCommand;
    if (command instanceof SlashCommand)
      return bot.slashCommands.set(command.data.name, command);

    bot.messageCommands.set(command.name, command);
    command.aliases?.forEach((alias) =>
      bot.messageCommands.set(alias, command)
    );
  }

  for (const folder of ["./messageCommands/", "./slashCommands/"])
    readdirSync(folder).forEach(async (item) => loadCommand(folder, item));
}
