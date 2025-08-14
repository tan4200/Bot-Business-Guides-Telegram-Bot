/*CMD
  command: /adminAddNewAdmin_
  help: 
  need_reply: true
  auto_retry_time: 
  folder: ADMIN PANEL

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

if (!isAdmin(user.telegramid)) return;

const option_1 = {
  en: {
    text: "<b>Not valid format or admin already appointed.</b>",
    parse_mode: "html"
  },
  ru: {
    text: "<b>Недопустимый формат или администратор уже назначен.</b>",
    parse_mode: "html"
  }
};

const option_2 = {
  en: {
    text: "<b>Admins Updated!</b>",
    parse_mode: "html"
  },
  ru: {
    text: "<b>Админы обновлены!</b>",
    parse_mode: "html"
  }
};

const method = "sendMessage";


let adminsLists = message.split(",").map(el => el.trim());
if (adminsLists.some(el => isNaN(el) || el === "")) {
  Api[method](option_1[systemLang]);
  return;
}

adminPanel.adminsList = adminPanel.adminsList || [];


let added = false;

adminsLists.forEach(el => {
  if (!adminPanel.adminsList.includes(el)) {
    adminPanel.adminsList.push(el);
    added = true;
  }
});


Bot.setProperty("adminList", adminPanel.adminsList, "json");


if (!added) {
  Api[method](option_1[systemLang]);
} else {
  Api[method](option_2[systemLang]);
}
