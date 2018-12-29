const Command = require(`${process.cwd()}/base/Command.js`);

class glist extends Command {
  constructor(client) {
    super(client, {
      name: "glist",
      description: "list current giveaways",
      usage: "glist",
      aliases: [],
      permLevel: 2
    });
  }

  async run(bot, msg, args, level) {
    let dbGList = await bot.database.giveaways.filter({winner_object: []});
    if (dbGList.length > 0) {
      console.log(dbGList)
      msg.reply(`There are current ${dbGList.length} giveaways active.`);
    } else {
      msg.reply("Currently no Giveaways active.");
    }
  }
}

module.exports = glist;
