const Command = require(`${process.cwd()}/base/Command.js`);

class skip extends Command {
  constructor(client) {
    super(client, {
      name: "skip",
      description: "Skips the currently playing song.",
      usage: "skip",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    bot.music.bot.skipFunction(msg, args.join(" "), args);
  }
}

module.exports = skip;
