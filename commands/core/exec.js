const Command = require(`${process.cwd()}/base/Command.js`);

class exec extends Command {
  constructor(client) {
    super(client, {
      name: "exec",
      description: "Executes code on the console for developers.",
      usage: "exec <command>",
      aliases: [],
      permLevel: 8
    });
  }

  async run(bot, msg, args, level) {
    const { MessageEmbed } = require("discord.js");
    var embed = new MessageEmbed()
      .setFooter(`${msg.author.username}`, `${msg.author.avatarURL()}`)
      .setTimestamp();

    require("child_process").exec(args.join(" "), (err, stdout, stderr) => {
      if (err) {
        embed
          .setColor(0xff0000)
          .setTitle("Command Execution Error")
          .addField("Error", "```sh\n" + stderr + "```");
      } else {
        embed
          .setColor(0x00ff00)
          .setTitle("Command Execution Success")
          .addField("Result", "```sh\n" + stdout + "```");
      }
      msg.channel.send({ embed: embed });
    });
  }
}

module.exports = exec;
