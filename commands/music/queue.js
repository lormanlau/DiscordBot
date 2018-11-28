const Command = require(`${process.cwd()}/base/Command.js`);

class queue extends Command {
  constructor(client) {
    super(client, {
      name: "queue",
      description: "Displays the current song queue for the server.",
      usage: "queue",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    bot.music.bot.queueFunction(msg, args.join(" "), args);
  }
}

module.exports = queue;
