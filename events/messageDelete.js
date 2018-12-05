module.exports = class {
  constructor(bot) {
    this.bot = bot;
  }

  async run(bot, message) {
    let { MessageEmbed } = require("discord.js");
    let deleted = new MessageEmbed()
      .setAuthor(
        message.author.tag + " (" + message.author.id + ")",
        message.author.avatarURL()
      )
      .setDescription(
        "Message " + message.id + " deleted in #" + message.channel.name
      )
      .addField("Content", message.content || "Not Cached...")
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);

    bot.channels.get("520004899463757826").send({ embed: deleted });
  }
};
