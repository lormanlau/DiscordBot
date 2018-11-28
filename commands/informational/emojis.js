const Command = require(`${process.cwd()}/base/Command.js`);

class emojis extends Command {
  constructor(client) {
    super(client, {
      name: "emojis",
      description: "Generate a list of the emojis on the server!",
      usage: "emojis",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    let emojis;
    if (msg.guild.emojis.size === 0)
      emojis = "There are no emojis on this server.";
    else
      emojis = `**Server Emoji:**\n${msg.guild.emojis
        .map(e => "`:" + e.name + ":` -> " + e.toString() + "\n")
        .join("")}`;
    msg.channel.send(emojis);
  }
}

module.exports = emojis;
