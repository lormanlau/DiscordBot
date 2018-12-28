const Command = require(`${process.cwd()}/base/Command.js`);
const { MessageEmbed } = require("discord.js");

class hackban extends Command {
  constructor(client) {
    super(client, {
      name: "hackban",
      description: "Bans user(s) from a guild.",
      usage: "hackban <id> <reason>",
      aliases: [],
      permLevel: 2
    });
  }

  async run(bot, msg, args, level) {
    var guildmember;
    if (!msg.member.hasPermission("BAN_MEMBERS"))
      return msg.reply("you do not have permission to do this! Required permission: BAN_MEMBERS");
    if (!args[1])
      return msg.reply("please provide a reason")

    if (!isNaN(args[0])){
      guildmember = await bot.users.fetch(args[0], true)
        .catch(error => {
          return null
        });
    } else
      return msg.reply("please enter a valid user id");

    if (!guildmember)
      return msg.reply("not a valid user id");

    args.shift();

    msg.guild.members
      .ban(guildmember, { reason: args.join(" ") })
      .then(member => {
        msg.reply(
          "**" +
            guildmember.username +
            "** has been successfully banned."
        );

        var ban = new MessageEmbed()
          .setColor(0xffb200)
          .setAuthor(
            guildmember.username,
            guildmember.avatarURL()
          )
          .addField(
            "Member Banned",
            `**:hammer: ${guildmember.username}#${
              guildmember.discriminator
            } (${guildmember.id}) was banned from the server.**`
          )
          .addField(
            "Responsible Moderator",
            msg.member.displayName +
              " (" +
              msg.author.tag +
              " | " +
              msg.author.id +
              ")"
          )
          .addField("Reason", args.join(" "))
          .setFooter(
            `${msg.guild.name} | ${msg.guild.members.size} members`,
            msg.guild.iconURL()
          )
          .setTimestamp();

        var log = msg.guild.channels.get("517258075636367362");
        if (log && log.permissionsFor(msg.guild.me).has("EMBED_LINKS"))
          log.send({ embed: ban });
        else if (msg.channel.permissionsFor(msg.guild.me).has("EMBED_LINKS"))
          msg.channel.send({ embed: ban });
      })
      .catch(err => {
        return msg.channel.send("Error: " + err.message);
      });
  }
}

module.exports = hackban;
