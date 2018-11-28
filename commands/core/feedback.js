const Command = require(`${process.cwd()}/base/Command.js`);
const { MessageEmbed } = require("discord.js");

class feedback extends Command {
  constructor(client) {
    super(client, {
      name: "feedback",
      description: "Provide feedback to the owner of the bot!",
      usage: "feedback <content>",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    if (args.join(" ") == "") return msg.reply("please include feedback!");
    else {
      msg.reply(
        "your feedback has been received! The developer will get back to you as soon as possible."
      );
      var owner = bot.users.get(bot.config.Discord.ownerID);
      var f = new MessageEmbed()
        .setColor(0x1675db)
        .setAuthor(
          msg.author.username + " (" + msg.author.id + ")",
          msg.author.avatarURL()
        )
        .addField(
          "Feedback Recieved from #" +
            msg.channel.name +
            " in " +
            msg.guild.name,
          args.join(" ")
        )
        .setFooter(bot.user.username, `${bot.user.avatarURL()}`)
        .setTimestamp();
      owner.send(f);
    }
  }
}

module.exports = feedback;
