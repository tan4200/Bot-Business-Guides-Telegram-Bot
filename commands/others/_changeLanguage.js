/*CMD
  command: /changeLanguage
  help: 
  need_reply: false
  auto_retry_time: 
  folder: others

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: /lang
  group: 
CMD*/

const languageKeyboard = [];
languageSupportAvailable.forEach((lang, index) => {
  languageKeyboard.push([{ text: lang, callback_data: "/changeLanguage " + index }]);
});

const option_1 = {
  en: {
    text: "*Current Language* `" + systemLang + "`\n\nChoose a language to modify.",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: languageKeyboard
    }
  },
  ru: {
    text: "*Текущий язык* `" + systemLang + "`\n\nВыберите язык для изменения.",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: languageKeyboard
    }
  }
};

function option_2(langCode) {
  return {
    en: {
      text: "Language Modified to <code>" + langCode + "</code>.",
      parse_mode: "html"
    },
    ru: {
      text: "Язык изменён на <code>" + langCode + "</code>.",
      parse_mode: "html"
    }
  };
}

const method = "sendMessage";

if (!params) {
  const selected = option_1[systemLang];
  Api[method](selected);
  return;
}

const newLangIndex = parseInt(params);
const newLang = languageSupportAvailable[newLangIndex];

if (!newLang) {
  Api[method]({
    text: "Invalid selection.",
    parse_mode: "Markdown"
  });
  return;
}

systemLang = newLang;
Bot.setProperty("system_lang", newLang);

const confirmation = option_2(newLang);
Api[method](confirmation[systemLang]);
