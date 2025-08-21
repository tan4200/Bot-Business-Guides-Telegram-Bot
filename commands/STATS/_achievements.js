/*CMD
  command: /achievements
  help: 
  need_reply: false
  auto_retry_time: 
  folder: STATS
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

const achieved_achievements = User.getProperty("achieved_achievements", []); 

const option_1 = {
  en: {
    text: "<b>These are all the achievements you can achieve</b>. Some achievements may be hidden. Completed achivements are striked.\n\n",
    parse_mode: "html"
  },
  ru: {
    text: "<b>Это все достижения, которые вы можете получить</b>. Некоторые достижения могут быть скрыты. Полные достижения вычеркнуты.\n\n",
    parse_mode: "html"
  }
};

const option_2 = {
  en: {
    text: "No achievements available right now.",
    parse_mode: "html"
  },
  ru: {
    text: "На данный момент нет доступных достижений.",
    parse_mode: "html"
  }
};

const method = "sendMessage";

let achievements_array = achievements();

if (achievements_array.length < 1) {
  Api[method](option_2[systemLang]);
  return;
}

achievements_array.forEach(achiv => {
  const isAchieved = achieved_achievements.some(a => a.name === achiv.name);

  const enText = isAchieved
    ? `• <s>${achiv.name} — ${achiv.description.en}</s>\n`
    : `• <b>${achiv.name}</b> — ${achiv.description.en}\n`;

  const rusText = isAchieved
    ? `• <s>${achiv.name} — ${achiv.description.ru}</s>\n`
    : `• <b>${achiv.name}</b> — ${achiv.description.ru}\n`;

  if (!achiv.is_hidden || isAchieved) {
    option_1.en.text += enText;
    option_1.ru.text += rusText;
  }
});

Api[method](option_1[systemLang]);
