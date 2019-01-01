const Command = require(`${process.cwd()}/base/Command.js`);
const Giveaway = require(`${process.cwd()}/util/Giveaway.js`);

class greroll extends Command {
  constructor(client) {
    super(client, {
      name: "greroll",
      description: "rerolls winners for an ended give away",
      usage: "greroll <[messageID]>",
      aliases: [],
      permLevel: 2
    });
  }

  async run(bot, msg, args, level) {
    if (args[0] && !isNaN(args[0])) {
      var giveaway = await bot.database.giveaways.filter({id: args[0]});
      if (!giveaway[0]) 
        return msg.reply("message ID not found");
      var message = await msg.guild
        .channels.get(giveaway[0].channelID)
        .messages.fetch(giveaway[0].id);
      msg.channel.send(`Rerolling messageID: ${message.id} giveaway`)
      new Giveaway(bot, message, giveaway[0]).reroll();
    } else {
      var giveaway = await bot.database.giveaways.filter({guildID: msg.guild.id}).orderBy(bot.database.r.desc("endTime")).limit(1);
      var message = await msg.guild
        .channels.get(giveaway[0].channelID)
        .messages.fetch(giveaway[0].id);
      msg.channel.send(`Rerolling messageID: ${message.id} giveaway`)
      new Giveaway(bot, message, giveaway[0]).reroll();
    }
  }
}

module.exports = greroll;
