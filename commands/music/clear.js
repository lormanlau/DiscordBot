const Command = require(`${process.cwd()}/base/Command.js`);

class clear extends Command {
  constructor(client) {
    super(client, {
      name: "clear",
      description: "Clears the queue of songs.",
      usage: "clear",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    bot.music.bot.clearFunction(msg, args.join(" "), args);
  }
}

module.exports = clear;
