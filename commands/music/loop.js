const Command = require(`${process.cwd()}/base/Command.js`);

class loop extends Command {
  constructor(client) {
    super(client, {
      name: "loop",
      description: "Loops the currently playing song or the queue",
      usage: "loop",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    bot.music.bot.loopFunction(msg, args.join(" "), args);
  }
}

module.exports = loop;
