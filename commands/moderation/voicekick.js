const Command = require(`${process.cwd()}/base/Command.js`);

class voicekick extends Command {
  constructor(client) {
    super(client, {
      name: "voicekick",
      description: "",
      usage: "voicekick",
      aliases: [],
      permLevel: 3
    });
  }

  async run(bot, msg, args, level) {
    if (
      !msg.member.hasPermission("MOVE_MEMBERS") &&
      !msg.member.hasPermission("ADMINISTRATOR")
    ) {
      return msg.reply("you do not have permission to perform this action!");
    }
    if (
      !msg.guild.me.hasPermission("MOVE_MEMBERS") ||
      !msg.guild.me.hasPermission("MANAGE_CHANNELS")
    ) {
      return msg.reply("I don't have the permissions necessary to do that!");
    }
    if (!msg.mentions.users) {
      return msg.reply("please mention somebody!");
    }
    var member = msg.guild.members.get(msg.mentions.users.array()[0].id);
    if (!member.voice.channel) {
      return msg.reply("this member is not in voice!");
    }

    try {
      msg.guild.channels.create("temp", { type: "voice" }).then(c => {
        member.setVoiceChannel(c).then(() => {
          c.delete();
        });
      });
      msg.reply("<@" + member + "> has been successfullly kicked from voice.");
    } catch (e) {
      msg.channel.send(e);
      console.error(e);
    }
  }
}

module.exports = voicekick;
