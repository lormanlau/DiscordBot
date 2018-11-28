const Command = require(`${process.cwd()}/base/Command.js`);
const { MessageEmbed } = require("discord.js");

class channelperms extends Command {
  constructor(client) {
    super(client, {
      name: "channelperms",
      description: "Checks your or another user's perms in a certain channel.",
      usage: "channelperms",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    // eslint-disable-line no-unused-vars
    let member = msg.member;
    if (msg.mentions.users.array()[0]) {
      member = msg.guild.members.get(msg.mentions.users.array()[0].id);
    }

    let channel = msg.channel;
    if (msg.mentions.channels.array()[0]) {
      channel = msg.guild.channels.get(msg.mentions.channels.array()[0].id);
    }

    var p = member.permissionsIn(channel).serialize(true);

    var perms = new MessageEmbed()
      .setAuthor(msg.guild.name, msg.guild.iconURL())
      .setDescription(
        member.user.username + "'s permissions in #" + channel.name
      )
      .setColor(msg.guild.me.displayColor);

    var i = 0;
    for (var key in p) {
      if (p.hasOwnProperty(key) && i < 24) {
        if (p[key] === false) {
          perms.addField(properCase(key), ":x:", true);
        } else {
          perms.addField(properCase(key), ":white_check_mark:", true);
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

    function properCase(str) {
      if (str === "MANAGE_ROLES_OR_PERMISSIONS") str = "MANAGE_ROLES";
      str = str.replace(new RegExp("_", "g"), " ");
      return str.replace(/\w\S*/g, txt => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }
  }
}

module.exports = channelperms;
