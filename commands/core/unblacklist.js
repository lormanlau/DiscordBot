const Command = require(`${process.cwd()}/base/Command.js`);

class unblacklist extends Command {
  constructor(client) {
    super(client, {
      name: "unblacklist",
      description: "Remove someone from the bot's blacklist.",
      usage: "unblacklist <mention>",
      aliases: [],
      permLevel: 7
    });
  }

  async run(bot, msg, args, level) {
    var blacklist = bot.database.blacklist;
    if (!msg.mentions.users.first())
      return msg.reply("please mention someone to un-blacklist!");
    if (
      (await bot.database.r
        .db("robot")
        .table("blacklist")
        .get(msg.mentions.users.first().id)) === null
    )
      return msg.reply("they're not on the blacklist!");

    await bot.database.r
      .db("robot")
      .table("blacklist")
      .get(msg.mentions.users.first().id)
      .delete();
    msg.reply(
      "successfully un-blacklisted **" +
        msg.mentions.users.first().username +
        "**."
    );
    bot.database.blacklist = bot.database.r.db("robot").table("blacklist");
  }
}

module.exports = unblacklist;
