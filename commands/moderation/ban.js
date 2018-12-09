const Command = require(`${process.cwd()}/base/Command.js`);
const { MessageEmbed } = require("discord.js");

class ban extends Command {
  constructor(client) {
    super(client, {
      name: "ban",
      description: "Bans user(s) from a guild.",
      usage: "ban",
      aliases: [],
      permLevel: 2
    });
  }

  async run(bot, msg, args, level) {
    if (!msg.member.hasPermission("BAN_MEMBERS"))
      return msg.reply(
        "you do not have permission to do this! Required permission: BAN_MEMBERS"
      );
    if (!msg.mentions.users.first() || !msg.mentions.members.first())
      return msg.reply("please mention someone to ban!");
    if (!msg.mentions.members.first().bannable)
      return msg.reply("I don't have permission to ban this user!");
    if (
      msg.mentions.members.first().roles.highest.position >=
      msg.member.roles.highest.position
    )
      return msg.reply("You cannot ban this user!");

    args.shift();

    msg.mentions.members
      .first()
      .ban({ reason: args.join(" ") })
      .then(member => {
        msg.reply(
          "**" +
            msg.mentions.users.first().username +
            "** has been successfully banned."
        );

        var ban = new MessageEmbed()
          .setColor(0xffb200)
          .setAuthor(
            msg.mentions.users.first().username,
            msg.mentions.users.first().avatarURL()
          )
          .addField(
            "Member Banned",
            `**:hammer: ${msg.mentions.users.first().username}#${
              msg.mentions.users.first().discriminator
            } (${msg.mentions.users.first().id}) was banned from the server.**`
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
            `${msg.guild.iconURL()}`
          )
          .setTimestamp();

        var log = msg.guild.channels.find(
          channel => channel.name === "mod-logs"
        );
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

module.exports = ban;
