const Command = require(`${process.cwd()}/base/Command.js`);

class reply extends Command {
  constructor(client) {
    super(client, {
      name: "reply",
      description: "",
      usage: "reply",
      aliases: [],
      permLevel: 6
    });
  }

  async run(bot, msg, args, level) {
    let { MessageEmbed } = require("discord.js");
    var to = args.shift();
    var toUser = bot.users.get(to);
    if (!to) return msg.reply("please specify a valid user!");

    var message = args.join(" ");
    var f = new MessageEmbed()
      .setColor(0x1675db)
      .setAuthor(
        msg.author.username + " (" + msg.author.id + ")",
        msg.author.avatarURL()
      )
      .addField("Mod Mail Reply", message)
      .setFooter(bot.user.username, `${bot.user.avatarURL()}`)
      .setTimestamp();
    toUser.send(f);

    msg.reply(
      "your reply has been sent! Content: ```" + args.join(" ") + "```"
    );
  }
}

module.exports = reply;
