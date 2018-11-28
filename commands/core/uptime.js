const Command = require(`${process.cwd()}/base/Command.js`);

class uptime extends Command {
  constructor(client) {
    super(client, {
      name: "uptime",
      description: "View the current uptime of the bot!",
      usage: "uptime",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    let { MessageEmbed } = require("discord.js");
    var date = new Date(bot.uptime);
    var strDate = "**";
    strDate += date.getUTCDate() - 1 + " days, ";
    strDate += date.getUTCHours() + " hours, ";
    strDate += date.getUTCMinutes() + " minutes, ";
    strDate += date.getUTCSeconds() + " seconds**";

    msg.channel.send({
      embed: new MessageEmbed()
        .setAuthor(bot.user.username + " Uptime", bot.user.avatarURL())
        .setColor(msg.color)
        .setDescription(strDate)
        .setFooter("Powered by " + bot.user.username)
        .setTimestamp()
    });
  }
}

module.exports = uptime;
