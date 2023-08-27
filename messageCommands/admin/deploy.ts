import Bot from "bot";
import { Message, SlashCommandBuilder } from "discord.js";
import { MessageCommand } from "modules/command";

// deploy slash commands
async function deployCommand(message: Message) {
  const bot = message.client as Bot;

  const guildID = message.content.split(" ")[1];

  const slashCommands: SlashCommandBuilder[] = [];
  bot.slashCommands.forEach((slashCommand) =>
    slashCommands.push(slashCommand.data)
  );

  if (guildID) {
    try {
      await bot.application?.commands.set(slashCommands, guildID);
    } catch (error) {
      return message.reply("Xin cái ID lmeo");
    }
  } else bot.application?.commands.set(slashCommands);

  message.reply("Đã deploy slash commands");
}

export default new MessageCommand({
  name: "deploy",
  category: "admin",
  description: "Deploy slash commands",
  ownerOnly: true,
  run: deployCommand,
});
