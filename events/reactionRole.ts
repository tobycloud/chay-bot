import { Events, TextChannel } from "discord.js";
import Event from "modules/event";

const roles: Record<string, string> = {
  "1138091793926336642": "1145143695574843473", // Jenkins Master
  "1128207337035927582": "1145172105831391383", // Gigabit Upload Speed
  "1120092466197037116": "1145172169383485550", // SIUUUUUU
  "1122201813131739157": "1145179975599788063", // Notifications Ping
};

export default new Event({
  eventName: Events.ClientReady,
  async run(client) {
    const guild = await client.guilds.fetch("1116005776323002368");
    const channel = (await guild.channels.fetch(
      "1145144080976846979"
    )) as TextChannel;
    const message = await channel.messages.fetch("1145170280000536626");
    const collector = message.createReactionCollector({ dispose: true });
    collector.on("collect", async (reaction, user) => {
      if (reaction.partial) reaction = await reaction.fetch();

      if (!reaction.emoji.id) return;
      const roleID = roles[reaction.emoji.id];
      if (roleID) await guild.members.cache.get(user.id)!.roles.add(roleID);
    });
    collector.on("remove", async (reaction, user) => {
      if (reaction.partial) reaction = await reaction.fetch();

      if (!reaction.emoji.id) return;
      const roleID = roles[reaction.emoji.id];
      if (roleID) await guild.members.cache.get(user.id)!.roles.remove(roleID);
    });
  },
});
