class Giveaway {
  constructor(bot, message, giveaway) {
    this.bot = bot;
    this.message = message;
    this.giveaway = giveaway;
    this.emoji = "🎁";
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

  async run(){
    setTimeout(async () => {
      var messageReaction = this.message.reactions.filter( messageReaction => messageReaction.emoji.name == this.emoji ).first();
      var reactionUserStore = await messageReaction.users.fetch()
      var winners = this.pickWinners(reactionUserStore, this.giveaway.winners);
      this.giveaway.winner_object = winners;
      this.message.edit({embed: 
        {
          title: this.giveaway.prize,
          description: this.createDescription(this.giveaway.winner_object, this.giveaway.winners),
          footer: {
            text: `${this.giveaway.winners} winner(s) | EndedAt: ${this.giveaway.endTime.toLocaleString('en-US')}`,
            iconURL: this.message.guild.iconURL()
          }
        }
      })

      this.bot.database.update(
        "giveaways",
        this.giveaway ,
        this.bot.logger
      );

    }, this.giveaway.endTime - new Date())
  }
}

module.exports = Giveaway;