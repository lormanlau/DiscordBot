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
      await newState.setMute(true);
    }

    if (
      oldState.channel &&
      oldState.channel.id == "517095011225960458" &&
      (!newState.channel || newState.channel.id != "517095011225960458")
    ) {
      await newState.setMute(false);
    }
  }
};
