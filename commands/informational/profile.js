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
    let { MessageEmbed } = require("discord.js");
    let user;
    let discorduser;
    let discordmember;
    let intro;

    if (!msg.mentions.users.first()) {
      user = await bot.database.users.get(msg.author.id);
      discorduser = msg.author;
      discordmember = msg.member;
    } else {
      user = await bot.database.users.get(msg.mentions.users.first().id);
      discorduser = msg.mentions.users.first();
      discordmember = msg.mentions.members.first();
    }

    if (!user) {
      intro = null;
    } else {
      intro = user.intro || null;
    }

    let roles = discordmember.roles.filter( (words) =>{
      if (words.name != "@everyone") {
        return words
      }
    });
    
    let embed = new MessageEmbed()
    if (intro) {
        embed.setAuthor(
          "Profile: " + discorduser.tag,
          discorduser.avatarURL()
        )
        .setColor(
          discordmember.displayHexColor == "#000000"
            ? null
            : discordmember.displayHexColor
        )
        .setDescription(intro)
        .addField("Roles: ", roles.array().join(" "))
        .addField("Joined: ", discordmember.joinedAt, true)
        .setThumbnail(discorduser.avatarURL())
        .setTimestamp()
        .setFooter(msg.guild.name, msg.guild.iconURL());

      msg.channel.send("<@" + discorduser + ">'s Profile:", embed);
    } else {
      embed.setAuthor(
          "Profile: " + discorduser.tag,
          discorduser.avatarURL()
        )
        .setColor(
          discordmember.displayHexColor == "#000000"
            ? null
            : discordmember.displayHexColor
        )
        .addField("Roles: ", roles.array().join(" ") || "None")
        .addField("Joined: ", discordmember.joinedAt, true)
        .setThumbnail(discorduser.avatarURL())
        .setTimestamp()
        .setFooter(msg.guild.name, msg.guild.iconURL());

      msg.channel.send("<@" + discorduser + ">'s Profile:", embed);
    }
  }
}

module.exports = profile;
