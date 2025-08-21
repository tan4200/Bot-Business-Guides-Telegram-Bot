/*CMD
  command: /leaderboard
  help: 
  need_reply: false
  auto_retry_time: 
  folder: STATS

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

if (!quizLeaderboard || quizLeaderboard.length === 0) {
  const emptyText = {
    en: "<b>The leaderboard is empty.</b>\nTake some quizzes to enter the top 10!",
    ru: "<b>Таблица лидеров пуста.</b>\nПройдите викторины, чтобы попасть в топ-10!"
  }[systemLang];

  Api.sendMessage({
    text: emptyText,
    parse_mode: "html"
  });
  return;
}

let leaderboardTextHeader = {
  en: "<b>🏆 Quiz Leaderboard </b>\n\n",
  ru: "<b>🏆 Таблица Лидеров Викторины </b>\n\n"
}[systemLang];

let leaderboardBody = "";

quizLeaderboard.forEach((entry, index) => {
  const tgLink = `<a href="tg://openmessage?user_id=${entry.user_tg_id}">Ranker</a>`;
  const positionEmoji = ["🥇", "🥈", "🥉"][index] || `${index + 1}.`;

  const line = {
    en: `${positionEmoji} ${tgLink} — <b>${entry.score}</b> points\n`,
    ru: `${positionEmoji} ${tgLink} — <b>${entry.score}</b> очков\n`
  }[systemLang];

  leaderboardBody += line;
});

const leaderboardFooter = {
  en: "\nWant to be on top? Take more quizzes and improve your score!",
  ru: "\nХотите попасть в топ? Решайте больше викторин и улучшайте свой результат!"
}[systemLang];

Api.sendMessage({
  text: leaderboardTextHeader + leaderboardBody + leaderboardFooter,
  parse_mode: "html",
  disable_web_page_preview: true
});
