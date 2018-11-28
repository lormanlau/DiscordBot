const Command = require(`${process.cwd()}/base/Command.js`);

class timeout extends Command {
  constructor(client) {
    super(client, {
      name: "timeout",
      description: "Times out a channel (keeps users from sending messages)",
      usage: "timeout <duration>",
      aliases: [],
      permLevel: 2
    });
  }

  async run(bot, msg, args, level) {
    var time = args[0];

    if (!isNaN(time)) {
      let id = msg.guild.roles.find(role => role.name == `@everyone`).id;
      let currentOverwrites = msg.channel.permissionOverwrites;

      msg.channel
        .updateOverwrite(id, {
          SEND_MESSAGES: false
        })
        .then(
          msg.channel
            .send(
              `**This channel has been timed out for ${time} seconds by ${
                msg.author
              }.**`
            )
            .then(msg2 => {
              setTimeout(() => {
                msg2.edit("**The timeout period has elapsed.**");
                msg2.channel.overwritePermissions({
                  permissionOverwrites: currentOverwrites,
                  reason: "Channel Timeout"
                });
              }, time * 1000);
            })
        );
    }
  }
}

module.exports = timeout;
