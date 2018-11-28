class Database {
  constructor(ip, username, password) {
    const logger = require("./Logger");

    this.init = async bot => {
      this.ip = ip;
      this.username = username;
      this.password = password;
      this.bot = bot;

      this.r = require("rethinkdbdash")({
        port: 28015,
        host: ip,
        user: username,
        password: password,
        silent: true
      });

      logger.debug("Successfully established database connection.");
      await this.sync(bot);
    };

    this.sync = async bot => {
      try {
        this.r.dbCreate("asianbot");
      } catch (err) {}

      this.users = this.r.db("asianbot").table("users");
      logger.debug("Users Synchronized.");

      this.blacklist = this.r.db("asianbot").table("blacklist");
      if (!this.blacklist) {
        logger.debug("Created Blacklist.");
        this.blacklist = [];
      } else {
        logger.debug("Blacklist Synchronized.");
      }

      this.ready = true;
    };

    this.update = async (table, data, logger) => {
      if (
        (await this.r
          .db("asianbot")
          .table(table)
          .get(data.id)) != null
      )
        await this.r
          .db("asianbot")
          .table(table)
          .update(data);
      else
        await this.r
          .db("asianbot")
          .table(table)
          .insert(data);
      logger.debug(`Successsfully updated ${table} with value ${data}`);
    };

    this.reconnect = async () => {
      this.r.connect({
        port: 28015,
        host: this.ip,
        user: this.username,
        password: this.password,
        silent: true
      });

      logger.debug("Successfully reestablished database connection.");

      await this.sync(this.bot);
    };
  }
}

module.exports = Database;
