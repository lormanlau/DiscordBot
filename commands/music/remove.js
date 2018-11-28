const Command = require(`${process.cwd()}/base/Command.js`);

class remove extends Command {
  constructor(client) {
    super(client, {
      name: "remove",
      description: "Remove a song from the queue by index.",
      usage: "remove <index>",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    bot.music.bot.removeFunction(msg, args.join(" "), args);
  }
}

module.exports = remove;
