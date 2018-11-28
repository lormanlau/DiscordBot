const Command = require(`${process.cwd()}/base/Command.js`);

class give extends Command {
  constructor(client) {
    super(client, {
      name: "give",
      description: "give <mentions> <role-names>",
      usage: "give",
      aliases: [],
      permLevel: 2
    });
  }

  async run(bot, msg, args, level) {
    /*if (
      !msg.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") &&
      !msg.member.hasPermission("ADMINISTRATOR")
    ) {
      return msg.channel.send(
        ":x: You do not have the necessary permissions to perform this action!"
      );
    }*/

    if (!msg.guild.me.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
      return msg.channel.send(
        ":x: I can't assign or deassign roles in this server!"
      );
    }

    var users = msg.mentions.users.array(),
      roles = args
        .splice(msg.mentions.users.size)
        .join(" ")
        .trim()
        .split(",");

    for (var r = 0; r < roles.length; r++) {
      let role = msg.guild.roles.find(role => role.name == roles[r].trim());

      if (!role) {
        msg.channel.send(":x: Role `" + roles[r] + "` does not exist!");
      } else if (
        msg.guild.members
          .get(bot.user.id)
          .roles.highest.comparePositionTo(role) < 1
      ) {
        msg.channel.send(
          ":x: I don't have permissions to edit the role `" +
            roles[r] +
            "`, please check the role order!"
        );
      } else if (msg.member.roles.highest.comparePositionTo(role) < 1) {
        msg.channel.send(
          ":x: Your highest role is lower than the role `" +
            roles[r] +
            "`, so you cannot assign it!"
        );
      } else {
        for (var i = 0; i < users.length; i++) {
          msg.guild.members
            .get(users[i].id)
            .roles.add(role)
            .then(m => {
              if (m.roles.has(role.id)) {
                msg.channel.send(
                  "Successfully added role `" +
                    role.name +
                    "` to " +
                    m.user.username +
                    "."
                );
              } else {
                msg.channel.send(
                  "Failed to add role `" +
                    role.name +
                    "` to " +
                    m.user.username +
                    "."
                );
              }
            })
            .catch(console.error);
        }
      }
    }
  }
}

module.exports = give;
