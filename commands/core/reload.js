const Command = require(`${process.cwd()}/base/Command.js`);

class reload extends Command {
  constructor(client) {
    super(client, {
      name: "reload",
      description: "",
      usage: "reload",
      aliases: [],
      permLevel: 8
    });
  }

  async run(bot, msg, args, level) {
    if (!args[0]) msg.reply("you need to provide a command to reload!");
    if (!bot.commands.get(args[0])) return;

    var path = bot.commands.get(args[0]).conf.location;
    await bot.unloadCommand(path, args[0]);
    await bot.loadCommand(path, args[0]);
    msg.reply(`the command ${args[0]} has been successfully reloaded.`);
  }
}

module.exports = reload;
