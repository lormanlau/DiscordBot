const Command = require(`${process.cwd()}/base/Command.js`);

class restart extends Command {
  constructor(client) {
    super(client, {
      name: "restart",
      description: "Restarts the bot.",
      usage: "restart",
      aliases: [],
      permLevel: 8
    });
  }

  async run(bot, msg, args, level) {
    if (!bot.shard) {
      msg.reply(bot.user.username + " is restarting...");
    } else {
      msg.channel.send(
        "Shard " +
          bot.shard.id +
          " of " +
          bot.user.username +
          " is restarting..."
      );
    }
    setTimeout(() => {
      bot.destroy();
      process.exit(0);
    }, 1000);
  }
}

module.exports = restart;
