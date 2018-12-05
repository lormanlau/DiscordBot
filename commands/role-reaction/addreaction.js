const Command = require(`${process.cwd()}/base/Command.js`);

class addreaction extends Command {
  constructor(client) {
    super(client, {
      name: "addreaction",
      description: "",
      usage: "addreaction",
      aliases: [],
      permLevel: 3
    });
  }

  async run(bot, msg, args, level) {
    let msgBind = await msg.channel.messages.fetch(args.join(" "));

    if (!msgBind)
      return msg.reply("that message does not exist in this channel!");
    if (msgBind.reactions.size == 20)
      return msg.reply("there are already 20 reactions on this message!");

    let mid = msgBind.id;

    await m.edit(
      "Please send the role you would like to be given upon reaction."
    );

    let collector = await msg.channel.createMessageCollector(
      c => c.author == msg.author,
      { max: 1 }
    );
    collector.on("collect", async message => {
      if (
        msg.guild.roles.find(
          role => role.name.toLowerCase() == message.content.toLowerCase()
        ) &&
        msg.guild.roles.find(
          role => role.name.toLowerCase() == message.content.toLowerCase()
        ).editable
      ) {
        let res = bot.database.reactions.get(msgBind.id);
        if (res) {
          for (var i = 0; i < res.reactions.length; i++) {
            var role = await msg.guild.roles.get(res.reactions[i].role);
            if (role.name.toLowerCase() == message.content.toLowerCase()) {
              return msg.reply(
                "this role has already been assigned an emoji reaction!"
              );
            }
          }
        }

        let rid = msg.guild.roles.find(
          role => role.name.toLowerCase() == message.content.toLowerCase()
        ).id;

        /*
        
        obj = {
          id: "msgid",
          channel: "chanid",
          reactions: [
            {
              role: "0000",
              emoji: "0000"
            }
          ]
        };
        
        */

        await m.edit(
          "Please react to this message with the emoji you would like to bind to this role. Must be one in this server, or a default emoji."
        );

        let collector2 = m.createReactionCollector(
          (reaction, user) => msg.author.id == user.id,
          { max: 1 }
        );
        collector2.on("collect", (r, user) => {
          let ename = r.emoji.id ? r.emoji.id : r.emoji.name;
          msg.channel.send(ename);
          m.react(ename);
        });
      }
    });
  }
}

module.exports = addreaction;
