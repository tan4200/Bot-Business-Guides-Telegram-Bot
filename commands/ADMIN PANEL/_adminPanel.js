/*CMD
  command: /adminPanel
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

if (!isAdmin(user.telegramid)) return

adminPanel.inlineKeyboardRawData = {}
adminPanel.inlineKeyboardRawData.en = [
  [{ text: "Modify Sheet", callback_data: "/adminModifySheet" }],
  [{ text: "Add New Admin", callback_data: "/adminAddNewAdmin" }],
  [{ text: "View Admin", callback_data: "/adminList" }]
]
adminPanel.inlineKeyboardRawData.ru = [
  [{ text: "Изменить лист", callback_data: "/adminModifySheet" }],
  [{ text: "Добавить нового администратора", callback_data: "/adminAddNewAdmin" }],
  [{ text: "Посмотреть администратора", callback_data: "/adminList" }]
]



const option_1 = {
  en: {
    parse_mode: "html",
    text:
      "<b>Choose a option to modify the bot.</b>\nYou can add more admins using Add Admin button.",
    reply_markup: { inline_keyboard: adminPanel.inlineKeyboardRawData["en"] }
  },
  ru: {
    parse_mode: "html",
    text:
      "<b>Выберите вариант изменения бота</b>.\nВы можете добавить больше администраторов с помощью кнопки «Добавить администратора».",
    reply_markup: { inline_keyboard: adminPanel.inlineKeyboardRawData["ru"] }
  }
}
const method = "sendMessage"

const selected = option_1[systemLang]
Api[method](selected)
