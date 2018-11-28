const Command = require(`${process.cwd()}/base/Command.js`);

class evaluate extends Command {
  constructor(client) {
    super(client, {
      name: "eval",
      description: "Evaluates arbitrary Javascript code.",
      usage: "eval <code>",
      aliases: [],
      permLevel: 8
    });
  }

  async run(bot, msg, args, level) {
    const { MessageEmbed } = require("discord.js"),
      util = require("util");

    var code = args.join(" ");
    var embed = new MessageEmbed()
      .setFooter(msg.author.username, msg.author.avatarURL())
      .setTimestamp();
    try {
      var evaled = await eval(code);
      var type = typeof evaled;
      var insp = util.inspect(evaled, {
        depth: 1
      });

      if (evaled === null) evaled = "null";

      embed
        .setAuthor("Javascript Evaluation Complete", bot.user.avatarURL())
        .setColor(0x00ff00)
        .addField(
          "Result",
          "```js\n" +
            clean(evaled.toString().replace(bot.token, "REDACTED")) +
            "```"
        );
      if (evaled instanceof Object && insp.toString().length < 1025) {
        embed.addField(
          "Inspect",
          "```js\n" + insp.toString().replace(bot.token, "REDACTED") + "```"
        );
      } else {
        embed.addField("Type", "```js\n" + type + "```");
      }
      msg.channel.send({ embed: embed });
    } catch (err) {
      embed
        .setAuthor(
          "Error Thrown in Javascript Evaluation",
          bot.user.avatarURL()
        )
        .setColor(0xff0000)
        .addField("Error", "```LDIF\n" + clean(err.message) + "```");
      msg.channel.send({ embed: embed });
    }

    function clean(text) {
      if (typeof text === "string") {
        return text
          .replace(/`/g, "`" + String.fromCharCode(8203))
          .replace(/@/g, "@" + String.fromCharCode(8203));
      } else {
        return text;
      }
    }
  }
}

module.exports = evaluate;
