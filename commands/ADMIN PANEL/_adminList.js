/*CMD
  command: /adminList
  help: 
  need_reply: false
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

const adminListText = adminPanel.adminsList
  .map(id => ` • <a href="tg://user?id=${id}">${id}</a>`)
  .join("\n");

const option = {
  en: {
    text: `<i>Admin Lists</i>\n\n${adminListText}`,
    parse_mode: "html",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Add New Admin", callback_data: "/adminAddNewAdmin" }]
      ]
    }
  },
  ru: {
    text: `<i>Список админов</i>\n\n${adminListText}`,
    parse_mode: "html",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Добавить админа", callback_data: "/adminAddNewAdmin" }]
      ]
    }
  }
};

const method = "sendMessage";
const selected = option[systemLang] 
Api[method](selected);
