class Giveaway {
  constructor(bot, message, giveaway) {
    this.bot = bot;
    this.message = message;
    this.giveaway = giveaway;
    this.emoji = "🎁";
    this.timer;
  }

  pickWinners(users, numberOfWinners){
    var winners = users.filter(user => !user.bot).random(numberOfWinners);
    winners = winners.filter(user => user != undefined);
    return winners;
  }

  createDescription(winners, numberOfWinners){
    var description = "Winners: ";
    for (var i = 0; i < winners.length; i++){
      if (winners[i])
        description += `\n<@${winners[i].id}>`;
    }
    if (winners.length < numberOfWinners)
      description += "\nNot enough entries";
    if (winners.length <= 0)
      this.giveaway.winner_object = ["No winners"];
    return description;
  }

  sendGiveawayMessage() {
    var winners_message = "Congratulations ";
    if (this.giveaway.winner_object[0] == "No winners")
      return;
    for (var i = 0; i < this.giveaway.winner_object.length - 1; i++) {
      winners_message += `<@${this.giveaway.winner_object[i].id}>, `;
    }
    winners_message += `<@${this.giveaway.winner_object[this.giveaway.winner_object.length -1].id}>! You won the **${this.giveaway.prize}**!!!`;
    return this.message.channel.send(winners_message);
  }

  addGiveawayToGuild(){
    if (!this.message.guild.giveaways) {
      this.message.guild.giveaways = [this]
    } else {
      this.message.guild.giveaways.push(this)
    }
  }

  removeGiveawayFromGuild(){
    let currentGiveaways = this.message.guild.giveaways
    for (var i = 0; i < currentGiveaways.length; i++) {
      if (currentGiveaways[i].id == this.giveaway.id) {
        this.message.guild.giveaways.splice(i, 1);
        return;
      }
    }
  }

  async reroll(){
    var messageReaction = this.message.reactions.filter(messageReaction => messageReaction.emoji.name == this.emoji).first();
    var reactionUserStore = await messageReaction.users.fetch();
    var winners = this.pickWinners(reactionUserStore, this.giveaway.winners);
    this.giveaway.winner_object = winners;
    this.giveaway.reroll = true;
    this.message.edit({embed: 
      {
        title: this.giveaway.prize,
        description: this.createDescription(this.giveaway.winner_object, this.giveaway.winners) + `\nRerolled winners at: ${new Date().toLocaleString('en-US')}`,
        footer: {
          text: `${this.giveaway.winners} winner(s) | EndedAt: ${this.giveaway.endTime.toLocaleString('en-US')}`,
          iconURL: this.message.guild.iconURL()
        }
      }
    });
    this.sendGiveawayMessage();
    this.bot.database.update(
      "giveaways",
      this.giveaway ,
      this.bot.logger
    );
  }

  async finishGiveaway(){
    var messageReaction = this.message.reactions.filter( messageReaction => messageReaction.emoji.name == this.emoji ).first();
    var reactionUserStore = await messageReaction.users.fetch();
    var winners = this.pickWinners(reactionUserStore, this.giveaway.winners);
    this.giveaway.winner_object = winners;
    this.giveaway.endTime = new Date();
    this.message.edit({embed: 
      {
        title: this.giveaway.prize,
        description: this.createDescription(this.giveaway.winner_object, this.giveaway.winners),
        footer: {
          text: `${this.giveaway.winners} winner(s) | EndedAt: ${new Date().toLocaleString('en-US')}`,
          iconURL: this.message.guild.iconURL()
        }
      }
    });

    this.sendGiveawayMessage();

    this.bot.database.update(
      "giveaways",
      this.giveaway ,
      this.bot.logger
    );

    this.removeGiveawayFromGuild();
  }

  async run(){
    this.timer = setTimeout(this.finishGiveaway.bind(this),
    this.giveaway.endTime - new Date());
    this.addGiveawayToGuild()
  }
}

module.exports = Giveaway;