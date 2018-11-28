const Command = require(`${process.cwd()}/base/Command.js`);

class leave extends Command {
  constructor(client) {
    super(client, {
      name: "leave",
      description: "Make the bot leave the current voice channel.",
      usage: "leave",
      aliases: ["disconnect", "stop"],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    bot.music.bot.leaveFunction(msg, args.join(" "), args);
  }
}

module.exports = leave;
