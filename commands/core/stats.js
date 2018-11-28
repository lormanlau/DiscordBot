const Command = require(`${process.cwd()}/base/Command.js`);

class stats extends Command {
  constructor(client) {
    super(client, {
      name: "stats",
      description: "View various statistics about the bot's functionality.",
      usage: "stats",
      aliases: [],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    const os = require("os"),
      { MessageEmbed } = require("discord.js"),
      osu = require("os-utils");

    osu.cpuUsage(async v => {
      var vals = {},
        date = new Date(bot.uptime);

      vals.memory = Math.round((os.totalmem() - os.freemem()) / 1000000);
      vals.totalmem = Math.round(os.totalmem() / 1000000);
      vals.strDate =
        date.getUTCDate() -
        1 +
        "d " +
        date.getUTCHours() +
        "h " +
        date.getUTCMinutes() +
        "m " +
        date.getUTCSeconds() +
        "s";
      vals.owner = bot.users.get(bot.config.Discord.ownerID);

      if (bot.shard) {
        vals.shardid = bot.shard.id;
        vals.shardcount = bot.shard.count;
        vals.guilds = (await bot.shard.fetchClientValues("guilds.size")).reduce(
          (prev, val) => prev + val,
          0
        );
        vals.channels = (await bot.shard.fetchClientValues(
          "channels.size"
        )).reduce((prev, val) => prev + val, 0);
        vals.users = (await bot.shard.fetchClientValues("users.size")).reduce(
          (prev, val) => prev + val,
          0
        );
      } else {
        vals.shardid = 0;
        vals.shardcount = 1;
        vals.guilds = bot.guilds.size;
        vals.channels = bot.channels.size;
        vals.users = bot.users.size;
      }

      var stats = new MessageEmbed()
        .setAuthor(bot.user.username + " Stats", bot.user.avatarURL())
        .setFooter("Powered by " + bot.user.username, bot.user.avatarURL())
        .setTimestamp()
        .setColor(msg.guild.me.displayColor)
        .addField(
          ":man_with_gua_pi_mao: Owner",
          vals.owner.username +
            "#" +
            vals.owner.discriminator +
            "\n(" +
            vals.owner.id +
            ")",
          true
        )
        .addField(
          ":book: Library",
          "discord.js (v" + require("discord.js").version + ")",
          true
        )
        .addField(
          ":diamond_shape_with_a_dot_inside: Shard",
          vals.shardid + 1 + "/" + vals.shardcount,
          true
        )
        .addField(":speaking_head: Servers", vals.guilds, true)
        .addField(":keyboard: Channels", vals.channels, true)
        .addField(":man: Users Served", vals.users, true)
        .addField(":clock1: Uptime", vals.strDate, true)
        .addField(
          ":floppy_disk: RAM Usage",
          vals.memory + "MB / " + vals.totalmem + " MB",
          true
        )
        .addField(":desktop: CPU Usage", v.toFixed(2) * 100 + "%", true)
        .addField(":map: Host", os.hostname() + " (" + os.type() + ")", true);

      msg.channel.send({ embed: stats });
    });
  }
}

module.exports = stats;
