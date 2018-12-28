if (process.version.slice(1).split(".")[0] < 8)
  throw new Error("Node 8.0.0 or higher is required.");
if (require("discord.js").version.split(".")[0] < 12)
  throw new Error("Discord.js 12.0.0-dev or higher is required.");

process.chdir(__dirname);

const { ReqlDriverError } = require("rethinkdbdash");

const { Client, Collection } = require("discord.js"),
  path = require("path"),
  klaw = require("klaw"),
  Database = require("./util/Database");

class AsianBot extends Client {
  constructor(options) {
    super(options);

    // Declare various custom properties of the bot class
    this.config = require("./Config");
    this.logger = require("./util/Logger");
    this.utils = require("./util/Utils");
    this.music = require("./util/Music");
    this.commands = new Collection();
    this.events = new Collection();
    this.aliases = new Collection();
    this.ratelimits = new Collection();

    // Initializes bot database
    this.database = new Database(
      this.config.RethinkDB.ip,
      this.config.RethinkDB.username,
      this.config.RethinkDB.password
    );

    // Extend stuff here

    this.loadCommand = (commandPath, commandName) => {
      try {
        const props = new (require(`${commandPath}${path.sep}${commandName}`))(
          this
        );
        // this.logger.log(`Loading Command: ${props.help.name}. 👌`, "log");
        props.conf.location = commandPath;
        props.help.category = this.utils.getType(commandPath);
        if (props.init) {
          props.init(this);
        }
        this.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
          this.aliases.set(alias, props.help.name);
        });
        return false;
      } catch (e) {
        return `Unable to load command ${commandName}: ${e}`;
      }
    };

    this.permlevel = msg => {
      let permlvl = 0;

      const permOrder = bot.config.PermLevels.slice(0).sort((p, c) =>
        p.level < c.level ? 1 : -1
      );

      while (permOrder.length) {
        const currentLevel = permOrder.shift();
        if (msg.guild && currentLevel.guildOnly) continue;
        if (currentLevel.check(bot, msg)) {
          permlvl = currentLevel.level;
          break;
        }
      }
      return permlvl;
    };

    this.unloadCommand = async (commandPath, commandName) => {
      let command;
      if (bot.commands.has(commandName)) {
        command = bot.commands.get(commandName);
      } else if (bot.aliases.has(commandName)) {
        command = bot.commands.get(bot.aliases.get(commandName));
      }
      if (!command)
        return `The command \`${commandName}\` doesn"t seem to exist, nor is it an alias. Try again!`;

      if (command.shutdown) {
        await command.shutdown(bot);
      }
      delete require.cache[
        require.resolve(`${commandPath}${path.sep}${commandName}.js`)
      ];
      return false;
    };
  }
}

const bot = new AsianBot({ fetchAllMembers: true });

const init = async () => {
  const commandList = [];
  klaw("./commands")
    .on("data", item => {
      const cmdFile = path.parse(item.path);
      if (!cmdFile.ext || cmdFile.ext !== ".js") return;
      const response = bot.loadCommand(
        cmdFile.dir,
        `${cmdFile.name}${cmdFile.ext}`
      );
      commandList.push(cmdFile.name);
      if (response) bot.logger.error(response);
    })
    .on("end", () => {
      bot.logger.log(`Loaded ${commandList.length} commands.`);
    })
    .on("error", error => bot.logger.error(error));

  const eventList = [];
  klaw("./events")
    .on("data", item => {
      const eventFile = path.parse(item.path);
      if (!eventFile.ext || eventFile.ext !== ".js") return;
      const eventName = eventFile.name.split(".")[0];
      try {
        const event = new (require(`${eventFile.dir}${path.sep}${
          eventFile.name
        }${eventFile.ext}`))(bot);
        eventList.push(event);
        bot.events.set(eventName, event);
        bot.on(eventName, (...args) => event.run(bot, ...args));
        delete require.cache[
          require.resolve(
            `${eventFile.dir}${path.sep}${eventFile.name}${eventFile.ext}`
          )
        ];
      } catch (error) {
        bot.logger.error(`Error loading event ${eventFile.name}: ${error}`);
      }
    })
    .on("end", () => {
      bot.logger.log(`Loaded ${eventList.length} events.`);
    })
    .on("error", error => bot.logger.error(error));

  bot.levelCache = {};
  for (let i = 0; i < bot.config.PermLevels.length; i++) {
    const thisLevel = bot.config.PermLevels[i];
    bot.levelCache[thisLevel.name] = thisLevel;
  }

  bot.music.start(bot, {
    botPrefix: bot.config.Discord.prefix,
    cooldown: {
      disabled: true
    },
    ownerID: bot.config.Discord.ownerID,
    ownerOverMember: true,
    youtubeKey: bot.config.APIKeys.GoogleKey
  });

  bot.database.init();

  bot.logger.log("Connecting...");
  bot.login(require("./Config").Discord.token).then(() => {
    bot.logger.debug(`Bot successfully initialized.`);
  });
};

init();

bot
  .on("disconnect", () => bot.logger.warn("Bot is disconnecting..."))
  .on("reconnect", () => bot.logger.log("Bot reconnecting..."))
  .on("error", e => bot.logger.error(e))
  .on("warn", info => bot.logger.warn(info));
//  .on("debug", debug => bot.logger.log(debug));

process.on("unhandledRejection", function(err, promise) {
  if (typeof error == ReqlDriverError) {
    bot.database.reconnect();
  } else {
    console.error("Unhandled rejection:\n", promise, "\n\nReason:\n", err);
  }
});
