import Bot from "bot";
import { EmbedBuilder, inlineCode, Message } from "discord.js";
import { MessageCommand } from "modules/command";
import { Optional } from "modules/usageArgumentTypes";

async function helpCommand(message: Message, commandName?: string) {
  if (!message.guild) return;
  const bot = message.client as Bot;

  if (commandName) {
    const command = bot.messageCommands.get(commandName);
    if (!command) return message.reply("Command not found.");

    let commandUsage = "";

    const embed = new EmbedBuilder()
      .setTitle(inlineCode(bot.prefix + command.name))
      .setDescription(command.description)
      .setColor("Random")
      .setFields({
        name: "Category",
        value: command.category ?? "None",
        inline: true,
      })
      .setFooter({
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      });

    if (command.aliases.length > 0)
      embed.addFields([{ name: "Aliases", value: command.aliases.join(", ") }]);

    if (command.usage.length > 0)
      command.usage.forEach(
        (usage) =>
          (commandUsage += " " + usage.wrap[0] + usage.argument + usage.wrap[1])
      );
    embed.addFields([
      {
        name: "Usage",
        value: inlineCode(bot.prefix + command.name + commandUsage),
      },
    ]);

    return message.reply({ embeds: [embed] });
  }

  const categories = new Map<string, MessageCommand[]>();
  for (const command of bot.messageCommands.values()) {
    if (command.managerOnly || command.ownerOnly) continue;

    const category = command.category ?? "Uncategorized";
    if (!categories.has(category)) {
      categories.set(category, [command]);
      continue;
    }
    if (categories.get(category)?.find((c) => c.name === command.name))
      continue;
    categories.get(category)!.push(command);
  }

  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Help",
      iconURL: bot.user!.displayAvatarURL(),
    })
    .setTitle("Help")
    .setColor("Random")
    .setFooter({
      text: `Requested by ${message.author.tag}`,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp();

  for (const [category, commands] of categories) {
    embed.addFields({
      name: category,
      value: commands.map((command) => inlineCode(command.name)).join("\n"),
    });
  }

  message.reply({ embeds: [embed] });
}

export default new MessageCommand({
  name: "help",
  category: "misc",
  description: "Shows help",
  usage: [Optional("command")],
  run: helpCommand,
});
