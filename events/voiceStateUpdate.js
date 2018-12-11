module.exports = class {
  constructor(bot) {
    this.bot = bot;
  }

  async run(bot, oldState, newState) {
    if (
      newState.channel &&
      newState.channel.id == "517095011225960458" &&
      bot.karaokeInProgress &&
      "<@" + newState.member.user.id + ">" != bot.karaokePerformer &&
      newState.member != bot.karaokeHost
    ) {
      newState.setMute(true);
    }

    if (!newState.channel || newState.channel.id != "517095011225960458") {
      newState.setMute(false);
    }
  }
};
