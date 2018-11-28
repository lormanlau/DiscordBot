const Command = require(`${process.cwd()}/base/Command.js`);

class reply extends Command {
  constructor(client) {
    super(client, {
      name: "reply",
      description: "",
      usage: "reply",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
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
  }
}

module.exports = reply;
