module.exports = class {
  constructor(bot) {
    this.bot = bot;
  }

  async run(bot, member) {
    var channels = {
      rules: "516804039267057664",
      roles: "516791643819474945",
      intros: "516534316138758144"
    };

    member.user.send(
      `Hello **${
        member.user.username
      }** and welcome to the Subtle Asian Discord server! Please read the rules in <#${
        channels.rules
      }>, assign yourself roles in <#${
        channels.roles
      }>, introduce yourself in <#${
        channels.intros
      }>, and have fun! DM this bot if you have ANY questions for the mod team!`
    );
  }
};
