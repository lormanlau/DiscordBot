const Command = require(`${process.cwd()}/base/Command.js`);

class user extends Command {
  constructor(client) {
    super(client, {
      name: "user",
      description: "Returns information on a specific user.",
      usage: "user <optional-mention>",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    const { MessageEmbed } = require("discord.js");
    let presences = {
      WATCHING: "Watching",
      PLAYING: "Playing",
      LISTENING: "Listening to",
      STREAMING: "Streaming"
    };

    var member = msg.member;
    if (msg.mentions.users.array()[0]) {
      member = msg.guild.members.get(msg.mentions.users.array()[0].id);
    }
    var user = member.user;
    var roles = member.roles.size;

    var info = new MessageEmbed()
      .setAuthor(user.username + "#" + user.discriminator, user.avatarURL())
      .setColor(member.displayHexColor)
      .setFooter("Triggered by " + msg.author.username, msg.author.avatarURL())
      .setTimestamp()
      .setThumbnail(user.avatarURL())
      .addField("Username", user.username, true)
      .addField("Display Name", member.displayName, true)
      .addField("ID", user.id, true)
      .addField("Account Created", new Date(user.createdAt), true)
      .addField("Join Date", new Date(member.joinedAt), true)
      .addField("Bot", user.bot, true);

    if (user.presence.activity) {
      info.setDescription(
        presences[user.presence.activity.type] +
          " " +
          user.presence.activity.name +
          (user.presence.activity.details
            ? " (" +
              user.presence.activity.details +
              (user.presence.activity.type == "LISTENING"
                ? " by " + user.presence.activity.state
                : "") +
              ")"
            : "")
      );
    }

    if (user.presence.status === "offline") {
      info.addField("Status", "<:offline:313956277237710868> Offline", true);
    } else if (user.presence.status === "idle") {
      info.addField("Status", "<:away:313956277220802560> Idle", true);
    } else if (user.presence.status === "online") {
      info.addField("Status", "<:online:313956277808005120> Online", true);
    } else if (user.presence.status === "dnd") {
      info.addField("Status", "<:dnd:313956276893646850> Do Not Disturb", true);
    }
    if (member.roles.hoist) {
      var hoist = member.roles.hoist.name;
    } else {
      hoist = "None";
    }

    if (member.roles.color) {
      var colorR = member.roles.color.name;
    } else {
      colorR = "None";
    }
    info
      .addField("Roles", roles, true)
      .addField("Color", member.displayHexColor, true)
      .addField("Highest Role", member.roles.highest.name, true)
      .addField("Hoist Role", hoist, true)
      .addField("Color Role", colorR, true)
      .addField("Avatar Link", "[Here](" + user.avatarURL() + ")", true);

    msg.channel.send({ embed: info });
  }
}

module.exports = user;
