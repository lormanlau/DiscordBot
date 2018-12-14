const Command = require(`${process.cwd()}/base/Command.js`);

class pay extends Command {
  constructor(client) {
    super(client, {
      name: "pay",
      description: "Pay someone else credits from your balance!",
      usage: "pay <user> <amount>",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    var amount;
    if (!msg.mentions.users.first())
      return msg.reply("please specify who you would like to pay!");
    if (!args[1]) return msg.reply("please specify an amount to pay!");
    if (args[1] && isNaN(args[1]))
      return msg.reply("please specify an amount to pay!");
    else if (args[1] && !isNaN(args[1])) amount = Number(args[1]);

    if (bot.config.Discord.ownerID == msg.author.id) {
      msg.channel.send(
        "**[ADMIN OVERRIDE]** Added " +
          amount +
          " credits to " +
          msg.mentions.users.first().toString() +
          "'s account."
      );

      let recipient =
        (await bot.database.users.get(msg.mentions.users.first().id)) || {};

      bot.database.update(
        "users",
        {
          balance: recipient.balance + amount,
          id: msg.mentions.users.first().id
        },
        bot.logger
      );
    } else {
      let account = (await bot.database.users.get(msg.author.id)) || {};
      if (!account.balance)
        return msg.reply(
          "you do not have an account yet! Please claim your dalies to setup an account!"
        );
      if (account.balance < amount)
        return msg.reply("you don't have enough money to pay that amount!");

      let paidAmount = Math.floor(0.9 * amount);

      let recipient =
        (await bot.database.users.get(msg.mentions.users.first().id)) || {};

      bot.database.update(
        "users",
        {
          balance: recipient.balance + paidAmount,
          id: msg.mentions.users.first().id
        },
        bot.logger
      );

      bot.database.update(
        "users",
        {
          balance: account.balance - amount,
          id: msg.author.id
        },
        bot.logger
      );

      msg.reply(
        "you have paid " +
          msg.mentions.users.first().toString() +
          " " +
          paidAmount +
          " credits! (10% fee)"
      );
    }
  }
}

module.exports = pay;
