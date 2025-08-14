/*CMD
  command: /stats
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

if (!userStats) {
  Api.sendMessage({
    text: systemLang === "ru"
      ? "Статистика пока недоступна."
      : "No statistics available yet."
  });
  return;
}

const langText = {
  en: {
    title: "Your Progress Summary",
    quiz: "Quiz Stats",
    lesson: "Lesson Stats",
    points: "Points",
    totalQuizzes: "Total Unique Quizzes Taken",
    totalQuestions: "Total Questions Attempted",
    correct: "Correct Answers",
    wrong: "Wrong Answers",
    lessonsViewed: "Total Lessons Viewed"
  },
  ru: {
    title: "Ваша сводка прогресса",
    quiz: "Статистика викторин",
    lesson: "Статистика уроков",
    points: "очки",
    totalQuizzes: "Всего уникальных викторин пройдено",
    totalQuestions: "Всего вопросов попытались ответить",
    correct: "Правильные ответы",
    wrong: "Неправильные ответы",
    lessonsViewed: "Всего просмотрено уроков"
  }
}[systemLang];

let messageText = `<b>${langText.title}</b>\n\n`;

messageText += `• ${langText.points} <b>${user.points}</b>\n\n`

if (userStats.quiz) {
  const quizStats = userStats.quiz;
  const totalQues = quizStats.correct_answers + quizStats.wrong_answers;

  messageText += `<b>${langText.quiz}</b>\n`;
  messageText += `• ${langText.totalQuizzes}: <b>${quizStats.total_taken}</b>\n`;
  messageText += `• ${langText.totalQuestions}: <b>${totalQues}</b>\n`;
  messageText += `• ${langText.correct}: <b>${quizStats.correct_answers}</b>\n`;
  messageText += `• ${langText.wrong}: <b>${quizStats.wrong_answers}</b>\n\n`;
}

if (userStats.lesson) {
  const lessonStats = userStats.lesson;

  messageText += `<b>${langText.lesson}</b>\n`;
  messageText += `• ${langText.lessonsViewed}: <b>${lessonStats.total_taken}</b>\n\n`;
}

Api.sendMessage({
  text: messageText,
  parse_mode: "HTML"
});
