const Command = require(`${process.cwd()}/base/Command.js`);
var { MessageEmbed } = require("discord.js");

class kick extends Command {
  constructor(client) {
    super(client, {
      name: "kick",
      description: "Kick a member from a server.",
      usage: "kick <member-mentions> <reason>",
      aliases: [],
      permLevel: 2
    });
  }

  async run(bot, msg, args, level) {
    if (!msg.guild) return;
    if (!msg.member.hasPermission("KICK_MEMBERS"))
      return msg.reply(
        "you do not have permission to do this! Required permission: KICK_MEMBERS"
      );
    if (!msg.mentions.users.first() || !msg.mentions.members.first())
      return msg.reply("please mention someone to kick!");
    if (!msg.mentions.members.first().kickable)
      return msg.reply("I don't have permission to kick this user!");
    if (
      msg.mentions.members.first().roles.highest.position >=
      msg.member.roles.highest.position
    )
      return msg.reply("You cannot kick this user!");

    args.shift();
    msg.mentions.members
      .first()
      .kick({ reason: args.join(" ") || "None Specified" });

    msg.reply(
      "**" +
        msg.mentions.users.first().username +
        "** has been successfully kicked."
    );

    var kick = new MessageEmbed()
      .setColor(0xffb200)
      .setAuthor(
        msg.mentions.users.first().username,
        msg.mentions.users.first().avatarURL()
      )
      .addField(
        "Member Kicked",
        `**:hammer: ${msg.mentions.users.first().username}#${
          msg.mentions.users.first().discriminator
        } (${msg.mentions.users.first().id}) was kicked from the server.**`
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

    var log = msg.guild.channels.get("517258075636367362");
    if (log && log.permissionsFor(msg.guild.me).has("EMBED_LINKS"))
      log.send({ embed: kick });
    else if (msg.channel.permissionsFor(msg.guild.me).has("EMBED_LINKS"))
      msg.channel.send({ embed: kick });
  }
}

module.exports = kick;
