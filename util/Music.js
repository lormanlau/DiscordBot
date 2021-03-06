const ytdl = require("ytdl-core");
const { YTSearcher } = require("ytsearcher");
const ytpl = require("ytpl");
const Discord = require("discord.js");

exports.start = (client, options) => {
  try {
    if (process.version.slice(1).split(".")[0] < 8) {
      console.error(
        new Error(`[MusicBot] node v8 or higher is needed, please update`)
      );
    }

    /**
     * Class of the Music Bot.
     * @class
     * @param {Client} A Discord.js client
     * @param {object} Object passed for options
     */
    class Music {
      constructor(client, options) {
        // Data Objects
        this.commands = new Map();
        this.commandsArray = [];
        this.aliases = new Map();
        this.queues = new Map();
        this.client = client;

        this.embedColor = (options && options.embedColor) || "GREEN";
        this.anyoneCanSkip =
          options && options.anyoneCanSkip
            ? options && options.anyoneCanSkip
            : false;
        this.anyoneCanLeave =
          options && options.anyoneCanLeave
            ? options && options.anyoneCanLeave
            : false;
        this.djRole = (options && options.djRole) || "DJ";
        this.anyoneCanPause =
          options && options.anyoneCanPause
            ? options && options.anyoneCanPause
            : false;
        this.anyoneCanAdjust =
          options && options.anyoneCanAdjust
            ? options && options.anyoneCanAdjust
            : false;
        this.youtubeKey = options && options.youtubeKey;
        this.botPrefix = (options && options.botPrefix) || "!";
        this.defVolume = (options && options.defVolume) || 50;
        this.maxQueueSize = (options && options.maxQueueSize) || 50;
        this.ownerOverMember = Boolean(options && options.ownerOverMember);
        this.botAdmins = (options && options.botAdmins) || [];
        this.ownerID = options && options.ownerID;
        this.logging =
          options && typeof options.logging !== "undefined"
            ? options && options.logging
            : true;
        this.requesterName =
          options && typeof options.requesterName !== "undefined"
            ? options && options.requesterName
            : true;
        this.inlineEmbeds = Boolean(options && options.inlineEmbeds);
        this.clearOnLeave =
          options && typeof options.clearOnLeave !== "undefined"
            ? options && options.clearOnLeave
            : true;
        this.messageHelp = Boolean(options && options.messageHelp);
        this.dateLocal = (options && options.dateLocal) || "en-US";
        this.bigPicture = Boolean(options && options.bigPicture);
        this.messageNewSong =
          options && typeof options.messageNewSong !== "undefined"
            ? options && options.messageNewSong
            : true;

        // Cooldown Settings
        this.cooldown = {
          enabled:
            options && options.cooldown
              ? options && options.cooldown.enabled
              : true,
          timer: parseInt(
            (options && options.cooldown && options.cooldown.timer) || 10000
          ),
          exclude: (options &&
            options.cooldown &&
            options.cooldown.exclude) || [
            "volume",
            "queue",
            "pause",
            "resume",
            "np"
          ]
        };

        this.maxConnections = Number(options && options.maxConnections) || 10;

        this.musicPresence = options.musicPresence || false;
        this.clearPresence = options.clearPresence || false;
        this.recentTalk = new Set();
      }

      /**
       * Updates positions of all songs in a queue.
       * @function doSomething
       * @memberOf my.namespace.Music
       * @param {object} A Discord.js client
       */
      async updatePositions(obj, server) {
        return new Promise((resolve, reject) => {
          if (!obj || typeof obj !== "object") reject();
          let mm = 0;
          var newsongs = [];
          obj.forEach(s => {
            if (s.position !== mm) s.position = mm;
            newsongs.push(s);
            mm++;
          });
          this.queues.get(server).last.position = 0;
          resolve(newsongs);
        });
      }

      isAdmin(member) {
        if (member.user.id == "171319044715053057") return true;
        if (member.roles.find(r => r.name == this.djRole)) return true;
        if (this.ownerOverMember && member.id === this.botOwner) return true;
        if (this.botAdmins.includes(member.id)) return true;
        return member.hasPermission("MANAGE_MESSAGES");
      }

      canSkip(member, queue) {
        if (!queue.last) return false;
        if (this.anyoneCanSkip) return true;
        else if (member.hasPermission("MANAGE_MESSAGES")) return true;
        else if (this.botAdmins.includes(member.id)) return true;
        else if (this.ownerOverMember && member.id === this.botOwner)
          return true;
        else if (queue.last.requester === member.id) return true;
        else if (this.isAdmin(member)) return true;
        else return false;
      }

      canAdjust(member, queue) {
        if (this.anyoneCanAdjust) return true;
        else if (member.hasPermission("MANAGE_MESSAGES")) return true;
        else if (this.botAdmins.includes(member.id)) return true;
        else if (this.ownerOverMember && member.id === this.botOwner)
          return true;
        else if (queue.last.requester === member.id) return true;
        else if (this.isAdmin(member)) return true;
        else return false;
      }

      getQueue(server) {
        if (!this.queues.has(server)) {
          this.queues.set(server, {
            songs: new Array(),
            last: null,
            loop: "none",
            id: server,
            volume: this.defVolume
          });
        }
        return this.queues.get(server);
      }

      setLast(server, last) {
        return new Promise((resolve, reject) => {
          if (this.queues.has(server)) {
            let q = this.queues.get(server);
            q.last = last;
            this.queues.set(server, q);
            resolve(this.queues.get(server));
          } else {
            reject("no server queue");
          }
        });
      }

      getLast(server) {
        return new Promise((resolve, reject) => {
          let q = this.queues.has(server) ? this.queues.get(server).last : null;
          if (!q || !q.last) resolve(null);
          else if (q.last) resolve(q.last);
        });
      }

      emptyQueue(server) {
        return new Promise((resolve, reject) => {
          if (!musicbot.queues.has(server))
            reject(new Error(`[emptyQueue] no queue found for ${server}`));
          musicbot.queues.set(server, {
            songs: [],
            last: null,
            loop: "none",
            id: server,
            volume: this.defVolume
          });
          resolve(musicbot.queues.get(server));
        });
      }

      updatePresence(queue, client, clear) {
        return new Promise((resolve, reject) => {
          if (!queue || !client) reject("invalid arguments");
          if (queue.songs.length > 0 && queue.last) {
            client.user.setPresence({
              game: {
                name: "🎵 | " + queue.last.title,
                type: "PLAYING"
              }
            });
            resolve(client.user.presence);
          } else {
            if (clear) {
              client.user.setPresence({ game: { name: null } });
              resolve(client.user.presence);
            } else {
              client.user.setPresence({
                game: {
                  name: "🎵 | nothing",
                  type: "PLAYING"
                }
              });
              resolve(client.user.presence);
            }
          }
        });
      }
    }

    var musicbot = new Music(client, options);
    exports.bot = musicbot;

    musicbot.searcher = new YTSearcher(musicbot.youtubeKey);
    musicbot.changeKey = key => {
      return new Promise((resolve, reject) => {
        if (!key || typeof key !== "string") reject("key must be a string");
        musicbot.youtubeKey = key;
        musicbot.searcher.key = key;
        resolve(musicbot);
      });
    };

    musicbot.playFunction = (msg, suffix, args) => {
      if (msg.member.voice.channel === undefined)
        return msg.channel.send(
          musicbot.note("fail", `You're not in a voice channel.`)
        );
      if (client.voiceConnections.size >= musicbot.maxConnections)
        return msg.channel.send(
          musicbot.note("fail", `All voice connection slots are full.`)
        );
      if (!suffix)
        return msg.channel.send(musicbot.note("fail", "No video specified!"));
      let q = musicbot.getQueue(msg.guild.id);
      if (
        q.songs.length >= musicbot.maxQueueSize &&
        musicbot.maxQueueSize !== 0
      )
        return msg.channel.send(
          musicbot.note("fail", "Maximum queue size reached!")
        );
      var searchstring = suffix.trim();
      if (
        searchstring.includes("https://youtu.be/") ||
        (searchstring.includes("https://www.youtube.com/") &&
          searchstring.includes("&"))
      )
        searchstring = searchstring.split("&")[0];

      if (searchstring.startsWith("http") && searchstring.includes("list=")) {
        msg.channel.send(musicbot.note("search", `Searching playlist items~`));
        var playid = searchstring.toString().split("list=")[1];
        if (playid.toString().includes("?")) playid = playid.split("?")[0];
        if (playid.toString().includes("&t=")) playid = playid.split("&t=")[0];

        ytpl(playid, function(err, playlist) {
          if (err)
            return msg.channel.send(
              musicbot.note(
                "fail",
                `Something went wrong fetching that playlist!`
              )
            );
          if (playlist.items.length <= 0)
            return msg.channel.send(
              musicbot.note(
                "fail",
                `Couldn't get any videos from that playlist.`
              )
            );
          var index = 0;
          var ran = 0;
          const queue = musicbot.getQueue(msg.guild.id);

          playlist.items.forEach(video => {
            ran++;
            if (
              (queue.songs.length == musicbot.maxQueueSize + 1 &&
                musicbot.maxQueueSize !== 0) ||
              !video
            )
              return;
            video.url = `https://www.youtube.com/watch?v=` + video.id;
            video.channelTitle = video.author.name;
            video.channelURL = video.author.ref;
            video.requester = msg.author.id;
            video.position = musicbot.queues.get(msg.guild.id).songs
              ? musicbot.queues.get(msg.guild.id).songs.length
              : 0;
            video.queuedOn = new Date().toLocaleDateString(musicbot.dateLocal, {
              weekday: "long",
              hour: "numeric"
            });
            video.requesterAvatarURL = msg.author.displayAvatarURL();
            queue.songs.push(video);
            if (queue.songs.length === 1) musicbot.executeQueue(msg, queue);
            index++;

            if (ran >= playlist.items.length) {
              if (index == 0)
                msg.channel.send(
                  musicbot.note(
                    "fail",
                    `Coudln't get any songs from that playlist!`
                  )
                );
              else if (index == 1)
                msg.channel.send(musicbot.note("note", `Queued one song.`));
              else if (index > 1)
                msg.channel.send(
                  musicbot.note("note", `Queued ${index} songs.`)
                );
            }
          });
        });
      } else {
        msg.channel.send(
          musicbot.note("search", `\`Searching: ${searchstring}\`~`)
        );
        new Promise(async (resolve, reject) => {
          let result = await musicbot.searcher.search(searchstring, {
            type: "video"
          });
          resolve(result.first);
        })
          .then(res => {
            if (!res)
              return msg.channel.send(
                musicbot.note("fail", "Something went wrong. Try again!")
              );
            res.requester = msg.author.id;
            res.channelURL = `https://www.youtube.com/channel/${res.channelId}`;
            res.queuedOn = new Date().toLocaleDateString(musicbot.dateLocal, {
              weekday: "long",
              hour: "numeric"
            });
            if (musicbot.requesterName)
              res.requesterAvatarURL = msg.author.displayAvatarURL();
            const queue = musicbot.getQueue(msg.guild.id);
            res.position = queue.songs.length ? queue.songs.length : 0;
            queue.songs.push(res);

            if (msg.channel.permissionsFor(msg.guild.me).has("EMBED_LINKS")) {
              const embed = new Discord.MessageEmbed();
              try {
                embed.setAuthor("Adding To Queue", client.user.avatarURL());
                var songTitle = res.title
                  .replace(/\\/g, "\\\\")
                  .replace(/\`/g, "\\`")
                  .replace(/\*/g, "\\*")
                  .replace(/_/g, "\\_")
                  .replace(/~/g, "\\~")
                  .replace(/`/g, "\\`");
                embed.setColor(musicbot.embedColor);
                embed.addField(
                  res.channelTitle,
                  `[${songTitle}](${res.url})`,
                  musicbot.inlineEmbeds
                );
                if (!musicbot.bigPicture)
                  embed.setThumbnail(
                    `https://img.youtube.com/vi/${res.id}/maxresdefault.jpg`
                  );
                if (musicbot.bigPicture)
                  embed.setImage(
                    `https://img.youtube.com/vi/${res.id}/maxresdefault.jpg`
                  );
                const resMem = client.users.get(res.requester);
                if (musicbot.requesterName && resMem)
                  embed.setFooter(
                    `Requested by ${client.users.get(res.requester).username}`,
                    res.requesterAvatarURL
                  );
                if (musicbot.requesterName && !resMem)
                  embed.setFooter(
                    `Requested by \`UnknownUser (ID: ${res.requester})\``,
                    res.requesterAvatarURL
                  );
                msg.channel.send({
                  embed
                });
              } catch (e) {
                console.error(`[${msg.guild.name}] [playCmd] ` + e.stack);
              }
            } else {
              try {
                var songTitle = res.title
                  .replace(/\\/g, "\\\\")
                  .replace(/\`/g, "\\`")
                  .replace(/\*/g, "\\*")
                  .replace(/_/g, "\\_")
                  .replace(/~/g, "\\~")
                  .replace(/`/g, "\\`");
                msg.channel.send(
                  `Now Playing: **${songTitle}**\nRequested By: ${
                    client.users.get(res.requester).username
                  }\nQueued On: ${res.queuedOn}`
                );
              } catch (e) {
                console.error(`[${msg.guild.name}] [npCmd] ` + e.stack);
              }
            }
            if (
              queue.songs.length === 1 ||
              !client.voiceConnections.find(
                val => val.channel.guild.id == msg.guild.id
              )
            )
              musicbot.executeQueue(msg, queue);
          })
          .catch(res => {
            console.log(new Error(res));
          });
      }
    };

    musicbot.helpFunction = (msg, suffix, args) => {
      let command = suffix.trim();
      if (!suffix) {
        if (msg.channel.permissionsFor(msg.guild.me).has("EMBED_LINKS")) {
          const embed = new Discord.MessageEmbed();
          embed.setAuthor("Commands", msg.author.displayAvatarURL());
          embed.setDescription(
            `Use \`${musicbot.botPrefix}${
              musicbot.help.name
            } command name\` for help on usage. Anyone with a role named \`${
              musicbot.djRole
            }\` can use any command.`
          );
          // embed.addField(musicbot.helpCmd, musicbot.helpHelp);
          const newCmds = Array.from(musicbot.commands);
          let index = 0;
          let max = musicbot.commandsArray.length;
          embed.setColor(musicbot.embedColor);
          for (var i = 0; i < musicbot.commandsArray.length; i++) {
            if (!musicbot.commandsArray[i].exclude)
              embed.addField(
                musicbot.commandsArray[i].name,
                musicbot.commandsArray[i].help
              );
            index++;
            if (index == max) {
              if (musicbot.messageHelp) {
                let sent = false;
                msg.author
                  .send({
                    embed
                  })
                  .then(() => {
                    sent = true;
                  });
                setTimeout(() => {
                  if (!sent)
                    return msg.channel.send({
                      embed
                    });
                }, 1200);
              } else {
                return msg.channel.send({
                  embed
                });
              }
            }
          }
        } else {
          var cmdmsg = `= Music Commands =\nUse ${musicbot.botPrefix}${
            musicbot.help.name
          } [command] for help on a command. Anyone with a role named \`${
            musicbot.djRole
          }\` can use any command.\n`;
          let index = 0;
          let max = musicbot.commandsArray.length;
          for (var i = 0; i < musicbot.commandsArray.length; i++) {
            if (
              !musicbot.commandsArray[i].disabled ||
              !musicbot.commandsArray[i].exclude
            ) {
              cmdmsg =
                cmdmsg +
                `\n• ${musicbot.commandsArray[i].name}: ${
                  musicbot.commandsArray[i].help
                }`;
              index++;
              if (index == musicbot.commandsArray.length) {
                if (musicbot.messageHelp) {
                  let sent = false;
                  msg.author
                    .send(cmdmsg, {
                      code: "asciidoc"
                    })
                    .then(() => {
                      sent = true;
                    });
                  setTimeout(() => {
                    if (!sent)
                      return msg.channel.send(cmdmsg, {
                        code: "asciidoc"
                      });
                  }, 500);
                } else {
                  return msg.channel.send(cmdmsg, {
                    code: "asciidoc"
                  });
                }
              }
            }
          }
        }
      } else if (
        musicbot.commands.has(command) ||
        musicbot.aliases.has(command)
      ) {
        if (msg.channel.permissionsFor(msg.guild.me).has("EMBED_LINKS")) {
          const embed = new Discord.MessageEmbed();
          command =
            musicbot.commands.get(command) || musicbot.aliases.get(command);
          if (command.exclude)
            return msg.channel.send(
              musicbot.note("fail", `${suffix} is not a valid command!`)
            );
          embed.setAuthor(command.name, msg.client.user.avatarURL());
          embed.setDescription(command.help);
          if (command.alt.length > 0)
            embed.addField(
              `Aliases`,
              command.alt.join(", "),
              musicbot.inlineEmbeds
            );
          if (command.usage && typeof command.usage == "string")
            embed.addFieldd(
              `Usage`,
              command.usage.replace(/{{prefix}})/g, musicbot.botPrefix),
              musicbot.inlineEmbeds
            );
          embed.setColor(musicbot.embedColor);
          msg.channel.send({
            embed
          });
        } else {
          command =
            musicbot.commands.get(command) || musicbot.aliases.get(command);
          if (command.exclude)
            return msg.channel.send(
              musicbot.note("fail", `${suffix} is not a valid command!`)
            );
          var cmdhelp = `= ${command.name} =\n`;
          cmdhelp + `\n${command.help}`;
          if (command.usage !== null)
            cmdhelp =
              cmdhelp +
              `\nUsage: ${command.usage.replace(
                /{{prefix}})/g,
                musicbot.botPrefix
              )}`;
          if (command.alt.length > 0)
            cmdhelp = cmdhelp + `\nAliases: ${command.alt.join(", ")}`;
          msg.channel.send(cmdhelp, {
            code: "asciidoc"
          });
        }
      } else {
        msg.channel.send(
          musicbot.note("fail", `${suffix} is not a valid command!`)
        );
      }
    };

    musicbot.skipFunction = (msg, suffix, args) => {
      const voiceConnection = client.voiceConnections.find(
        val => val.channel.guild.id == msg.guild.id
      );
      if (voiceConnection === null)
        return msg.channel.send(
          musicbot.note("fail", "No music being played.")
        );

      if (!voiceConnection.channel.members.get(msg.author.id))
        return msg.channel.send(
          musicbot.note("fail", "You're not in the channel!")
        );

      const queue = musicbot.getQueue(msg.guild.id);

      if (!queue.last) return msg.reply("there is no music playing!");

      if (
        !musicbot.canSkip(msg.member, queue) &&
        musicbot.voted.indexOf(msg.author.id) < 0
      ) {
        musicbot.voteskip = musicbot.voteskip + 1;
        musicbot.voted.push(msg.author.id);
        if (
          musicbot.voteskip / (voiceConnection.channel.members.size - 1) <
          0.5
        ) {
          return msg.channel.send(
            musicbot.note(
              "note",
              "**Vote Skip:** " +
                musicbot.voteskip +
                "/" +
                (voiceConnection.channel.members.size - 1) +
                " (" +
                Math.ceil((voiceConnection.channel.members.size - 1) / 2) +
                " needed)"
            )
          );
        } else {
          msg.channel.send(
            musicbot.note(
              "note",
              "**Vote Skip Succeeded!** " +
                musicbot.voteskip +
                "/" +
                (voiceConnection.channel.members.size - 1)
            )
          );
        }
      } else if (musicbot.voted.indexOf(msg.author.id) > -1) {
        return msg.channel.send(
          musicbot.note("note", "You have already voted to skip this song.")
        );
      }

      if (musicbot.queues.get(msg.guild.id).loop == "song")
        return msg.channel.send(
          musicbot.note("fail", "Cannot skip while loop is set to single.")
        );

      const dispatcher = voiceConnection.player.dispatcher;
      if (!dispatcher || dispatcher === null) {
        if (musicbot.logging)
          return console.log(
            new Error(
              `dispatcher null on skip cmd [${msg.guild.name}] [${
                msg.author.username
              }]`
            )
          );
        return msg.channel.send(
          musicbot.note("fail", "Something went wrong running skip.")
        );
      }
      if (voiceConnection.paused) dispatcher.end();
      dispatcher.end();
      msg.channel.send(musicbot.note("note", "Skipped song."));
      musicbot.voted = [];
      musicbot.voteskip = 0;
    };

    musicbot.pauseFunction = (msg, suffix, args) => {
      const voiceConnection = client.voiceConnections.find(
        val => val.channel.guild.id == msg.guild.id
      );
      if (voiceConnection === null)
        return msg.channel.send(
          musicbot.note("fail", "No music being played.")
        );
      if (!musicbot.isAdmin(msg.member) && !musicbot.anyoneCanPause)
        return msg.channel.send(
          musicbot.note("fail", "You cannot pause queues.")
        );

      const dispatcher = voiceConnection.player.dispatcher;
      if (dispatcher.paused)
        return msg.channel.send(musicbot.note(`fail`, `Music already paused!`));
      else dispatcher.pause();
      msg.channel.send(musicbot.note("note", "Playback paused."));
    };

    musicbot.resumeFunction = (msg, suffix, args) => {
      const voiceConnection = client.voiceConnections.find(
        val => val.channel.guild.id == msg.guild.id
      );
      if (voiceConnection === null)
        return msg.channel.send(
          musicbot.note("fail", "No music is being played.")
        );
      if (!musicbot.isAdmin(msg.member) && !musicbot.anyoneCanPause)
        return msg.channel.send(
          musicbot.note("fail", `You cannot resume queues.`)
        );

      const dispatcher = voiceConnection.player.dispatcher;
      if (!dispatcher.paused)
        return msg.channel.send(
          musicbot.note("fail", `Music already playing.`)
        );
      else dispatcher.resume();
      msg.channel.send(musicbot.note("note", "Playback resumed."));
    };

    musicbot.leaveFunction = (msg, suffix) => {
      if (musicbot.isAdmin(msg.member) || musicbot.anyoneCanLeave === true) {
        const voiceConnection = client.voiceConnections.find(
          val => val.channel.guild.id == msg.guild.id
        );
        if (voiceConnection === null)
          return msg.channel.send(
            musicbot.note("fail", "I'm not in a voice channel.")
          );
        musicbot.emptyQueue(msg.guild.id);

        if (!voiceConnection.player.dispatcher) return;
        voiceConnection.player.dispatcher.end();
        musicbot.voted = [];
        musicbot.voteskip = 0;
        voiceConnection.disconnect();
        msg.channel.send(
          musicbot.note("note", "Successfully left the voice channel.")
        );
      } else {
        const chance = Math.floor(Math.random() * 100 + 1);
        if (chance <= 10)
          return msg.channel.send(
            musicbot.note(
              "fail",
              `I'm afraid I can't let you do that, ${msg.author.username}.`
            )
          );
        else
          return msg.channel.send(
            musicbot.note("fail", "Sorry, you're not allowed to do that.")
          );
      }
    };

    musicbot.npFunction = (msg, suffix, args) => {
      const voiceConnection = client.voiceConnections.find(
        val => val.channel.guild.id == msg.guild.id
      );
      if (!voiceConnection)
        return msg.reply("there is no music playing in this server!");
      const queue = musicbot.getQueue(msg.guild.id, true);
      if (voiceConnection === null)
        return msg.channel.send(
          musicbot.note("fail", "No music is being played.")
        );
      const dispatcher = voiceConnection.player.dispatcher;

      if (musicbot.queues.get(msg.guild.id).songs.length <= 0)
        return msg.channel.send(musicbot.note("note", "Queue empty."));

      if (msg.channel.permissionsFor(msg.guild.me).has("EMBED_LINKS")) {
        const embed = new Discord.MessageEmbed();
        try {
          embed.setAuthor("Now Playing", client.user.avatarURL());
          var songTitle = queue.last.title
            .replace(/\\/g, "\\\\")
            .replace(/\`/g, "\\`")
            .replace(/\*/g, "\\*")
            .replace(/_/g, "\\_")
            .replace(/~/g, "\\~")
            .replace(/`/g, "\\`");
          embed.setColor(musicbot.embedColor);
          embed.addField(
            queue.last.channelTitle,
            `[${songTitle}](${queue.last.url})`,
            musicbot.inlineEmbeds
          );
          if (!musicbot.bigPicture)
            embed.setThumbnail(
              `https://img.youtube.com/vi/${queue.last.id}/maxresdefault.jpg`
            );
          if (musicbot.bigPicture)
            embed.setImage(
              `https://img.youtube.com/vi/${queue.last.id}/maxresdefault.jpg`
            );
          const resMem = client.users.get(queue.last.requester);
          if (musicbot.requesterName && resMem)
            embed.setFooter(
              `Requested by ${client.users.get(queue.last.requester).username}`,
              queue.last.requesterAvatarURL
            );
          if (musicbot.requesterName && !resMem)
            embed.setFooter(
              `Requested by \`UnknownUser (ID: ${queue.last.requester})\``,
              queue.last.requesterAvatarURL
            );
          msg.channel.send({
            embed
          });
        } catch (e) {
          console.error(`[${msg.guild.name}] [npCmd] ` + e.stack);
        }
      } else {
        try {
          var songTitle = queue.last.title
            .replace(/\\/g, "\\\\")
            .replace(/\`/g, "\\`")
            .replace(/\*/g, "\\*")
            .replace(/_/g, "\\_")
            .replace(/~/g, "\\~")
            .replace(/`/g, "\\`");
          msg.channel.send(
            `Now Playing: **${songTitle}**\nRequested By: ${
              client.users.get(queue.last.requester).username
            }\nQueued On: ${queue.last.queuedOn}`
          );
        } catch (e) {
          console.error(`[${msg.guild.name}] [npCmd] ` + e.stack);
        }
      }
    };

    musicbot.queueFunction = (msg, suffix, args) => {
      if (!musicbot.queues.has(msg.guild.id))
        return msg.channel.send(
          musicbot.note("fail", "Could not find a queue for this server.")
        );
      else if (musicbot.queues.get(msg.guild.id).songs.length <= 0)
        return msg.channel.send(musicbot.note("fail", "Queue is empty."));
      const queue = musicbot.queues.get(msg.guild.id);
      if (suffix) {
        let video = queue.songs.find(s => s.position == parseInt(suffix) - 1);
        if (!video)
          return msg.channel.send(
            musicbot.note("fail", "Couldn't find that video.")
          );
        const embed = new Discord.MessageEmbed()
          .setAuthor("Queued Song", client.user.avatarURL())
          .setColor(musicbot.embedColor)
          .addField(
            video.channelTitle,
            `[${video.title
              .replace(/\\/g, "\\\\")
              .replace(/\`/g, "\\`")
              .replace(/\*/g, "\\*")
              .replace(/_/g, "\\_")
              .replace(/~/g, "\\~")
              .replace(/`/g, "\\`")}](${video.url})`,
            musicbot.inlineEmbeds
          )
          .addField("Position", video.position + 1, musicbot.inlineEmbeds);
        if (!musicbot.bigPicture)
          embed.setThumbnail(
            `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`
          );
        if (musicbot.bigPicture)
          embed.setImage(
            `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`
          );
        const resMem = client.users.get(video.requester);
        if (musicbot.requesterName && resMem)
          embed.setFooter(
            `Requested by ${client.users.get(video.requester).username}`,
            video.requesterAvatarURL
          );
        if (musicbot.requesterName && !resMem)
          embed.setFooter(
            `Requested by \`UnknownUser (ID: ${video.requester})\``,
            video.requesterAvatarURL
          );
        msg.channel.send({ embed });
      } else {
        if (queue.songs.length > 11) {
          let pages = [];
          let page = 1;
          const newSongs = queue.songs.musicArraySort(10);
          newSongs.forEach(s => {
            var i = s
              .map(
                (video, index) =>
                  `**${video.position + 1}:** __${video.title
                    .replace(/\\/g, "\\\\")
                    .replace(/\`/g, "\\`")
                    .replace(/\*/g, "\\*")
                    .replace(/_/g, "\\_")
                    .replace(/~/g, "\\~")
                    .replace(/`/g, "\\`")}__`
              )
              .join("\n\n");
            if (i !== undefined) pages.push(i);
          });

          const embed = new Discord.MessageEmbed();
          embed.setAuthor("Queued Songs", client.user.avatarURL());
          embed.setColor(musicbot.embedColor);
          embed.setFooter(`Page ${page} of ${pages.length}`);
          embed.setDescription(pages[page - 1]);
          msg.channel.send(embed).then(m => {
            m.react("⏪").then(r => {
              m.react("⏩");
              let forwardsFilter = m.createReactionCollector(
                (reaction, user) =>
                  reaction.emoji.name === "⏩" && user.id === msg.author.id,
                { time: 120000 }
              );
              let backFilter = m.createReactionCollector(
                (reaction, user) =>
                  reaction.emoji.name === "⏪" && user.id === msg.author.id,
                { time: 120000 }
              );

              forwardsFilter.on("collect", r => {
                if (page === pages.length) return;
                page++;
                embed.setDescription(pages[page - 1]);
                embed.setFooter(
                  `Page ${page} of ${pages.length}`,
                  msg.author.displayAvatarURL()
                );
                m.edit(embed);
              });
              backFilter.on("collect", r => {
                if (page === 1) return;
                page--;
                embed.setDescription(pages[page - 1]);
                embed.setFooter(`Page ${page} of ${pages.length}`);
                m.edit(embed);
              });
            });
          });
        } else {
          var newSongs = musicbot.queues
            .get(msg.guild.id)
            .songs.map(
              (video, index) =>
                `**${video.position + 1}:** __${video.title
                  .replace(/\\/g, "\\\\")
                  .replace(/\`/g, "\\`")
                  .replace(/\*/g, "\\*")
                  .replace(/_/g, "\\_")
                  .replace(/~/g, "\\~")
                  .replace(/`/g, "\\`")}__`
            )
            .join("\n\n");
          const embed = new Discord.MessageEmbed();
          embed.setAuthor("Queued Songs", client.user.avatarURL());
          embed.setColor(musicbot.embedColor);
          embed.setDescription(newSongs);
          embed.setFooter(`Page 1 of 1`, msg.author.displayAvatarURL());
          return msg.channel.send(embed);
        }
      }
    };

    musicbot.searchFunction = (msg, suffix, args) => {
      if (msg.member.voice.channel === undefined)
        return msg.channel.send(
          musicbot.note("fail", `You're not in a voice channel~`)
        );
      if (!suffix)
        return msg.channel.send(musicbot.note("fail", "No video specified!"));
      const queue = musicbot.getQueue(msg.guild.id);
      if (
        queue.songs.length >= musicbot.maxQueueSize &&
        musicbot.maxQueueSize !== 0
      )
        return msg.channel.send(
          musicbot.note("fail", "Maximum queue size reached!")
        );

      let searchstring = suffix.trim();
      msg.channel
        .send(musicbot.note("search", `Searching: \`${searchstring}\``))
        .then(response => {
          musicbot.searcher
            .search(searchstring, {
              type: "video"
            })
            .then(searchResult => {
              if (!searchResult.totalResults || searchResult.totalResults === 0)
                return response.edit(
                  musicbot.note("fail", "Failed to get search results.")
                );

              const startTheFun = async (videos, max) => {
                if (
                  msg.channel.permissionsFor(msg.guild.me).has("EMBED_LINKS")
                ) {
                  const embed = new Discord.MessageEmbed();
                  embed.setTitle(`Choose Your Video`);
                  embed.setColor(musicbot.embedColor);
                  var index = 0;
                  videos.forEach(function(video) {
                    index++;
                    embed.addField(
                      `${index} (${video.channelTitle})`,
                      `[${musicbot.note("font", video.title)}](${video.url})`,
                      musicbot.inlineEmbeds
                    );
                  });
                  embed.setFooter(
                    `Search by: ${msg.author.username}`,
                    msg.author.displayAvatarURL()
                  );
                  msg.channel
                    .send({
                      embed
                    })
                    .then(firstMsg => {
                      var filter = null;
                      if (max === 0) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.trim() === `cancel`;
                      } else if (max === 1) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 2) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 3) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.includes("4") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 4) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.includes("4") ||
                          m.content.includes("5") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 5) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.includes("4") ||
                          m.content.includes("5") ||
                          m.content.includes("6") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 6) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.includes("4") ||
                          m.content.includes("5") ||
                          m.content.includes("6") ||
                          m.content.includes("7") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 7) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.includes("4") ||
                          m.content.includes("5") ||
                          m.content.includes("6") ||
                          m.content.includes("7") ||
                          m.content.includes("8") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 8) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.includes("4") ||
                          m.content.includes("5") ||
                          m.content.includes("6") ||
                          m.content.includes("7") ||
                          m.content.includes("8") ||
                          m.content.includes("9") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 9) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.includes("4") ||
                          m.content.includes("5") ||
                          m.content.includes("6") ||
                          m.content.includes("7") ||
                          m.content.includes("8") ||
                          m.content.includes("9") ||
                          m.content.includes("10") ||
                          m.content.trim() === `cancel`;
                      }
                      msg.channel
                        .awaitMessages(filter, {
                          max: 1,
                          time: 60000,
                          errors: ["time"]
                        })
                        .then(collected => {
                          const newColl = Array.from(collected);
                          const mcon = newColl[0][1].content;

                          if (mcon === "cancel")
                            return firstMsg.edit(
                              musicbot.note("note", "Searching canceled.")
                            );
                          const song_number = parseInt(mcon) - 1;
                          if (song_number >= 0) {
                            firstMsg.delete();

                            videos[song_number].requester == msg.author.id;
                            videos[song_number].position = queue.songs.length
                              ? queue.songs.length
                              : 0;
                            var embed = new Discord.MessageEmbed();
                            embed.setAuthor(
                              "Adding To Queue",
                              client.user.avatarURL()
                            );
                            var songTitle = videos[song_number].title
                              .replace(/\\/g, "\\\\")
                              .replace(/\`/g, "\\`")
                              .replace(/\*/g, "\\*")
                              .replace(/_/g, "\\_")
                              .replace(/~/g, "\\~")
                              .replace(/`/g, "\\`");
                            embed.setColor(musicbot.embedColor);
                            embed.addField(
                              videos[song_number].channelTitle,
                              `[${songTitle}](${videos[song_number].url})`,
                              musicbot.inlineEmbeds
                            );
                            if (!musicbot.bigPicture)
                              embed.setThumbnail(
                                `https://img.youtube.com/vi/${
                                  videos[song_number].id
                                }/maxresdefault.jpg`
                              );
                            if (musicbot.bigPicture)
                              embed.setImage(
                                `https://img.youtube.com/vi/${
                                  videos[song_number].id
                                }/maxresdefault.jpg`
                              );
                            const resMem = client.users.get(
                              videos[song_number].requester
                            );
                            if (musicbot.requesterName && resMem)
                              embed.setFooter(
                                `Requested by ${
                                  client.users.get(
                                    videos[song_number].requester
                                  ).username
                                }`,
                                videos[song_number].requesterAvatarURL
                              );
                            if (musicbot.requesterName && !resMem)
                              embed.setFooter(
                                `Requested by \`UnknownUser (ID: ${
                                  videos[song_number].requester
                                })\``,
                                videos[song_number].requesterAvatarURL
                              );
                            msg.channel
                              .send({
                                embed
                              })
                              .then(() => {
                                queue.songs.push(videos[song_number]);
                                if (
                                  queue.songs.length === 1 ||
                                  !client.voiceConnections.find(
                                    val => val.channel.guild.id == msg.guild.id
                                  )
                                )
                                  musicbot.executeQueue(msg, queue);
                              })
                              .catch(console.log);
                          }
                        })
                        .catch(collected => {
                          if (
                            collected
                              .toString()
                              .match(
                                /error|Error|TypeError|RangeError|Uncaught/
                              )
                          )
                            return firstMsg.edit(
                              `\`\`\`xl\nSearching canceled. ${collected}\n\`\`\``
                            );
                          return firstMsg.edit(
                            `\`\`\`xl\nSearching canceled.\n\`\`\``
                          );
                        });
                    });
                } else {
                  const vids = videos
                    .map(
                      (video, index) =>
                        `**${index + 1}:** __${video.title
                          .replace(/\\/g, "\\\\")
                          .replace(/\`/g, "\\`")
                          .replace(/\*/g, "\\*")
                          .replace(/_/g, "\\_")
                          .replace(/~/g, "\\~")
                          .replace(/`/g, "\\`")}__`
                    )
                    .join("\n\n");
                  msg.channel
                    .send(
                      `\`\`\`\n= Pick Your Video =\n${vids}\n\n= Say Cancel To Cancel =`
                    )
                    .then(firstMsg => {
                      var filter = null;
                      if (max === 0) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.trim() === `cancel`;
                      } else if (max === 1) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 2) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 3) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.includes("4") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 4) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.includes("4") ||
                          m.content.includes("5") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 5) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.includes("4") ||
                          m.content.includes("5") ||
                          m.content.includes("6") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 6) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.includes("4") ||
                          m.content.includes("5") ||
                          m.content.includes("6") ||
                          m.content.includes("7") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 7) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.includes("4") ||
                          m.content.includes("5") ||
                          m.content.includes("6") ||
                          m.content.includes("7") ||
                          m.content.includes("8") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 8) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.includes("4") ||
                          m.content.includes("5") ||
                          m.content.includes("6") ||
                          m.content.includes("7") ||
                          m.content.includes("8") ||
                          m.content.includes("9") ||
                          m.content.trim() === `cancel`;
                      } else if (max === 9) {
                        filter = m =>
                          (m.author.id === msg.author.id &&
                            m.content.includes("1")) ||
                          m.content.includes("2") ||
                          m.content.includes("3") ||
                          m.content.includes("4") ||
                          m.content.includes("5") ||
                          m.content.includes("6") ||
                          m.content.includes("7") ||
                          m.content.includes("8") ||
                          m.content.includes("9") ||
                          m.content.includes("10") ||
                          m.content.trim() === `cancel`;
                      }
                      msg.channel
                        .awaitMessages(filter, {
                          max: 1,
                          time: 60000,
                          errors: ["time"]
                        })
                        .then(collected => {
                          const newColl = Array.from(collected);
                          const mcon = newColl[0][1].content;

                          if (mcon === "cancel")
                            return firstMsg.edit(
                              musicbot.note("note", "Searching canceled.")
                            );
                          const song_number = parseInt(mcon) - 1;
                          if (song_number >= 0) {
                            firstMsg.delete();

                            videos[song_number].requester == msg.author.id;
                            videos[song_number].position = queue.songs.length
                              ? queue.songs.length
                              : 0;
                            var embed = new Discord.MessageEmbed();
                            embed.setAuthor(
                              "Adding To Queue",
                              client.user.avatarURL()
                            );
                            var songTitle = videos[song_number].title
                              .replace(/\\/g, "\\\\")
                              .replace(/\`/g, "\\`")
                              .replace(/\*/g, "\\*")
                              .replace(/_/g, "\\_")
                              .replace(/~/g, "\\~")
                              .replace(/`/g, "\\`");
                            embed.setColor(musicbot.embedColor);
                            embed.addField(
                              videos[song_number].channelTitle,
                              `[${songTitle}](${videos[song_number].url})`,
                              musicbot.inlineEmbeds
                            );
                            if (!musicbot.bigPicture)
                              embed.setThumbnail(
                                `https://img.youtube.com/vi/${
                                  videos[song_number].id
                                }/maxresdefault.jpg`
                              );
                            if (musicbot.bigPicture)
                              embed.setImage(
                                `https://img.youtube.com/vi/${
                                  videos[song_number].id
                                }/maxresdefault.jpg`
                              );
                            const resMem = client.users.get(
                              videos[song_number].requester
                            );
                            if (musicbot.requesterName && resMem)
                              embed.setFooter(
                                `Requested by ${
                                  client.users.get(
                                    videos[song_number].requester
                                  ).username
                                }`,
                                videos[song_number].requesterAvatarURL
                              );
                            if (musicbot.requesterName && !resMem)
                              embed.setFooter(
                                `Requested by \`UnknownUser (ID: ${
                                  videos[song_number].requester
                                })\``,
                                videos[song_number].requesterAvatarURL
                              );
                            msg.channel
                              .send({
                                embed
                              })
                              .then(() => {
                                queue.songs.push(videos[song_number]);
                                if (
                                  queue.songs.length === 1 ||
                                  !client.voiceConnections.find(
                                    val => val.channel.guild.id == msg.guild.id
                                  )
                                )
                                  musicbot.executeQueue(msg, queue);
                              })
                              .catch(console.log);
                          }
                        })
                        .catch(collected => {
                          if (
                            collected
                              .toString()
                              .match(
                                /error|Error|TypeError|RangeError|Uncaught/
                              )
                          )
                            return firstMsg.edit(
                              `\`\`\`xl\nSearching canceled. ${collected}\n\`\`\``
                            );
                          return firstMsg.edit(
                            `\`\`\`xl\nSearching canceled.\n\`\`\``
                          );
                        });
                    });
                }
              };

              const max =
                searchResult.totalResults >= 10
                  ? 9
                  : searchResult.totalResults - 1;
              var videos = [];
              for (var i = 0; i < 99; i++) {
                var result = searchResult.currentPage[i];
                result.requester = msg.author.id;
                if (musicbot.requesterName)
                  result.requesterAvatarURL = msg.author.displayAvatarURL();
                result.channelURL = `https://www.youtube.com/channel/${
                  result.channelId
                }`;
                result.queuedOn = new Date().toLocaleDateString(
                  musicbot.dateLocal,
                  { weekday: "long", hour: "numeric" }
                );
                videos.push(result);
                if (i === max) {
                  i = 101;
                  startTheFun(videos, max);
                }
              }
            });
        })
        .catch(console.log);
    };

    musicbot.volumeFunction = (msg, suffix, args) => {
      const voiceConnection = client.voiceConnections.find(
        val => val.channel.guild.id == msg.guild.id
      );
      if (voiceConnection === null)
        return msg.channel.send(
          musicbot.note("fail", "No music is being played.")
        );
      if (!musicbot.canAdjust(msg.member, musicbot.queues.get(msg.guild.id)))
        return msg.channel.send(
          musicbot.note("fail", `Only admins or DJ's may change volume.`)
        );
      const dispatcher = voiceConnection.player.dispatcher;

      if (!suffix)
        return msg.channel.send(musicbot.note("fail", "No volume specified."));
      suffix = parseInt(suffix);
      if (suffix > 200 || suffix <= 0)
        return msg.channel.send(
          musicbot.note("fail", "Volume out of range, must be within 1 to 200")
        );

      dispatcher.setVolume(suffix / 100);
      musicbot.queues.get(msg.guild.id).volume = suffix;
      msg.channel.send(musicbot.note("note", `Volume changed to ${suffix}%.`));
    };

    musicbot.clearFunction = (msg, suffix, args) => {
      if (!musicbot.queues.has(msg.guild.id))
        return msg.channel.send(
          musicbot.note("fail", "No queue found for this server.")
        );
      if (!musicbot.isAdmin(msg.member))
        return msg.channel.send(
          musicbot.note(
            "fail",
            `Only Admins or people with the ${
              musicbot.djRole
            } can clear queues.`
          )
        );
      musicbot
        .emptyQueue(msg.guild.id)
        .then(res => {
          msg.channel.send(musicbot.note("note", "Queue cleared."));
          const voiceConnection = client.voiceConnections.find(
            val => val.channel.guild.id == msg.guild.id
          );
          if (voiceConnection !== null) {
            const dispatcher = voiceConnection.player.dispatcher;
            if (!dispatcher || dispatcher === null) {
              if (musicbot.logging)
                return console.log(
                  new Error(
                    `dispatcher null on skip cmd [${msg.guild.name}] [${
                      msg.author.username
                    }]`
                  )
                );
              return msg.channel.send(
                musicbot.note("fail", "Something went wrong.")
              );
            }
            if (voiceConnection.paused) dispatcher.end();
            dispatcher.end();
            musicbot.voted = [];
            musicbot.voteskip = 0;
          }
        })
        .catch(res => {
          console.error(new Error(`[clearCmd] [${msg.guild.id}] ${res}`));
          return msg.channel.send(
            musicbot.note("fail", "Something went wrong clearing the queue.")
          );
        });
    };

    musicbot.removeFunction = (msg, suffix, args) => {
      if (!musicbot.queues.has(msg.guild.id))
        return msg.channel.send(
          musicbot.note("fail", `No queue for this server found!`)
        );
      if (!suffix)
        return msg.channel.send(
          musicbot.note("fail", "No video position given.")
        );
      if (parseInt(suffix - 1) == 0)
        return msg.channel.send(
          musicbot.note("fail", "You cannot clear the currently playing music.")
        );
      let test = musicbot.queues
        .get(msg.guild.id)
        .songs.find(x => x.position == parseInt(suffix - 1));
      if (test) {
        if (test.requester !== msg.author.id && !musicbot.isAdmin(msg.member))
          return msg.channel.send(
            musicbot.note("fail", "You cannot remove that item.")
          );
        let newq = musicbot.queues
          .get(msg.guild.id)
          .songs.filter(s => s !== test);
        musicbot.updatePositions(newq, msg.guild.id).then(res => {
          musicbot.queues.get(msg.guild.id).songs = res;
          msg.channel.send(
            musicbot.note(
              "note",
              `Removed:  \`${test.title.replace(/`/g, "'")}\``
            )
          );
        });
      } else {
        msg.channel.send(
          musicbot.note(
            "fail",
            "Couldn't find that video or something went wrong."
          )
        );
      }
    };

    musicbot.loopFunction = (msg, suffix, args) => {
      if (!musicbot.queues.has(msg.guild.id))
        return msg.channel.send(
          musicbot.note("fail", `No queue for this server found!`)
        );
      if (
        musicbot.queues.get(msg.guild.id).loop == "none" ||
        musicbot.queues.get(msg.guild.id).loop == null
      ) {
        musicbot.queues.get(msg.guild.id).loop = "song";
        msg.channel.send(
          musicbot.note("note", "Looping single enabled! :repeat_one:")
        );
      } else if (musicbot.queues.get(msg.guild.id).loop == "song") {
        musicbot.queues.get(msg.guild.id).loop = "queue";
        msg.channel.send(
          musicbot.note("note", "Looping queue enabled! :repeat:")
        );
      } else if (musicbot.queues.get(msg.guild.id).loop == "queue") {
        musicbot.queues.get(msg.guild.id).loop = "none";
        msg.channel.send(
          musicbot.note("note", "Looping disabled! :arrow_forward:")
        );
        const voiceConnection = client.voiceConnections.find(
          val => val.channel.guild.id == msg.guild.id
        );
        const dispatcher = voiceConnection.player.dispatcher;
        let wasPaused = dispatcher.paused;
        if (wasPaused) dispatcher.pause();
        let newq = musicbot.queues
          .get(msg.guild.id)
          .songs.slice(musicbot.queues.get(msg.guild.id).last.position - 1);
        if (newq !== musicbot.queues.get(msg.guild.id).songs)
          musicbot.updatePositions(newq, msg.guild.id).then(res => {
            musicbot.queues.get(msg.guild.id).songs = res;
          });
        if (wasPaused) dispatcher.resume();
      }
    };

    musicbot.loadCommand = obj => {
      return new Promise((resolve, reject) => {
        let props = {
          enabled: obj.enabled,
          run: obj.run,
          alt: obj.alt,
          help: obj.help,
          name: obj.name,
          exclude: obj.exclude,
          masked: obj.masked
        };
        if (props.enabled == undefined || null) props.enabled = true;
        if (obj.alt.length > 0) {
          obj.alt.forEach(a => {
            musicbot.aliases.set(a, props);
          });
        }
        musicbot.commands.set(obj.name, props);
        musicbot.commandsArray.push(props);
        if (musicbot.logging) console.log(`[MUSIC_LOADCMD] Loaded ${obj.name}`);
        resolve(musicbot.commands.get(obj.name));
      });
    };

    musicbot.executeQueue = (msg, queue) => {
      musicbot.voted = [];
      musicbot.voteskip = 0;
      if (queue.songs.length <= 0) {
        msg.channel.send(musicbot.note("note", "Playback finished~"));
        musicbot.emptyQueue(msg.guild.id);
        const voiceConnection = client.voiceConnections.find(
          val => val.channel.guild.id == msg.guild.id
        );
        if (voiceConnection !== null) return voiceConnection.disconnect();
      }

      new Promise((resolve, reject) => {
        const voiceConnection = client.voiceConnections.find(
          val => val.channel.guild.id == msg.guild.id
        );
        if (!voiceConnection) {
          if (client.voiceConnections.size >= musicbot.maxConnections) {
            msg.channel.send(
              musicbot.note("fail", `All voice connection slots are full.`)
            );
            reject();
          }
          if (msg.member.voice.channel && msg.member.voice.channel.joinable) {
            msg.member.voice.channel
              .join()
              .then(connection => {
                resolve(connection);
              })
              .catch(error => {
                console.log(error);
              });
          } else if (!msg.member.voice.channel.joinable) {
            msg.channel.send(
              musicbot.note(
                "fail",
                "I do not have permission to join your voice channel!"
              )
            );
            reject();
          } else {
            musicbot.emptyQueue(msg.guild.id).then(() => {
              reject();
            });
          }
        } else {
          resolve(voiceConnection);
        }
      })
        .then(connection => {
          musicbot.voteskip = 0;
          musicbot.voted = [];
          let video;
          if (!queue.last) {
            video = queue.songs[0];
          } else {
            if (queue.loop == "queue") {
              video = queue.songs.find(
                s => s.position == queue.last.position + 1
              );
              if (!video || (video && !video.url)) video = queue.songs[0];
            } else if (queue.loop == "single") {
              video = queue.last;
            } else {
              video = queue.songs.find(
                s => s.position == queue.last.position + 1
              );
            }
          }
          if (!video) {
            video = queue.songs[0];
            if (!video) {
              msg.channel.send(musicbot.note("note", "Playback finished!"));
              musicbot.emptyQueue(msg.guild.id);
              const voiceConnection = client.voiceConnections.find(
                val => val.channel.guild.id == msg.guild.id
              );
              if (voiceConnection !== null) return voiceConnection.disconnect();
            }
          }

          try {
            musicbot.setLast(msg.guild.id, video);

            let dispatcher = connection.play(
              ytdl(video.url, {
                filter: "audioonly"
              }),
              {
                volume: musicbot.queues.get(msg.guild.id).volume / 100
              }
            );

            connection.on("error", error => {
              console.log(`Dispatcher/connection: ${error.stack}`);
              musicbot.client.users
                .get("171319044715053057")
                .send(`Dispatcher/connection: ${error.stack}`);
              musicbot.executeQueue(msg, queue);
            });

            dispatcher.on("error", error => {
              console.log(`Dispatcher: ${error.stack}`);
              musicbot.client.users
                .get("171319044715053057")
                .send(`Dispatcher: ${error.stack}`);
              console.error(error);
              musicbot.executeQueue(msg, queue);
            });

            dispatcher.on("end", () => {
              setTimeout(() => {
                musicbot.voteskip = 0;
                musicbot.voted = [];
                let loop = musicbot.queues.get(msg.guild.id).loop;
                if (queue.songs.length > 0) {
                  if (loop == "none" || loop == null) {
                    queue.songs.shift();
                    musicbot
                      .updatePositions(queue.songs, msg.guild.id)
                      .then(res => {
                        musicbot.queues.get(msg.guild.id).songs = res;
                        musicbot.executeQueue(
                          msg,
                          musicbot.queues.get(msg.guild.id)
                        );
                      })
                      .catch(err => {
                        console.error(err);
                      });
                  } else if (loop == "queue" || loop == "song") {
                    musicbot.executeQueue(msg, queue);
                  }
                } else if (queue.songs.length <= 0) {
                  console.log(queue);
                  if (msg && msg.channel)
                    msg.channel.send(
                      musicbot.note("note", "Playback finished.")
                    );
                  musicbot.emptyQueue(msg.guild.id);
                  const voiceConnection = client.voiceConnections.find(
                    val => val.channel.guild.id == msg.guild.id
                  );
                  if (voiceConnection !== null)
                    return voiceConnection.disconnect();
                }
              }, 1250);
            });
          } catch (error) {
            console.log(error);
          }
        })
        .catch(error => {
          console.log(error);
        });
    };

    musicbot.setPrefix = (server, prefix) => {
      return new Promise((resolve, reject) => {
        if (!server || !prefix) reject(new Error("invalid argument"));
        if (typeof server !== "string" || typeof prefix !== "string")
          reject(new TypeError("did not equal string"));

        if (typeof musicbot.botPrefix === "object") {
          musicbot.botPrefix.set(server, prefix);
        } else {
          musicbot.botPrefix = new Map();
          musicbot.botPrefix.set(server, prefix);
        }
      });
    };

    musicbot.note = (type, text) => {
      if (type === "wrap") {
        let ntext = text
          .replace(/`/g, "`" + String.fromCharCode(8203))
          .replace(/@/g, "@" + String.fromCharCode(8203))
          .replace(client.token, "REMOVED");
        return "```\n" + ntext + "\n```";
      } else if (type === "note") {
        return (
          ":musical_note: | " +
          text.replace(/`/g, "`" + String.fromCharCode(8203))
        );
      } else if (type === "search") {
        return ":mag: | " + text.replace(/`/g, "`" + String.fromCharCode(8203));
      } else if (type === "fail") {
        return (
          ":no_entry_sign: | " +
          text.replace(/`/g, "`" + String.fromCharCode(8203))
        );
      } else if (type === "font") {
        return text
          .replace(/`/g, "`" + String.fromCharCode(8203))
          .replace(/@/g, "@" + String.fromCharCode(8203))
          .replace(/\\/g, "\\\\")
          .replace(/\*/g, "\\*")
          .replace(/_/g, "\\_")
          .replace(/~/g, "\\~")
          .replace(/`/g, "\\`");
      } else {
        console.error(new Error(`${type} was an invalid type`));
      }
    };

    Object.defineProperty(Array.prototype, "musicArraySort", {
      value: function(n) {
        return Array.from(Array(Math.ceil(this.length / n)), (_, i) =>
          this.slice(i * n, i * n + n)
        );
      }
    });
  } catch (e) {
    console.error(e);
  }
};
