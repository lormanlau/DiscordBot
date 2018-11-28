const Command = require(`${process.cwd()}/base/Command.js`);

class blacklist extends Command {
  constructor(client) {
    super(client, {
      name: "blacklist",
      description: "Blacklist someone from using the bot.",
      usage: "blacklist <mention>",
      aliases: [],
      permLevel: 7
    });
  }

  async run(bot, msg, args, level) {
    var blacklisted = await bot.database.blacklist
      .getAll(msg.mentions.users.first().id)
      .count()
      .gt(0);

    if (!msg.mentions.users.first())
      return msg.reply("please mention someone to blacklist!");
    if (blacklisted) return msg.reply("they're already on the blacklist!");

    args.shift();
    var reason = args.join(" ") || "No Reason Specified";

    bot.database.update(
      "blacklist",
      { reason: reason, id: msg.mentions.users.first().id },
      bot.logger
    );
    msg.reply(
      "successfully blacklisted **" +
        msg.mentions.users.first().username +
        "**."
    );
    bot.database.blacklist = bot.database.r.db("robot").table("blacklist");
  }
}

module.exports = blacklist;
