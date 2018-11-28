const Command = require(`${process.cwd()}/base/Command.js`);

class pause extends Command {
  constructor(client) {
    super(client, {
      name: "pause",
      description: "Pause the currently playing song.",
      usage: "pause",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    bot.music.bot.pauseFunction(msg, args.join(" "), args);
  }
}

module.exports = pause;
