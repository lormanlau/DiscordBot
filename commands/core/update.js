const Command = require(`${process.cwd()}/base/Command.js`);

class update extends Command {
  constructor(client) {
    super(client, {
      name: "update",
      description: "Updates the bot from the GitHub repository.",
      usage: "update",
      aliases: ["pull"],
      permLevel: 8
    });
  }

  async run(bot, msg, args, level) {
    msg.channel.send("Updating...").then(e => {
      var evaled = require("child_process")
        .execSync("git pull origin master")
        .toString();
      e.channel.send("```" + evaled + "```");
      if (evaled.indexOf("Already up to date.") > -1) {
        e.channel.send("There was nothing to update!");
      } else {
        e.channel.send("New code successfully pulled!\nRestarting...");
        setTimeout(() => {
          process.exit(0);
        }, 2000);
      }
    });
  }
}

module.exports = update;
