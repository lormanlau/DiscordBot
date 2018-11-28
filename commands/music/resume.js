const Command = require(`${process.cwd()}/base/Command.js`);

class resume extends Command {
  constructor(client) {
    super(client, {
      name: "resume",
      description: "Resume the currently playing song.",
      usage: "resume",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    bot.music.bot.resumeFunction(msg, args.join(" "), args);
  }
}

module.exports = resume;
