const Command = require(`${process.cwd()}/base/Command.js`);

class volume extends Command {
  constructor(client) {
    super(client, {
      name: "volume",
      description: "Adjusts the volume of the player.",
      usage: "volume <number>",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    bot.music.bot.volumeFunction(msg, args.join(" "), args);
  }
}

module.exports = volume;
