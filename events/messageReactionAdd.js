module.exports = class {
  constructor(bot) {
    this.bot = bot;
  }

  async run(bot, reaction, user) {
    if (bot.reactionMessages[reaction.message.id]) {
      bot.channels
        .get("516545655674503178")
        .send(
          `User ${user.tag} reacted to message ${reaction.message.id} in ${
            reaction.message.channel.name
          } with emoji ${reaction.emoji.name}.`
        );

      for (
        var i = 0;
        i < bot.reactionMessages[reaction.message.id].length;
        i++
      ) {
        let rr = bot.reactionMessages[reaction.message.id][i];
        let emoji = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name;
        if (rr.emoji == emoji) {
          bot.channels
            .get("516545655674503178")
            .send(
              `This matches with role ${
                reaction.message.guild.roles.get(rr.role).name
              }`
            );
        }
      }
    }
  }
};
