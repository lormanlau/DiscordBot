module.exports = class {
  constructor(bot) {
    this.bot = bot;
  }

  async run(bot, member) {
    let channels = {
      rules: "516804039267057664",
      roles: "516791643819474945",
      intros: "516534316138758144",
      spam: "516783390859591680",
      general: "516696945134141440"
    };
    let { MessageEmbed } = require("discord.js");

    let welcome = new MessageEmbed()
      .setColor("#843DA4")
      .setAuthor(
        "Welcome to the " + member.guild.name + " server!",
        member.guild.iconURL(),
        "https://discord.subtleasiantra.it"
      )
      .setThumbnail(member.guild.iconURL())
      .setDescription(
        "Here's some information to help you out! Please take a few moments to read it!"
      )
      .addField(
        ":newspaper: Read our rules!",
        `Check out our rules in <#${
          channels.rules
        }>! It shouldn't take long to read, but we expect you to follow them!`
      )
      .addField(
        ":tada: Assign yourself some tags!",
        `To assign yourself some tags based on yourself and your interests, head over to <#${
          channels.roles
        }> and react to some roles! :ok_hand:`
      )
      .addField(
        ":microphone2: Introduce Yourself!",
        `Introduce yourself by doing \`/addintro your-intro-here\` in <#${
          channels.spam
        }>! It'll then appear in <#${
          channels.intros
        }> for everyone to see! :blush:`
      )
      .addField(
        ":birthday: Set your birthday!",
        `Set your birthday with the bot by doing \`/setbirthday month day\` in <#${
          channels.spam
        }>! This will give you a special role on your birthday :smile:`
      )
      .addField(
        ":handshake: Get to know people!",
        `This server is a great place to get to know some new Asian friends! Hop on over to <#${
          channels.general
        }> or one of our many interest based channels to meet our amazing community!`
      )
      .addField(
        ":question: Any questions?",
        "Just DM me if you have any questions, and I'll forward your question on to our team, who will respond as soon as they can!"
      )
      .addField(
        "<a:blobdance:522317384506146828> Have fun!",
        "Thank for joining the server, and we hope you have an amazing experience! We love this server, and hope you do as well!"
      )
      .setFooter(member.guild.name, member.guild.iconURL())
      .setTimestamp();

    member.user.send({ embed: welcome });
  }
};
