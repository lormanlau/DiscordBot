const Command = require(`${process.cwd()}/base/Command.js`);

class mute extends Command {
  constructor(client) {
    super(client, {
      name: "mute",
      description: "Mutes user(s) with specified reasons.",
      usage: "mute <users> <reason>",
      aliases: [],
      permLevel: 2
    });
  }

  async run(bot, msg, args, level) {
    if (!msg.member.hasPermission("MANAGE_MESSAGES"))
      return msg.reply(
        "you do not have permission to do this! Required permission: MANAGE_MESSAGES"
      );
    var { MessageEmbed } = require("discord.js");
    var mutee = msg.mentions.users.array();

    for (var k = 0; k < mutee.length; k++) {
      var reason = args.splice(mutee.length).join(" ");
      var user = bot.users.get(mutee[k].id);
      var guild = msg.guild;
      var member = msg.guild.members.get(mutee[k].id);

      if (member.hasPermission("ADMINISTRATOR")) {
        return msg.channel.send("I can't mute " + user + "!");
      }

      await member.roles.add("516758098556354585");

      msg.reply("<@" + member + "> has been muted.");

      var mute = new MessageEmbed()
        .setColor(0xffb200)
        .setAuthor(user.username, user.avatarURL())
        .addField(
          "Member Muted",
          `**${user.username}#${user.discriminator} (${user.id}) was muted.**`
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
        .addField("Reason", reason || "Not Specified")
        .setFooter(`${guild.name}`, `${guild.iconURL()}`)
        .setTimestamp();
      try {
        msg.guild.channels.get("517258075636367362").send({ embed: mute });
      } catch (e) {
        msg.channel.send({ embed: mute });
      }
    }
  }
}

module.exports = mute;
