/*CMD
  command: /adminAddNewAdmin
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

const option_1 = {
  en: {
    text: "<b>Send User Telegram ID(s) separated by , (comma).</b>",
    parse_mode: "html"
  },
  ru: {
    text: "Отправьте идентификатор(ы) пользователя Telegram, разделенные запятой.",
    parse_mode: "html"
  }
};

const method = "sendMessage";

const selected = option_1[systemLang];
Api[method](selected);

Bot.runCommand("/adminAddNewAdmin_");
