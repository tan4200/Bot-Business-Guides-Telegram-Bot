/*CMD
  command: !
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

let option_1 = {
  en: {text: "Error occured. Don't mind. We are retrying."},
  ru: {
    text: "Произошла ошибка. Не обращайте внимания. Мы повторяем попытку."
  }
}
let method = "sendMessage"
Api[method](option_1[systemLang])

