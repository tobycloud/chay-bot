import Bot from "bot";
import { Events, Interaction } from "discord.js";
import Event from "modules/event";
import { BaseExceptions, GuildExceptions } from "modules/exceptions";

async function slashCommand(interaction: Interaction) {
  if (!interaction.isChatInputCommand() && !interaction.isAutocomplete())
    return;

  if (interaction.user.bot) return;

  const bot = interaction.client as Bot;
  const command = bot.slashCommands.get(interaction.commandName);

  if (!command) return;

  if (command.disabled) {
    if (interaction.isAutocomplete())
      return interaction.respond([
        {
          name: "Lệnh này đã bị tắt",
          value: "Lệnh này đã bị tắt",
        },
      ]);

    if (!bot.owners.includes(interaction.user.id)) {
      if (command.ownerOnly) throw new GuildExceptions.NoPermissions();
      if (!bot.managers.includes(interaction.user.id) && command.managerOnly)
        throw new GuildExceptions.NoPermissions();
    }

    return interaction.reply("Lệnh này đã bị tắt");
  }

  if (interaction.isAutocomplete()) {
    if (!command.completion) return;

    if (!bot.owners.includes(interaction.user.id)) {
      if (command.ownerOnly) return;
      if (!bot.managers.includes(interaction.user.id) && command.managerOnly)
        return;
    }

    try {
      await command.completion(interaction);
    } catch (error) {
      reportError(error);
    }
  }

  if (interaction.isChatInputCommand()) {
    if (!bot.owners.includes(interaction.user.id)) {
      if (command.ownerOnly) throw new GuildExceptions.NoPermissions();
      if (!bot.managers.includes(interaction.user.id) && command.managerOnly)
        throw new GuildExceptions.NoPermissions();
    }

    try {
      await command.run(interaction);
    } catch (error) {
      if (error instanceof BaseExceptions.UserError)
        return interaction.reply(error.message);

      if (!interaction.replied)
        interaction.reply("Có lỗi xảy ra khi chạy lệnh này :<");
      else interaction.followUp("Có lỗi xảy ra khi chạy lệnh này :<");
      bot.reportError(error as { stack?: string; message: string });
    }
  }
}

export default new Event({
  eventName: Events.InteractionCreate,
  run: slashCommand,
});
