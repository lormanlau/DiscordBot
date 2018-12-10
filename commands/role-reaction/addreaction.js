const Command = require(`${process.cwd()}/base/Command.js`);
const { MessageEmbed } = require("discord.js");

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

    let msg_id = msgBind.id;

    let m = await msg.channel.send(
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
        let res = bot.database.reactions.get(msg.guild.id);
        if (res && res != {}) {
          for (var chanid in res) {
            for (var msgid in res[chanid]) {
              let messagedata = res[chanid][msgid];
              if (messagedata) {
                for (var i = 0; i < messagedata.length; i++) {
                  if (
                    messagedata[i] &&
                    messagedata[i].role &&
                    messagedata[i].role ==
                      msg.guild.roles.find(
                        role =>
                          role.name.toLowerCase() ==
                          message.content.toLowerCase()
                      ).id
                  )
                    return msg.reply(
                      "this role has already been assigned to a reaction in this server!"
                    );
                }
              }
            }
          }
        }

        let role_id = msg.guild.roles.find(
          role => role.name.toLowerCase() == message.content.toLowerCase()
        ).id;

        /*
          "guild id": {
              "channel id": {
                  "message id": [{
                          role: "0000",
                          emoji: "0000"
                  }]
              }
          }
        */

        await m.edit(
          "Please react to this message with the emoji you would like to bind to this role. Must be one in this server, or a default emoji."
        );

        let collector2 = m.createReactionCollector(
          (reaction, user) => msg.author.id == user.id,
          { max: 1 }
        );
        collector2.on("collect", (r, user) => {
          let emoji_id = r.emoji.id ? r.emoji.id : r.emoji.name;
          msgBind.react(emoji_id);

          let res = bot.database.reactions.get(msg.guild.id);
          if (res && res != {}) {
            for (var chanid in res) {
              if (res[chanid]) {
                let messagedata = res[chanid][msg_id];
                if (messagedata) {
                  for (var i = 0; i < messagedata.length; i++) {
                    if (messagedata[i].emoji == emoji_id)
                      return msg.reply(
                        "this emoji has already been assigned to a role in this message!"
                      );
                  }
                }
              }
            }
          }

          let response = new MessageEmbed()
            .setTitle("Role Reaction Set!")
            .addField("Message ID", msg_id, true)
            .addField("Role Attached", msg.guild.roles.get(role_id).name, true)
            .addField("Emoji Attached", r.emoji)
            .setColor(
              msg.guild.me.displayHexColor == "#000000"
                ? "#00FF00"
                : msg.guild.me.displayHexColor
            );
          msg.channel.send({ embed: response });
        });
      }
    });
  }
}

module.exports = addreaction;
