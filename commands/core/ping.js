const Command = require(`${process.cwd()}/base/Command.js`);

class ping extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "Latency and API response times.",
      usage: "ping",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    if (level > 2) {
      msg.reply(
        `you ran the command ${this.help.name} with arguments ${
          args == "" ? "[NONE]" : args
        } and Level ${level} - **${
          bot.config.PermLevels.find(l => l.level === level).name
        }**`
      );
    }
    var start = new Date(msg.createdAt).getTime();
    msg.channel
      .send("Pong!")
      .then(msg2 =>
        msg2.edit(
          "Pong! You're on the **" +
            msg.guild.name +
            "** server.\nTook " +
            (msg2.createdAt.getTime() - start) +
            " ms to respond."
        )
      )
      .catch(console.error);
  }
}

module.exports = ping;
