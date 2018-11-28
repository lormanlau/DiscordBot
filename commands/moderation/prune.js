const Command = require(`${process.cwd()}/base/Command.js`);

class prune extends Command {
  constructor(client) {
    super(client, {
      name: "prune",
      description:
        "Prune x amount of messages, x messages from a user, or x messages from a bot.",
      usage: "prune (<num> | <mention> <num> | bots <num>)",
      aliases: ["p", "purge"],
      permLevel: 2
    });
  }

  async run(bot, msg, args, level) {
    if (!msg.guild.me.hasPermission("MANAGE_MESSAGES"))
      return msg.reply(
        "I need Manage Messages permissions to delete messages!"
      );
    var argument = args[0];
    if (!isNaN(argument)) {
      argument = Number(argument) + 1;
      msg.channel.messages.fetch({ limit: argument }).then(messages => {
        msg.channel.bulkDelete(messages, true);
      });

      msg.channel
        .send(
          "Deleted " +
            (argument - 1) +
            " messages under request of <@" +
            msg.author.id +
            ">"
        )
        .then(msg2 =>
          setTimeout(() => {
            msg2.delete();
          }, 5000)
        );
    } else if (msg.mentions.users.first()) {
      var num = args[1] || null;
      msg.channel.messages.fetch({ limit: 100 }).then(messages => {
        var msgar = messages.array();
        msgar = msgar.filter(
          msg2 => msg2.author.id === msg.mentions.users.first().id
        );
        if (num && !isNaN(num)) msgar = msgar.slice(0, Number(num));
        msg.channel.bulkDelete(msgar, true);
        msg.channel
          .send(
            "Deleted " +
              msgar.length +
              " messages from **" +
              msg.mentions.users.first().username +
              "** under request of <@" +
              msg.author.id +
              ">"
          )
          .then(success =>
            setTimeout(() => {
              success.delete();
            }, 5000)
          );
      });
    } else if (args[0] == "bots") {
      var num = args[1] || null;
      msg.channel.messages
        .fetch({
          limit: 100
        })
        .then(messages => {
          var msgar = messages.array();
          msgar = msgar.filter(m => m.author.bot);
          if (num && !isNaN(num)) msgar = msgar.slice(0, Number(num));
          msg.channel.bulkDelete(msgar, true);
          msg.channel
            .send(
              "Deleted " +
                msgar.length +
                " messages from **bots** under request of <@" +
                msg.author.id +
                ">"
            )
            .then(msg2 =>
              setTimeout(() => {
                msg2.delete();
              }, 5000)
            );
        });
    } else {
      msg.reply(
        "the correct command usage is `prune (<num> | <mention> <num> | bots <num>)`"
      );
    }
  }
}

module.exports = prune;
