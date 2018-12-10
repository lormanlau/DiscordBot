const Command = require(`${process.cwd()}/base/Command.js`);

class clearwarnings extends Command {
  constructor(client) {
    super(client, {
      name: "clearwarnings",
      description: "Clear a user's warnings!",
      usage: "clearwarnings",
      aliases: ["clw"],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    let discorduser = msg.mentions.users.first()
      ? msg.mentions.users.first()
      : msg.author;
    bot.database.update(
      "users",
      { warnings: [], id: discorduser.id },
      bot.logger
    );

    msg.reply("cleared warnings for " + discorduser.toString());
  }
}

module.exports = clearwarnings;
