const Command = require(`${process.cwd()}/base/Command.js`);

class gend extends Command {
  constructor(client) {
    super(client, {
      name: "gend",
      description: "ends the giveaway",
      usage: "gend <[messageID]>",
      aliases: [],
      permLevel: 2
    });
  }

  async run(bot, msg, args, level) {
    var currentGiveaways = (msg.guild.giveaways) ? msg.guild.giveaways : [];
    if (currentGiveaways.length == 0)
      return msg.reply(`message ID not found`);
    if (args[0] && !isNaN(args[0])) {
      for (var i = 0; i < currentGiveaways.length; i++) {
        if (currentGiveaways[i].giveaway.id == args[0]){
          clearTimeout(currentGiveaways[i].updateTimeTimer);
          currentGiveaways[i].finishGiveaway();
          return msg.reply(`successfully ended ${args[0]} giveaway`);
        }
      }
      return msg.reply(`message ID not found`);
    } else if (args[0]) {
      return msg.reply(`Invalid syntax`);
    } else {
      var giveaway = currentGiveaways[currentGiveaways.length - 1];
      clearTimeout(giveaway.updateTimeTimer);
      giveaway.finishGiveaway();
      return msg.reply(`successfully ended ${giveaway.giveaway.id} giveaway`);
    }
  }
}

module.exports = gend;
