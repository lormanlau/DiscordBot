const Command = require(`${process.cwd()}/base/Command.js`);

class addintro extends Command {
  constructor(client) {
    super(client, {
      name: "addintro",
      description: "Add an introduction into the #introductions channel!",
      usage: "addintro",
      aliases: ["addintroduction"],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    let introduction = args.join(" ");
    let { MessageEmbed } = require("discord.js");

    bot.database.update(
      "users",
      { intro: introduction, id: msg.author.id },
      bot.logger
    );

    let intro = new MessageEmbed()
      .setAuthor("Introduction: " + msg.author.username, msg.author.avatarURL())
      .setColor(
        msg.member.displayHexColor == "#000000"
          ? null
          : msg.member.displayHexColor
      )
      .setDescription(introduction)
      .setThumbnail(msg.author.avatarURL())
      .setTimestamp()
      .setFooter(msg.guild.name, msg.guild.iconURL());

    bot.channels.get("516534316138758144").send({ embed: intro });

    msg.reply("successfully submitted your intro!");
  }
}

module.exports = addintro;
