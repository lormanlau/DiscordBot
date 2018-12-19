const Command = require(`${process.cwd()}/base/Command.js`);
const { MessageEmbed } = require("discord.js");

class ban extends Command {
  constructor(client) {
    super(client, {
      name: "ban",
      description: "Bans user(s) from a guild.",
      usage: "ban <id or mention> <reason>",
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

    if (!msg.mentions.users.first() || !msg.mentions.members.first()) {
      if (isNaN(args[0]))
        return msg.reply("please mention someone to ban!");
      else if (!isNaN(args[0]))
        guildmember = await msg.guild.member(args[0]);
      else
        return msg.reply("not a valid user");
    } else 
        guildmember = msg.mentions.members.first();

    if (!guildmember)
      return msg.reply("not a valid user id");

    if (!guildmember.bannable)
      return msg.reply("I don't have permission to ban this user!");

    if (
      guildmember.roles.highest.position >=
      msg.member.roles.highest.position
    )
      return msg.reply("You cannot ban this user!");

    args.shift();

    guildmember
      .ban({ reason: args.join(" ") })
      // .setMute(false, args.join(" ")) //for testing
      .then(member => {
        msg.reply(
          "**" +
            guildmember.user.username +
            "** has been successfully banned."
        );

        var ban = new MessageEmbed()
          .setColor(0xffb200)
          .setAuthor(
            guildmember.user.username,
            guildmember.user.avatarURL()
          )
          .addField(
            "Member Banned",
            `**:hammer: ${guildmember.user.username}#${
              guildmember.user.discriminator
            } (${guildmember.user.id}) was banned from the server.**`
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

module.exports = ban;
