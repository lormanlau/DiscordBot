const Command = require(`${process.cwd()}/base/Command.js`);
const { MessageEmbed } = require("discord.js");

class warn extends Command {
  constructor(client) {
    super(client, {
      name: "warn",
      description: "warns user in the guild.",
      usage: "warn <member-mentions> <reason>",
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
      return msg.reply("please mention someone to warn!");
    if (!msg.mentions.members.first().bannable)
      return msg.reply("I don't have permission to warn this user!");
    if (
      msg.mentions.members.first().roles.highest.position >=
      msg.member.roles.highest.position
    )
      return msg.reply("You cannot warn this user!");

    args.shift();

    let reason = args
      .filter(words => words != msg.mentions.users.first())
      .join(" ");
    if (reason == "") return msg.reply("please supply a reason");

    let user = await bot.database.users.get(msg.mentions.users.first().id);
    let discorduser = msg.mentions.users.first();
    let discordmember = msg.mentions.members.first();

    let warning;
    if (!user || !user.warnings) {
      warning = {
        case: 1,
        reason: reason == "" ? "None" : reason,
        timestamp: new Date()
      };
      bot.database.update(
        "users",
        { warnings: [warning], id: discorduser.id },
        bot.logger
      );
    } else {
      let current_warns = user.warnings;
      warning = {
        case: user.warnings.length + 1,
        reason: reason == "" ? "None" : reason,
        time: new Date()
      };
      current_warns.push(warning);
      bot.database.update(
        "users",
        { warnings: current_warns, id: discorduser.id },
        bot.logger
      );
    }
    msg.channel.send(
      "**" +
        discorduser.username +
        "** has warned for **" +
        warning.reason +
        "**. Warning #" +
        warning.case
    );

    let warn = new MessageEmbed()
      .setColor(0xffb200)
      .setAuthor(discorduser.username, discorduser.avatarURL())
      .addField(
        "Member Warned",
        `${discorduser.username}#${discorduser.discriminator} (${
          discorduser.id
        })`
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
      .addField("Case", warning.case, true)
      .addField("Reason", reason || "None")
      .setFooter(
        `${msg.guild.name} | ${msg.guild.members.size} members`,
        msg.guild.iconURL()
      )
      .setTimestamp();

    var log = msg.guild.channels.find(channel => channel.name === "mod-logs");
    if (log && log.permissionsFor(msg.guild.me).has("EMBED_LINKS"))
      log.send({ embed: warn });
  }
}

module.exports = warn;
