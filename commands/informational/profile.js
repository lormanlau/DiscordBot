const Command = require(`${process.cwd()}/base/Command.js`);

class profile extends Command {
  constructor(client) {
    super(client, {
      name: "profile",
      description: "Pull up your own, or someone else's profile!",
      usage: "profile <optional-mention>",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    let { RichEmbed } = require("discord.js");
    let user;
    let discorduser;
    let discordmember;
    if (!msg.mentions.users.first()) {
      user = await bot.database.users.get(msg.author.id);
      discorduser = msg.author;
      discordmember = msg.member;
    } else {
      user = await bot.database.users.get(msg.mentions.users.first().id);
      discorduser = msg.mentions.users.first();
      discordmember = msg.mentions.members.first();
    }
    if (!user) return msg.reply("user does not exists");
    let roles = discordmember.roles
    let intro = user.intro || null;
    if (intro) {
      let embed = new RichEmbed()
        .setAuthor(
          "Profile: " + discorduser.tag,
          discorduser.avatarURL()
        )
        .setColor(
          discordmember.displayHexColor == "#000000"
            ? null
            : discordmember.displayHexColor
        )
        .setDescription(intro)
        .addField("Roles: ", roles.Array().join(" "))
        .addField("Joined: ", discordmember.joinedAt(), true)
        .setThumbnail(discorduser.avatarURL())
        .setTimestamp()
        .setFooter(msg.guild.name, msg.guild.iconURL());

      msg.channel.send("<@" + discorduser + ">'s Profile:", embed);
    } else {
      let embed = new RichEmbed()
        .setAuthor(
          "Profile: " + discorduser.tag,
          discorduser.avatarURL()
        )
        .setColor(
          discordmember.displayHexColor == "#000000"
            ? null
            : discordmember.displayHexColor
        )
        .addField("Roles: ", roles.Array().join(" "))
        .addField("Joined: ", discordmember.joinedAt(), true)
        .setThumbnail(discorduser.avatarURL())
        .setTimestamp()
        .setFooter(msg.guild.name, msg.guild.iconURL());

      msg.channel.send("<@" + discorduser + ">'s Profile:", embed);
    }
  }
}

module.exports = profile;
