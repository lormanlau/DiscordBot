const Command = require(`${process.cwd()}/base/Command.js`);

class slots extends Command {
  constructor(client) {
    super(client, {
      name: "slots",
      description: "",
      usage: "slots",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    var amount;
    if (args[0] && isNaN(args[0])) amount = 10;
    else if (args[0] && !isNaN(args[0])) amount = Number(args[0]);
    else amount = 10;

    const combos = ["🍎", "🍐", "🍑", "🍌", "🍉", "🍇", "🍓", "🍒", "🍊", "🍍"];
    var slotsMsg;

    let account = (await bot.database.users.get(msg.author.id)) || {};
    if (!account.balance)
      return msg.reply(
        "you do not have an account yet! Please claim your dalies to setup an account!"
      );
    if (account.balance < amount)
      return msg.reply("you don't have enough money to cover that bet!");

    bot.database.update(
      "users",
      {
        balance: account.balance - amount,
        id: msg.author.id
      },
      bot.logger
    );

    let amountWon = 0;

    let one = combos[Math.floor(Math.random() * combos.length)],
      two = combos[Math.floor(Math.random() * combos.length)],
      three = combos[Math.floor(Math.random() * combos.length)];
    slotsMsg = await msg.channel.send({
      embed: {
        title: "**:slot_machine: Bid Amount:** " + amount + " credits",
        description: "؜\n" + one + two + three + "\n؜",
        footer: {
          text: bot.user.username + " Slots",
          iconURL: bot.user.avatarURL()
        },
        timestamp: new Date()
      }
    });

    var times = Math.floor(Math.random() * 5 + 5);

    for (var i = 1; i < times; i++) {
      setTimeout(async () => {
        (one = combos[Math.floor(Math.random() * combos.length)]),
          (two = combos[Math.floor(Math.random() * combos.length)]),
          (three = combos[Math.floor(Math.random() * combos.length)]);
        slotsMsg.edit({
          embed: {
            title: "**:slot_machine: Bid Amount:** " + amount + " credits",
            description: "؜\n" + one + two + three + "\n؜",
            footer: {
              text: bot.user.username + " Slots",
              iconURL: bot.user.avatarURL()
            },
            timestamp: new Date()
          }
        });
      }, i * 1500);

      if (i == times - 1) {
        setTimeout(async () => {
          var result;
          if (one == two && two == three) {
            result =
              "**JACKPOT!** You won " + 10 * amount + " credits! **JACKPOT!**";
            amountWon = amount * 10;
          } else if (one == two || one == three || two == three) {
            result = "You won " + 4 * amount + " credits!";
            amountWon = amount & 4;
          } else if (
            ((one == "🍎" || two == "🍎" || three == "🍎") &&
              (one == "🍓" || two == "🍓" || three == "🍓")) ||
            ((one == "🍒" || two == "🍒" || three == "🍒") &&
              (one == "🍓" || two == "🍓" || three == "🍓")) ||
            ((one == "🍎" || two == "🍎" || three == "🍎") &&
              (one == "🍒" || two == "🍒" || three == "🍒")) ||
            ((one == "🍉" || two == "🍉" || three == "🍉") &&
              (one == "🍎" || two == "🍎" || three == "🍎")) ||
            ((one == "🍉" || two == "🍉" || three == "🍉") &&
              (one == "🍒" || two == "🍒" || three == "🍒")) ||
            ((one == "🍉" || two == "🍉" || three == "🍉") &&
              (one == "🍓" || two == "🍓" || three == "🍓"))
          ) {
            result = "You won " + 2 * amount + " credits!";
            amountWon = amount * 2;
          } else if (
            ((one == "🍑" || two == "🍑" || three == "🍑") &&
              (one == "🍊" || two == "🍊" || three == "🍊")) ||
            ((one == "🍍" || two == "🍍" || three == "🍍") &&
              (one == "🍊" || two == "🍊" || three == "🍊")) ||
            ((one == "🍑" || two == "🍑" || three == "🍑") &&
              (one == "🍍" || two == "🍍" || three == "🍍"))
          ) {
            result = "You won " + 3 * amount + " credits!";
            amountWon = amount * 3;
          } else {
            result = "You lost all " + amount + " credits :(";
            amountWon = 0;
          }

          slotsMsg
            .edit({
              embed: {
                title: "**:slot_machine: Bid Amount:** " + amount + " credits",
                description: "؜\n" + one + two + three + "\n\n" + result,
                footer: {
                  text: bot.user.username + " Slots",
                  iconURL: bot.user.avatarURL()
                },
                timestamp: new Date()
              }
            })
            .then(m => {
              bot.database.update(
                "users",
                {
                  balance: account.balance - amount + amountWon,
                  id: msg.author.id
                },
                bot.logger
              );
            });
        }, (i + 1) * 1500);
      }
    }
  }
}

module.exports = slots;
