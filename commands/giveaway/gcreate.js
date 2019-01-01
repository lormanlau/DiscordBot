const Command = require(`${process.cwd()}/base/Command.js`);
const { MessageEmbed } = require("discord.js");
const Giveaway = require(`${process.cwd()}/util/Giveaway.js`);

class gcreate extends Command {
  constructor(client) {
    super(client, {
      name: "gcreate",
      description: "Creates a giveaway",
      usage: "gcreate <time> <winners> <prize>",
      aliases: [],
      permLevel: 2
    });
    this.emoji = "🎁";
  }

  parseTime(time){
    var unit = time.split("")[time.length - 1];
    var number = time.split(unit)[0];
    var now = new Date()
    if (isNaN(number)){
      return -1
    } else {
      number = parseInt(number);
    }
    if (unit == "d") {
      now.setDate(now.getDate() + number);
    } else if (unit == "h") {
      now.setHours(now.getHours() + number);
    } else if (unit == "m") {
      now.setMinutes(now.getMinutes() + number);
    } else if (unit == "s"){
      now.setSeconds(now.getSeconds() + number);
    }
    return now;
  }

  async run(bot, msg, args, level) {
    var giveaway = {
      startTime: new Date(),
      endTime: new Date(),
      prize: "",
      winners: 0,
      winner_object: [],
      guildID: msg.guild.id,
      channelID: msg.channel.id,
      id: 0
    }
    var time = this.parseTime(args[0]);
    if (time ==  -1) {
      return msg.reply("invalid syntax")
    }
    if (isNaN(args[1]) || args[1] < 1) {
      return msg.reply("invalid syntax")
    }
    giveaway.endTime = time;
    giveaway.winners = args[1];
    args.shift();
    args.shift();
    giveaway.prize = args.join(" ");
    var embed = new MessageEmbed();
    embed.setTitle(giveaway.prize)

    .setDescription(`React with ${this.emoji} to enter!`)
    .setFooter(
            `${giveaway.winners} winner(s) | endsAt: ${time.toLocaleString('en-US')}`,
            msg.guild.iconURL()
          )
    var gmessage = await msg.channel.send({embed: embed});
    gmessage.react(this.emoji);
    giveaway.id = gmessage.id;

    bot.database.update(
      "giveaways",
      giveaway,
      bot.logger
    );
    
    new Giveaway(bot, gmessage, giveaway).run();
  }
}

module.exports = gcreate;
