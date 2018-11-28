module.exports = class {
  constructor(bot) {
    this.bot = bot;
  }

  async run(bot, msg) {
    let { MessageEmbed } = require("discord.js");

    if (msg.author.bot || !msg.guild) return;
    if (!bot.database || !bot.database.ready) return;

    bot.logger.log(
      `${msg.guild.name} - #${msg.channel.name} | ${msg.author.username} -> ${
        msg.content
      }`
    );

    if (!msg.channel.permissionsFor(msg.guild.me).has("SEND_MESSAGES")) return;

    if (msg.guild.me.displayHexColor == "#000000") msg.color = "#FFBB00";
    else msg.color = msg.guild.me.displayHexColor;

    let prefixes = [bot.config.Discord.prefix];

    const mention = new RegExp(`<@${bot.user.id}>`);
    const prefixMention = mention.exec(msg.content);
    if (prefixMention) prefixes.push(prefixMention);

    for (const thisPrefix of prefixes) {
      if (msg.content.toLowerCase().indexOf(thisPrefix) === 0)
        msg.prefix = thisPrefix;
    }

    if (msg.content.match(new RegExp(`^<@!?${bot.user.id}>$`))) {
      msg.channel.send(`The prefix is \`${prefixes[0]}\`.`);
      return;
    }

    if (!msg.prefix) return;

    const args = msg.content
      .slice(msg.prefix.length)
      .trim()
      .split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd =
      bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));

    if (!cmd) return;

    const level = this.bot.permlevel(msg);

    if (cmd.conf.permLevel > level) {
      msg.reply("you do not have permission to use this command!");
      return;
    }

    let blacklist = await bot.database.blacklist("id");
    if (blacklist.indexOf(msg.author.id) > -1) {
      msg.reply("you are blacklisted from the bot!");
      return;
    }

    msg.author.permLevel = level;

    msg.flags = [];
    while (args[0] && args[0][0] === "-") {
      msg.flags.push(args.shift().slice(1));
    }

    bot.logger.log(
      `${bot.config.PermLevels.find(l => l.level === level).name} ${
        msg.author.username
      } (${msg.author.id}) ran command ${cmd.help.name}`,
      "cmd"
    );

    cmd.run(bot, msg, args, level).catch(err => {
      msg.channel.send(
        "You shouldn't ever get this message. Please contact **" +
          bot.users.get("171319044715053057").tag +
          "** with this error:\n```LDIF\n" +
          err.stack +
          "```"
      );
    });
  }
};
