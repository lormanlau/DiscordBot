module.exports = class {
  constructor(bot) {
    this.bot = bot;
  }

  async run(bot, message, message2) {
    if (message.author.bot) return;
    if (message.channel.id == "520004899463757826") return;
    if (message.content == message2.content) return;
    let { MessageEmbed } = require("discord.js");
    let edited = new MessageEmbed()
      .setAuthor(
        message.author.tag + " (" + message.author.id + ")",
        message.author.avatarURL()
      )
      .setDescription(
        "Message " + message.id + " edited in #" + message.channel.name
      )
      .addField("Old Content", message.content || "Not Cached...")
      .addField("New Content", message2.content || "Not Cached...")
      .setTimestamp()
      .setColor("#FFFF00");

    bot.channels.get("520004899463757826").send({ embed: edited });
  }
};
