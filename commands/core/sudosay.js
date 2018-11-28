const Command = require(`${process.cwd()}/base/Command.js`);

class sudosay extends Command {
  constructor(client) {
    super(client, {
      name: "sudosay",
      description: "",
      usage: "sudosay",
      aliases: [],
      permLevel: 7
    });
  }

  async run(bot, msg, args, level) {
    let content = args.join(" ");
    if (content.indexOf("mention:") > -1) {
      if (content.indexOf(" ", content.indexOf("mention:") + 8) > -1) {
        var mention = content.substring(
          content.indexOf("mention:") + 8,
          content.indexOf(" ", content.indexOf("mention:") + 8)
        );
      } else {
        mention = content.substring(
          content.indexOf("mention:") + 8,
          content.length
        );
      }
      if (bot.users.get(mention)) {
        content = content.replace("mention:", "<@");
        content = content.replace(mention, mention + ">");
      }
      msg.channel.send(content);
    } else {
      msg.channel.send(content);
    }
    msg.delete();
  }
}

module.exports = sudosay;
