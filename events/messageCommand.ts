import Bot from "bot.js";
import {
  EmbedBuilder,
  Events,
  Message,
  ThreadChannel,
  codeBlock,
  inlineCode,
  userMention,
} from "discord.js";
import Event from "modules/event.js";
import { BaseExceptions, GuildExceptions } from "modules/exceptions/index.js";

async function messageCommand(message: Message) {
  if (message.author.bot) return;
  if (!message.inGuild()) return;
  if (!message.channel.isTextBased()) return;

  const bot = message.client as Bot;
  if (!bot.user) return;

  const prefix = bot.prefix;

  if (message.content == userMention(bot.user.id))
    return message.reply(`Prefix của bot là ${inlineCode(prefix)} nhé :>`);

  if (
    !message.content.startsWith(prefix) &&
    !message.content.startsWith(userMention(bot.user.id))
  )
    return;

  const [commandName, ...args] = message.content
    .slice(
      message.content.startsWith(prefix)
        ? prefix.length
        : userMention(bot.user.id).length
    )
    .trim()
    .split(/ +/g);

  if (!commandName) return;

  const command = bot.messageCommands.get(commandName);
  if (!command) return;

  if (command.disabled) {
    if (!bot.owners.includes(message.author.id)) {
      if (command.ownerOnly) throw new GuildExceptions.NoPermissions();
      if (!bot.managers.includes(message.author.id) && command.managerOnly)
        throw new GuildExceptions.NoPermissions();
    }

    return message.reply("Lệnh này đã bị tắt");
  }

  if (!bot.owners.includes(message.author.id)) {
    if (command.ownerOnly) throw new GuildExceptions.NoPermissions();
    if (!bot.managers.includes(message.author.id) && command.managerOnly)
      throw new GuildExceptions.NoPermissions();
  }

  if (!(message.channel instanceof ThreadChannel))
    if (command.nsfw && !message.channel.nsfw)
      return message.reply(
        "Đi qua cái channel nsfw sú sú kia rồi mới dùng lệnh này nhé :>"
      );

  try {
    await command.run(message, ...args);
  } catch (error) {
    if (error instanceof BaseExceptions.UserInputError) {
      const commandUsage = command.usage.join(" ");
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: "Lỗi cú pháp",
              iconURL: bot.user.displayAvatarURL(),
            })
            .setDescription(
              codeBlock(
                `${prefix}${command.name} ${commandUsage}\n` +
                  " ".repeat(
                    `${prefix}${command.name} `.length +
                      commandUsage.indexOf(error.parameter)
                  ) +
                  "^".repeat(error.parameter.length)
              ) + `Thiếu tham số ${inlineCode(error.parameter)}`
            )
            .setColor("Random"),
        ],
      });
    }

    if (error instanceof BaseExceptions.UserError)
      return message.reply(error.message);

    message.reply("Có lỗi xảy ra khi chạy lệnh này :<");
    bot.reportError(error as { stack?: string; message: string });
  }
}

export default new Event({
  eventName: Events.MessageCreate,
  run: messageCommand,
});
