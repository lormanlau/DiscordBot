const Command = require(`${process.cwd()}/base/Command.js`);

class daily extends Command {
  constructor(client) {
    super(client, {
      name: "daily",
      description: "Claim the daily amount of money you can recieve!",
      usage: "daily",
      aliases: ["dailies"],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    const moment = require("moment");

    let dbUser = (await bot.database.users.get(msg.author.id)) || {};
    if (dbUser.lastDaily) {
      if (Date.now() - new Date(dbUser.lastDaily) >= 86400000) {
        bot.database.update(
          "users",
          {
            lastDaily: Date.now(),
            balance: dbUser.balance + 1000,
            id: msg.author.id
          },
          bot.logger
        );
        msg.reply("you have recieved your 1000 daily credits!");
      } else {
        msg.reply(
          "not so fast! You still have to wait **" +
            moment(dbUser.lastDaily + 86400000).fromNow(true) +
            "** to claim your dailies!"
        );
      }
    } else {
      bot.database.update(
        "users",
        { lastDaily: Date.now(), balance: 1000, id: msg.author.id },
        bot.logger
      );
      msg.reply("you have recieved your 1000 daily credits!");
    }
  }
}

module.exports = daily;
