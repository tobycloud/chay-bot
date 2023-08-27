import Bot from "Bot";
import { codeBlock } from "discord.js";
import { MessageCommand } from "modules/command";
import { Required } from "modules/usageArgumentTypes";
import { inspect } from "util";

export default new MessageCommand({
  name: "eval",
  category: "misc",
  description: "Eval code",
  usage: [Required("code")],
  ownerOnly: true,
  async run(message) {
    let code = message.content
      .slice(((message.client as Bot).prefix + "eval").length)
      .trim();

    if (
      (code.startsWith("```js") && code.endsWith("```")) ||
      (code.startsWith("```ts") && code.endsWith("```"))
    )
      code = code.slice(5, -3);
    else if (code.startsWith("```") && code.endsWith("```"))
      code = code.slice(3, -3);

    try {
      const eval_result = await eval("(async () =>{" + code + "})()");

      await message.reply(codeBlock("js", inspect(eval_result, false, 0)));
    } catch (error) {
      await message.reply(codeBlock("js", String(error)));
    }
  },
});
