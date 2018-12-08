const Command = require(`${process.cwd()}/base/Command.js`);
const { MessageEmbed } = require("discord.js");

class warnings extends Command {
  constructor(client) {
    super(client, {
      name: "warnings",
      description: "warns user in the guild.",
      usage: "warnings <member-mentions>",
      aliases: [],
      permLevel: 2
    });
  }

  async run(bot, msg, args, level) {
    // if (!msg.member.hasPermission("BAN_MEMBERS"))
    //   return msg.reply(
    //     "you do not have permission to do this! Required permission: BAN_MEMBERS"
    //   );
    if (!msg.mentions.users.first() || !msg.mentions.members.first())
      return msg.reply("please mention someone to get their warnings");

    let user = await bot.database.users.get(msg.mentions.users.first().id);
    let discorduser = msg.mentions.users.first();
    let discordmember = msg.mentions.members.first();
    let current_warns;

    if (!user || !user.warnings) {
      current_warns = []
    } else {
      current_warns = user.warnings;
    }

    let warn = new MessageEmbed()
      .setColor(0xffb200)
      .setAuthor(discorduser.username, discorduser.avatarURL())
      .setFooter(
        `${msg.guild.name} | ${msg.guild.members.size} members`,
        msg.guild.iconURL()
      )
      .setTimestamp();
    if (current_warns.length == 0) {
      warn.setDescription("No Warnings Given")
      return msg.channel.send({ embed: warn });
    }

    for (var i = 0; i < current_warns.length; i++){
      let warning = current_warns[i];
      warn.addField(
        `Case: ${warning.case} | Issued By: ${warning.moderator}`,
        `Reason: ${warning.reason} | Issued At: ${warning.timestamp.toLocaleString('en-US')}`
        );
    }
    return msg.channel.send({ embed: warn });
  }
}

module.exports = warnings
