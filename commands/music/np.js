const Command = require(`${process.cwd()}/base/Command.js`);

class np extends Command {
  constructor(client) {
    super(client, {
      name: "np",
      description: "Displays the currently playing song.",
      usage: "np",
      aliases: ["nowplaying"],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    bot.music.bot.npFunction(msg, args.join(" "), args);
  }
}

module.exports = np;
