const Command = require(`${process.cwd()}/base/Command.js`);

class setbirthday extends Command {
  constructor(client) {
    super(client, {
      name: "setbirthday",
      description: "",
      usage: "setbirthday <month> <day>",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    let user = await bot.database.users.get(msg.author.id);
    if (user && user.birthday)
      return msg.reply("you have already set your birthday!");

    let month = args[0];
    let day = args[1];

    if (!isNaN(month) && !isNaN(day) && month <= 12 && day <= 31) {
      if (user) {
        await bot.database.users
          .get(msg.author.id)
          .update({ birthday: { month: month, day: day } });
      } else {
        await bot.database.users.insert({
          id: msg.author.id,
          birthday: { month: month, day: day }
        });
      }
      msg.reply(
        "Successfully set your birthday to " +
          month +
          "/" +
          day +
          "! You will not be able to change this."
      );
    } else {
      msg.reply("Invalid Input. Please try again!");
    }
  }
}

module.exports = setbirthday;
