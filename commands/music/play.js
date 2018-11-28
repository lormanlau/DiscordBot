const Command = require(`${process.cwd()}/base/Command.js`);

class play extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      description: "Play a song using the music module",
      usage: "play <search-terms>",
      aliases: ["p"],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    bot.music.bot.playFunction(msg, args.join(" "), args);
  }
}

module.exports = play;
