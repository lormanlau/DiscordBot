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
    // eslint-disable-line no-unused-vars
  }
}

module.exports = intro;
