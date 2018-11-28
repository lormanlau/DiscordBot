const Config = {
  /**
   * @const Discord: Object of Discord-related options.
   */
  Discord: {
    /**
     * @const token: Discord Token. May be obtained at https://discordapp.com/developers/applications/me.
     * @const prefix: Prefix for the bot to respond to commands.
     * @const ownerID: Level 8: Discord ID of the Bot Owner.
     * @const adminIDs: Level 7: Array of IDs of users with Bot Admin perms. Must be formatted as strings.
     * @const supportIDs: Level 6: Array of IDs of users who are Bot Support. Must be formatted as strings.
     */

    token: "",
    prefix: "",
    ownerID: "",
    adminIDs: [],
    supportIDs: []
  },

  /**
   * @const APIKeys: Object of API Keys.
   */
  APIKeys: {
    /**
     * @const GoogleKey: Google Key, used for the bot's music system
     */
    GoogleKey: ""
  },

  /**
   * @const RethinkDB: Object used to configre the bot's RethinkDB instance..
   */
  RethinkDB: {
    /**
     * @const ip: The IP of the RethinkDB instance.
     * @const username: The username used for the instance.
     * @const password: The password used for the instance.
     */
    ip: "",
    username: "",
    password: ""
  },

  /**
   * @const PermLevels: Permission levels for the bot.
   */
  PermLevels: [
    {
      level: 1,
      name: "User",
      check: () => true
    },
    {
      level: 2,
      name: "Moderator",
      check: (bot, msg) => {
        return msg.member.hasPermission("MANAGE_MESSAGES");
      }
    },
    {
      level: 3,
      name: "Administrator",
      check: (bot, msg) => {
        return msg.member.hasPermission("MANAGE_GUILD");
      }
    },
    {
      level: 4,
      name: "Server Owner",
      check: (bot, msg) =>
        msg.channel.type === 0
          ? msg.guild.ownerID === msg.author.id
            ? true
            : false
          : false
    },
    {
      level: 6,
      name: "Bot Support",
      check: (bot, msg) => bot.config.Discord.supportIDs.includes(msg.author.id)
    },
    {
      level: 7,
      name: "Bot Admin",
      check: (bot, msg) => bot.config.Discord.adminIDs.includes(msg.author.id)
    },
    {
      level: 8,
      name: "Bot Owner",
      check: (bot, msg) => bot.config.Discord.ownerID === msg.author.id
    }
  ]
};

module.exports = Config;
