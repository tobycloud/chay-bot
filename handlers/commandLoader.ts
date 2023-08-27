import { lstatSync, readdirSync } from "fs";

import Bot from "Bot";
import { MessageCommand, SlashCommand } from "modules/command";

export default async function loadCommands(folody: Bot) {
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
      return folody.slashCommands.set(command.data.name, command);

    folody.messageCommands.set(command.name, command);
    command.aliases?.forEach((alias) =>
      folody.messageCommands.set(alias, command)
    );
  }

  for (const folder of ["./messageCommands/", "./slashCommands/"])
    readdirSync(folder).forEach(async (item) => loadCommand(folder, item));
}
