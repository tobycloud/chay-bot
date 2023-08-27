import { Events } from "discord.js";
import Event from "modules/event";

export default new Event({
  eventName: Events.ClientReady,
  async run(client) {
    if (!client.user) return;
    console.log(`Logged in as ${client.user.tag}!`);
  },
});
