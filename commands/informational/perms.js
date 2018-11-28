const Command = require(`${process.cwd()}/base/Command.js`);

class perms extends Command {
  constructor(client) {
    super(client, {
      name: "perms",
      description: "",
      usage: "perms",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    // eslint-disable-line no-unused-vars
    var { MessageEmbed } = require("discord.js");
    var member = msg.member;
    if (msg.mentions.users.array()[0]) {
      member = msg.guild.members.get(msg.mentions.users.array()[0].id);
    }

    var p = member.permissions.serialize(true);

    var perms = new MessageEmbed()
      .setAuthor(
        member.user.username + "#" + member.user.discriminator,
        member.user.avatarURL()
      )
      .setDescription("User Permissions for " + msg.guild.name)
      .setColor(msg.guild.me.displayColor);

    var i = 0;
    for (var key in p) {
      if (p.hasOwnProperty(key) && i < 24) {
        if (p[key] === false) {
          perms.addField(blah(key), ":x:", true);
        } else {
          perms.addField(blah(key), ":white_check_mark:", true);
        }
        i++;
      }
      if (i === 24) {
        msg.channel.send({ embed: perms });
        perms = new MessageEmbed()
          .setColor(msg.guild.me.displayColor)
          .setFooter(
            "Triggered by " + msg.author.username,
            msg.author.avatarURL()
          )
          .setTimestamp();
        i = 0;
      }
    }
    perms.addBlankField(true);
    msg.channel.send({ embed: perms });

    function blah(str) {
      if (str === "MANAGE_ROLES_OR_PERMISSIONS") str = "MANAGE_ROLES";
      str = str.replace(new RegExp("_", "g"), " ");
      return str.replace(/\w\S*/g, txt => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }
  }
}

module.exports = perms;
