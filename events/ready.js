const Giveaway = require(`${process.cwd()}/util/Giveaway.js`)

module.exports = class {
  constructor(bot) {
    this.bot = bot;
  }

  async run(bot) {
    let schedule = require("node-schedule");

    setTimeout(function() {
      bot.logger.ready(
        bot.user.username +
          " is ready! Serving " +
          bot.guilds.size +
          " servers."
      );
      bot.user.setActivity("with subtle asian traits", {
        type: "PLAYING"
      });

      function birthdays() {
        bot.users.get(bot.config.Discord.ownerID).send("Checking Birthdays");
        let d = new Date();
        bot.guilds
          .get("516463112980004875")
          .roles.get("517244087817076738")
          .members.forEach(member => {
            member.roles.remove("517244087817076738");
          });
        bot.database.users
          .filter({
            birthday: { day: d.getDate(), month: d.getMonth() + 1 }
          })
          .then(bday => {
            if (bday.length > 0) {
              for (var i = 0; i < bday.length; i++) {
                let user = bot.guilds
                  .get("516463112980004875")
                  .members.get(bday[i].id);
                if (user) {
                  user.roles.add("517244087817076738");
                  user.user.send(
                    "Since today is your birthday, you have been given a special role in Subtle Asian Discord! :tada:"
                  );
                }
              }
            }
          });
      }

      bot.birthdays = schedule.scheduleJob("* * 1 * *", birthdays());
    }, 1000);

    var giveaways = await bot.database.giveaways.filter({winner_object: []})
    for (var i = 0; i < giveaways.length; i++) {
      let giveaway = giveaways[i];
      let message = await bot.guilds.get(giveaways[i].guildID)
      .channels.get(giveaways[i].channelID)
      .messages.fetch(giveaways[i].id);

      new Giveaway(bot, message, giveaway).run();
    }
    bot.logger.debug("successfully restarted giveaways")
  }
};
