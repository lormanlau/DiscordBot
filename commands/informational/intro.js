const Command = require(`${process.cwd()}/base/Command.js`);

class intro extends Command {
  constructor(client) {
    super(client, {
      name: "intro",
      description: "",
      usage: "intro",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    let { MessageEmbed } = require("discord.js");
    if (!msg.mentions.users.first()) {
      let user = await bot.database.users.get(msg.author.id);
      let discorduser = msg.author;
      let discordmember = msg.member;
      let intro = user.intro || null;
      if (intro) {
        let embed = new MessageEmbed()
          .setAuthor(
            "Introduction: " + discorduser.tag,
            discorduser.avatarURL()
          )
          .setColor(
            discordmember.displayHexColor == "#000000"
              ? null
              : discordmember.displayHexColor
          )
          .setDescription(intro)
          .setThumbnail(discorduser.avatarURL())
          .setTimestamp()
          .setFooter(msg.guild.name, msg.guild.iconURL());

        msg.channel.send("<@" + discorduser + ">'s Intro:", embed);
      } else {
        msg.reply(
          "you do not have an intro yet! Please add one using the `addintro` comnmand."
        );
      }
    } else {
      let user = await bot.database.users.get(msg.mentions.users.first().id);
      let intro = user.intro || null;
      if (intro) {
        let discorduser = msg.mentions.users.first();
        let discordmember = msg.mentions.members.first();
        let embed = new MessageEmbed()
          .setAuthor(
            "Introduction: " + discorduser.tag,
            discorduser.avatarURL()
          )
          .setColor(
            discordmember.displayHexColor == "#000000"
              ? null
              : discordmember.displayHexColor
          )
          .setDescription(intro)
          .setThumbnail(discorduser.avatarURL())
          .setTimestamp()
          .setFooter(msg.guild.name, msg.guild.iconURL());

        msg.channel.send("<@" + discorduser + ">'s Intro:", embed);
      } else {
        msg.reply("they do not have an intro yet!");
      }
    }
  }
}

module.exports = intro;
