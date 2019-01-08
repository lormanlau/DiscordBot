const Command = require(`${process.cwd()}/base/Command.js`);

class glist extends Command {
  constructor(client) {
    super(client, {
      name: "glist",
      description: "list current giveaways",
      usage: "glist",
      aliases: [],
      permLevel: 2
    });
  }

  timeConverter(time){
    var dayInMilliseconds = 24 * 60 * 60 * 1000;
    var hourInMilliseconds = 60 * 60 * 1000;
    var minuteInMilliseconds = 60 * 1000;
    var days = Math.floor(time/dayInMilliseconds);
    var hours = Math.floor((time - (days * dayInMilliseconds))/hourInMilliseconds);
    var minutes = Math.floor((time - days * dayInMilliseconds - hours * hourInMilliseconds) / minuteInMilliseconds);
    var seconds = Math.round((time - days * dayInMilliseconds - hours * hourInMilliseconds - minutes * minuteInMilliseconds)/ 1000);
    var output = "";
    if (days != 0)
      output += `**${days}** day(s), `;
    if (hours != 0)
      output += `**${hours}** hour(s), `;
    if (minutes != 0)
      output += `**${minutes}** minute(s), `;
    output += `**${seconds}** second(s)`;
    return output;
  }

  async run(bot, msg, args, level) {
    var activeGiveaways = msg.guild.giveaways;
    if (!activeGiveaways)
      return msg.channel.send("Currently No active Giveaways. :(")
    for (var i = 0; i < activeGiveaways.length; i++) {
      var channel = msg.guild.channels.filter(channel => channel.id == activeGiveaways[i].giveaway.channelID).first()
      var diff = activeGiveaways[i].giveaway.endTime - new Date();
      msg.channel.send(`${activeGiveaways[i].giveaway.id} | ${channel} | **${activeGiveaways[i].giveaway.winners}** winner(s) | Prize: **${activeGiveaways[i].giveaway.prize}** | Ends in ${this.timeConverter(diff)}`)
    }
  }
}

module.exports = glist;
