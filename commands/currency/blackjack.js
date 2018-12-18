const Command = require(`${process.cwd()}/base/Command.js`);

class blackjack extends Command {
  constructor(client) {
    super(client, {
      name: "blackjack",
      description: "",
      usage: "blackjack <gamble-amount>",
      aliases: ["bj"],
      permLevel: 1
    });
  }

  restart(players_hand, cpus_hand, cards) {
    players_hand.push(this.drawCard(cards));
    cpus_hand.push(this.drawCard(cards));
    players_hand.push(this.drawCard(cards));
  }

  drawCard(cards) {
    let i = Math.floor(Math.random() * cards.length)
    return cards.splice(i , 1)[0];
  }

  calculateTotal(hand) {
    function countAces(hand){
      var numberOfAces = 0;
      for (let i = 0; i < hand.length; i++){
        if (hand[i] == "A") {
          numberOfAces++;
        }
      }
      return numberOfAces;
    }

    let total = 0;
    for (var i = 0; i < hand.length; i++){
      if (hand[i] == "J" || hand[i] == "Q" || hand[i] == "K") {
        total += 10
      } else if (hand[i] == "A") {
        total += 11
      } else {
        total += hand[i]
      }
    }
    
    for (var i = 0; i < countAces(hand); i++){
      if (total > 21) {
        total -= 10;
      } else {
        break;
      }
    }
    return total;
  }

  beepboop(players_hand, cpus_hand, cards){
    let players_total = this.calculateTotal(players_hand);
    while (this.calculateTotal(cpus_hand) <= players_total && this.calculateTotal(cpus_hand) < 21) {
      cpus_hand.push(this.drawCard(cards));
    }
    let cpus_total = this.calculateTotal(cpus_hand);
    if (cpus_total > 21 || cpus_total <= players_total) {
      if (cpus_total == players_total && players_hand.length > cpus_hand.length) {
        return false
      }
      return true;
    } else {
      return false;
    }
  }

  async run(bot, msg, args, level) {
    var amount;
    var cards = [
        "A",2,3,4,5,6,7,8,9,10,"J","Q","K",
        "A",2,3,4,5,6,7,8,9,10,"J","Q","K",
        "A",2,3,4,5,6,7,8,9,10,"J","Q","K",
        "A",2,3,4,5,6,7,8,9,10,"J","Q","K"
      ];
    var players_hand = [];
    var cpus_hand = [];
    var timeout = true;
    
    if (args[0] && isNaN(args[0])) amount = 10;
    else if (args[0] && !isNaN(args[0])) amount = Number(args[0]);
    else amount = 10;

    let account = (await bot.database.users.get(msg.author.id)) || {};
    if (!account || !account.balance)
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

    this.restart(players_hand, cpus_hand, cards)

    let blackjackMessage = await msg.channel.send({
      embed: {
        title: "** Blackjack Bid Amount:** " + amount + " credits",
        description: "Dealer's card: " + cpus_hand + 
          "\n؜" + "<@" + msg.author.id + ">'s cards: " + players_hand + 
          "\n" + "Please react ✌ to hit and 🖐 to stay" ,
        footer: {
          text: bot.user.username + " Blackjack",
          iconURL: bot.user.avatarURL()
        },
        timestamp: new Date()
      }
    })
    .then(message => {
      message.react("✌")
      message.react("🖐")
      return message; 
    });

    let filter = (reaction, user) => (reaction.emoji.name === '✌' || reaction.emoji.name === "🖐") && user.id === msg.author.id;
    let collector = blackjackMessage.createReactionCollector(filter, {time: 1000 * 3 * 60})
    collector.on("collect", messageReaction => {
      if (messageReaction.emoji.name === "🖐") {
        if (this.beepboop(players_hand, cpus_hand, cards)) {
          blackjackMessage.edit({embed: 
            {
              title: "**Blackjack Bid Amount:** " + amount + " credits",
              description: "Dealer's card: " + cpus_hand + 
              "\n؜" + "<@" + msg.author.id + ">'s cards: " + players_hand + 
              "\n" + "Dealer has busted, You win " + 2 * amount + " credits",
              footer: {
                text: bot.user.username + " Blackjack",
                iconURL: bot.user.avatarURL()
              },
              timestamp: new Date()
            }
          });
          bot.database.update(
            "users",
              {
                balance: account.balance + amount,
                id: msg.author.id
              },
              bot.logger
            );
        } else {
          blackjackMessage.edit({embed: 
            {
              title: "**Blackjack Bid Amount:** " + amount + " credits",
              description: "Dealer's card: " + cpus_hand + 
              "\n؜" + "<@" + msg.author.id + ">'s cards: " + players_hand + 
              "\n" + "Dealer has won, You lost " + amount + " credits",
              footer: {
                text: bot.user.username + " Blackjack",
                iconURL: bot.user.avatarURL()
              },
              timestamp: new Date()
            }
          });
        }
        timeout = false;
        collector.stop();
      } else if (messageReaction.emoji.name === "✌") {
        players_hand.push(this.drawCard(cards));
        if (this.calculateTotal(players_hand) > 21) {
          blackjackMessage.edit({embed: 
            {
              title: "**Blackjack Bid Amount:** " + amount + " credits",
              description: "<@" + msg.author.id + "> busted! " + players_hand + 
              "\n" + "You lost " + amount + " credits",
              footer: {
                text: bot.user.username + " Blackjack",
                iconURL: bot.user.avatarURL()
              },
              timestamp: new Date()
            }
          });
          timeout = false;
          collector.stop();
        } else {
          blackjackMessage.edit({embed: 
            {
              title: "**Blackjack Bid Amount:** " + amount + " credits",
              description: "Dealer's card: " + cpus_hand + 
              "\n؜" + "<@" + msg.author.id + ">'s cards: " + players_hand + 
              "\n" + "Please react ✌ to hit and 🖐 to stay",
              footer: {
                text: bot.user.username + " Blackjack",
                iconURL: bot.user.avatarURL()
              },
              timestamp: new Date()
            }
          });
        }
      }
      let me = messageReaction.users.filter(user => user.username == msg.author.username).first();
      messageReaction.users.remove(me);
    })
    collector.on("end", collected => {
      if (timeout) {
        blackjackMessage.edit({embed: 
          {
            title: "**Blackjack Bid Amount:** " + amount + " credits",
            description: "You took too long and forfit the match",
            footer: {
              text: bot.user.username + " Blackjack",
              iconURL: bot.user.avatarURL()
            },
            timestamp: new Date()
          }
        });
      }
    })
  }
}

module.exports = blackjack;
