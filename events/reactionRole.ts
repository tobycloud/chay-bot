import { Events, TextChannel } from "discord.js";
import Event from "modules/event";

export default new Event({
  eventName: Events.ClientReady,
  async run(client) {
    const guild = await client.guilds.fetch("1116005776323002368");
    (
      await (
        (await guild.channels.fetch("1145144080976846979")) as TextChannel
      ).messages.fetch("1145170280000536626")
    )
      .createReactionCollector()
      .on("collect", async (reaction, user) => {
        if (reaction.partial) reaction = await reaction.fetch();
        let roleID: string | undefined;
        switch (reaction.emoji.id) {
          case "1138091793926336642": // Jenkins Master
            roleID = "1145143695574843473";
          case "1128207337035927582": // Gigabit Upload Speed
            roleID = "1145172105831391383";
          case "1120092466197037116": // SIUUUUUU
            roleID = "1145172169383485550";
        }

        if (roleID) await guild.members.cache.get(user.id)!.roles.add(roleID);
      });
  },
});
