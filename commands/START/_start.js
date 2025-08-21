/*CMD
  command: /start
  help: 
  need_reply: false
  auto_retry_time: 
  folder: START
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

const option_1 = {
  en: {
    text:
      `<b>Welcome</b> to the bot <code>${user?.first_name || ""}</code>\n\n` +
      `Let's get started with learning <b>bot business</b>!\n` +
      `/lessons <i>to interact with lessons</i>. Alternatively, you can press the button given below.`,
    reply_markup: {
      inline_keyboard: [
        [{ text: "View Lessons", callback_data: "/lessons" }],
        [{ text: "Change Language", callback_data: "/changeLanguage" }]
      ]
    },
    parse_mode: "html"
  },
  ru: {
    text:
      `<b>Добро пожаловать</b> в бот <code>${user?.first_name ||
        ""}</code>\n\n` +
      `Давайте начнем изучать <b>бот бизнес</b>!\n` +
      `/lessons <i>для взаимодействия с уроками</i>. Или нажмите кнопку ниже.`,
    reply_markup: {
      inline_keyboard: [
        [{ text: "Просмотреть уроки", callback_data: "/lessons" }],
        [{ text: "Изменить язык", callback_data: "/changeLanguage" }]
      ]
    },
    parse_mode: "html"
  }
}

const method = "sendMessage"
const selectedContent = option_1[systemLang]
Api[method](selectedContent)
