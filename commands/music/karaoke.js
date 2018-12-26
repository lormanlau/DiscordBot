const Command = require(`${process.cwd()}/base/Command.js`);

class karaoke extends Command {
  constructor(client) {
    super(client, {
      name: "karaoke",
      description: "Start a karaoke party!",
      usage: "karaoke",
      aliases: ["k"],
      permLevel: 1
    });
  }

  async run(bot, msg, args, level) {
    let option = args[0];
    args.shift();

    if (option == "open") {
      if (!msg.member.hasPermission("MANAGE_MESSAGES")) return;
      if (bot.karaokeInProgress)
        return msg.reply("a karaoke event is already in progress!");

      bot.karaokeInProgress = true;
      bot.karaokeIsOpen = true;
      bot.karaokeQueue = [];
      bot.karaokeHost = msg.member;
      bot.karaokePerformer = null;

      await msg.guild.roles.get("521746283447189524").setMentionable(true);
      await bot.channels
        .get("518940742194954291")
        .send(
          "🎤 Hey <@&521746283447189524>, it's time for another **KARAOKE PARTY!** Your host today will be " +
            bot.karaokeHost.toString() +
            "! We'll be starting in a few minutes, so do `/k join` to queue up and get ready to sing your hearts out!"
        );
      await msg.guild.roles.get("521746283447189524").setMentionable(false);
    } else if (option == "join") {
      if (!bot.karaokeInProgress)
        return msg.reply("there's no karaoke in progress right now :(");
      else if (!bot.karaokeIsOpen)
        return msg.reply("the queue is closed... maybe next time!");
      else if (bot.karaokeQueue.indexOf("<@" + msg.author.id + ">") > -1)
        return msg.reply("you're already in the queue!");
      else if (
        !msg.member.voice.channel ||
        msg.member.voice.channel.id != "517095011225960458"
      )
        return msg.reply("you aren't in the Karaoke voice channel!");

      bot.karaokeQueue.push(msg.author.id);
      msg.reply(
        "you've been added to the queue at position " +
          bot.karaokeQueue.length +
          "! Current queue:",
        {
          embed: {
            title: "Karaoke Queue",
            description: "**Up Next:** " + bot.karaokeQueue.join(">\n<@"),
            color: msg.guild.me.displayColor
          }
        }
      );
    } else if (option == "start" || option == "begin") {
      if (!msg.member.hasPermission("MANAGE_MESSAGES")) return;
      if (bot.karaokeQueue.length == 0)
        msg.reply("there aren't enough people in queue to begin!");

      bot.karaokePerformer = bot.karaokeQueue.shift();

      bot.channels
        .get("518940742194954291")
        .send(
          "🎉🎉🎉 LET THE PARTY BEGIN! First up: <@" +
            bot.karaokePerformer +
            ">!",
          {
            embed: {
              title: "Karaoke Queue",
              description: "**Up Next:** " + bot.karaokeQueue.join(">\n<@"),
              color: msg.guild.me.displayColor
            }
          }
        );
    } else if (option == "close") {
      if (!msg.member.hasPermission("MANAGE_MESSAGES")) return;
      bot.karaokeIsOpen = false;
      bot.channels
        .get("518940742194954291")
        .send(
          "The karaoke queue has been closed! Thanks for coming, and join in next time!"
        );
    } else if (option == "next") {
      if (!msg.member.hasPermission("MANAGE_MESSAGES")) return;
      if (bot.karaokeQueue.length == 0)
        return msg.reply("there isn't anyone left in queue :(");

      bot.lastPerformer = bot.karaokePerformer;
      bot.karaokePerformer = bot.karaokeQueue.shift();

      bot.channels
        .get("518940742194954291")
        .send(
          "Thanks for an amazing performance, " +
            bot.lastPerformer +
            "! Next up: <@" +
            bot.karaokePerformer +
            ">!",
          {
            embed: {
              title: "Karaoke Queue",
              description: "**Up Next:** " + bot.karaokeQueue.join(">\n<@"),
              color: msg.guild.me.displayColor
            }
          }
        );
    } else if (option == "end") {
      bot.channels
        .get("518940742194954291")
        .send(
          "Thanks for coming out to another great karaoke event! This one is now over, see you next time!"
        );

      bot.karaokeInProgress = null;
      bot.karaokeIsOpen = null;
      bot.karaokeQueue = null;
      bot.karaokeHost = null;
      bot.karaokePerformer = null;
    } else if (option == "queue") {
      if (!bot.karaokeInProgress)
        return msg.reply("there's no karaoke in progress right now :(");
      let list = "";
      for (var i = 0; i < bot.karaokeQueue.length; i++) {
        list += "<@" + bot.karaokeQueue[i] + ">\n";
      }
      bot.channels.get("518940742194954291").send({
        embed: {
          title: "Karaoke Queue",
          description: "**Up Next:** " + list,
          color: msg.guild.me.displayColor
        }
      });
    }
  }
}

module.exports = karaoke;
