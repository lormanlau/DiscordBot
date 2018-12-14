const Command = require(`${process.cwd()}/base/Command.js`);

class sendrules extends Command {
  constructor(client) {
    super(client, {
      name: "sendrules",
      description: "",
      usage: "sendrules",
      aliases: [],
      permLevel: 7
    });
  }

  async run(bot, msg, args, level) {
    msg.channel.send(`
Hello everyone and welcome to the Subtle Asian Discord! We are an all-inclusive server with a focus on our Asian identities. This is a place for all of us to connect and hang out. We have a few rules to keep this community respectful and kind :D

1) Use common sense and be respectful! Behaviour that makes other members uncomfortable or negatively affects the server will have consequences. This means no prejudiced or violent speech against any person or group. We all want to be wholesome <3
    
2) No advertising unless you have permission. When sharing socials please keep it within the appropriate channels.
    
3) No spamming. Slowmode is enabled but keep media in relevant channels unless it is relevant to the conversation.
    
4) This server contains both adults and minors, please refrain from making sexually suggestive comments towards minors. Adults please make sure to identify yourself with an 18+ role.
    
5) No excessive use of uwu. pls.
    
6) We operate on a three strike system, breaking any rules will invoke "prison time" and a strike. Three strikes will be a temporary to permanent ban depending on severity of rule breaking. We also have the right to escalate to an immediate ban. 
    
7) Abuse of mod mail may result in a temporary mute or strike please refrain from spamming the mods :cryingcat: 
    
If you have a complaint feel free to dm a mod or admin <:uwu:516779303044907009>

NOTE: If you are a non-Asian, please understand that this community is an Asian space. We advise you to act with utmost respect:

- Any racist/anti-asian remarks will result in an immediate ban.
- Do not flaunt your race or skin color. Do not ask for attention. Do not demand attention.
- Please refrain from making or asking any racially charged statements or questions. This is not a place for you to conduct a research study.
- If you are harassed in a public channel, please block the person harassing you and report them to us so we can deal with it. 
  Do not respond under any circumstances.

As a reminder to everyone, personal harassment of any user on this discord server is strictly forbidden (including harassment on the basis of their race/ethnicity).
If you have any concerns with these rules, please send modmail or post in #feedback. Please do not cause any disruption in a public channel.`);

    msg.channel.send(`

**__MOD TEAM INTRODUCTIONS__**

**Our Admins:**

:star: <@171319044715053057> : Hi, I'm Michael and I own and help maintain this server :smiley: If you have an issue with the server, I'm the person to yell at. Other than that, I look forward to getting to know everyone!

<@337457236924432385> : Hi I'm Yang and I am an unpaid janitor who pings people, my favorite emojis are :uwu: and :pingsock:. I live in NY and I enjoy drinking soju until I pass out on a ktown curb

<@261008803917463555> : hi

<@194286799302950912> : eileen

<@86261500469055488> : Hey everyone, Shaq here.

**Our Head Moderators:**

<@163226606419181568> : Hi, I'm Anthony. I like playing video games (LoL/Tetris), listening to kpop, and watching anime (but I'm not a weeb!!). Studying actuarial studies and I'm from Australia!

<@178786505500786688> : I’m disco, please send me if people are acting sleazy, or if you want to vent at someone, I’m always here to listen.

<@135945315499900928> : Hi, I'm Marx, no not after Karl. 22 and living in Scotland. I travel a bit. Like like a lot of things and pretty open so I'm down for most convos

<@166378551719886849> : Hi, I'm Aaron. I enjoy long walks on the beach and curling up next to the fireplace with a nice book. I'm from Vancouver, BC, and am always looking for food suggestions, so hit me up! I am also currently aspiring to be a software developer so hit me up with those job offers/internships thanks im not desperate at all :^)
~~
~~
`);
    msg.channel.send(`
**Our Moderators:**

<@161138663609204736> : Hello my name is Amanda! 
Here’s some things about me: loves taking 8 hour naps, taiwanese, plays league, can speak mandarin, cantonese and understand taiwanese, can microwave anything

<@111290030495907840> : hi i’m kelly, slide into my dms with any issues you have or if you wanna send cute pics of your pet dog or something

<@178354746669662209> : Hello! I am xTian. I'm probably one of the friendliest mods here. I tend to troll a lot but I am serious when I need to be so don't test me.
I am a proud representative of Bosnians even though I'm from NYC. Don't forget to order some duck at our New Golden Duck Restaurant.
Message me if you have any problems with someone or just need to talk (vent)

<@203715834995015689> : Hihi, I’m Karen! Probably your most innocent staff. Come talk to me because I’m always willing to make friends, plus I’m friendly. :sparkling_heart:

<@278094426784661505> : hello, this is big dumb energy and i live in korea ツ

<@152159448473927680> : Hi I like to sing come join us in karaoke VC

<@312003177220407296> : kookie

<@163796113168531457>: I’m wuyang, I’m from the Texas DFW area. I enjoy reading, recording music, and checking out new games on steam. I’m currently working in enterprise technology sales. My bias is Jisoo Kim.

<@208000915712638978> : hi im trap

*Retired Moderators (RIP):*

- Michelle
- Goorace
~~
~~`);

    msg.channel.send(`
**Official Server Invite:**
https://discord.subtleasiantra.it/

If you are the owner of a Discord server and would like to propose a partnership, please DM <@517424830115610627> with both a link to your server and basic server information (e.g. server theme, member count, etc.) and we will evaluate on a case by case basis. 

__**Partners:**__
**Subtle Asian Gaming:** https://discord.gg/dsEw4g5
~~
~~`);
  }
}

module.exports = sendrules;
