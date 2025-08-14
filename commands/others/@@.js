/*CMD
  command: @@
  help: 
  need_reply: false
  auto_retry_time: 
  folder: others

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

// Achivements 

// we will check if user has achieved anything after *each* command
let sheetDetailsProp = Bot.getProperty("sheetDetails") || {};

function isAchievedAchievement(user_info, sheet_info) {
  const achivementsList = achievements(user_info, sheet_info);

  achivementsList.forEach(achiv => {
    if (!achiv || typeof achiv.name !== "string") return; 
    
    const alreadyAchieved = achieved_achivements.some(a => a.name === achiv.name);
    if (achiv.condition() && !alreadyAchieved) {
      userAchieved(achiv);
    }
  });
}

function userAchieved(achiv) {
  const method = "sendMessage";

  const option = {
    en: { text: `*Achievement Unlocked!* ${achiv.name}`, parse_mode: "Markdown" },
    ru: { text: `*Достижение разблокировано!* ${achiv.name}`, parse_mode: "Markdown" }
  };

  Api[method](option[systemLang]);

  achieved_achivements.push(achiv);
  User.setProperty("achieved_achievements", achieved_achivements, "json");
}



isAchievedAchievement(userStats, sheetDetailsProp);
