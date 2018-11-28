exports.cleanAvatarURL = function(URL) {
  return URL.replace(/.webp$/g, ".png").replace(/.gif$/g, ".png");
};

exports.validateURL = function(textval) {
  var urlregex = /^(https?):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return urlregex.test(textval);
};

exports.getType = function(filepath) {
  while (filepath.indexOf("/") > -1 || filepath.indexOf("\\") > -1) {
    if (filepath.indexOf("/") > -1)
      filepath = filepath.substring(filepath.indexOf("/") + 1, filepath.length);
    else if (filepath.indexOf("\\") > -1)
      filepath = filepath.substring(
        filepath.indexOf("\\") + 1,
        filepath.length
      );
  }
  return filepath;
};

exports.checkForUpvote = async function(bot, user) {
  var res = await bot.apis.fetch(
    `https://discordbots.org/api/bots/${bot.user.id}/check?userid=${user.id}`,
    {
      method: "POST",
      headers: {},
      body: params
    }
  );
};
