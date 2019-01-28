const Command = require(`${process.cwd()}/base/Command.js`);

class server extends Command {
  constructor(client) {
    super(client, {
      name: "server",
      description: "Gives you information about the server.",
      usage: "server",
      aliases: ["guild", "serverinfo"],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    var { MessageEmbed } = require("discord.js");
    var members = 0,
      bots = 0;

    msg.guild.members.forEach(member => {
      if (member.user.bot) {
        bots++;
      } else {
        members++;
      }
    });

    var embed = new MessageEmbed()
      .setTitle(msg.guild.name)
      .setColor(msg.color)
      .setFooter("Triggered by " + msg.author.username, msg.author.avatarURL())
      .setThumbnail(msg.guild.iconURL())
      .setTimestamp()
      .addField("Name", msg.guild.name, true)
      .addField("Created", msg.guild.createdAt.toUTCString(), true)
      .addField("ID", msg.guild.id, true)
      .addField("Owner", msg.guild.owner.user.username, true)
      .addField("Region", msg.guild.region, true)
      .addField("Total Members", msg.guild.members.size, true)
      .addField("User Count", members, true)
      .addField("Bot Count", bots, true)
      .addField("Channel Count", msg.guild.channels.size, true)
      .addField("Roles", msg.guild.roles.size, true)
      .addField("Emoji Count", msg.guild.emojis.size, true)
      .addField("Verification Level", msg.guild.verificationLevel, true);

    if (msg.guild.features[0]) {
      embed
        .addField("Features", msg.guild.features.join("\n"))
        .setDescription(
          "<:partner:508526454917562369> Partnered Server <:partner:508526454917562369>"
        );
      if (msg.guild.features.includes("INVITE_SPLASH")) {
        embed.setImage(msg.guild.splashURL + "?size=2048");
      }
    } else {
      embed.setDescription("Server Information");
    }
    msg.channel.send({ embed: embed });
  }
}

module.exports = server;
