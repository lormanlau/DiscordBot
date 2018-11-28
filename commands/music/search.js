const Command = require(`${process.cwd()}/base/Command.js`);

class search extends Command {
  constructor(client) {
    super(client, {
      name: "search",
      description: "Searches YouTube for a certain query.",
      usage: "search <query>",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    bot.music.bot.searchFunction(msg, args.join(" "), args);
  }
}

module.exports = search;
