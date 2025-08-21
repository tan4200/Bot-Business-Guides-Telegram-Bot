/*CMD
  command: @
  help: 
  need_reply: false
  auto_retry_time: 
  folder: START

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

// user points
if(!user) return //because a lots of user property 
let userPoints = User.getProperty("points",0) 
user.points = userPoints

const addUserPoints = (value) => {
  user.points += value
  User.setProperty("points",user.points,"integer")
  updateQuizLeaderBoard()
}


// userstats
const userStats = User.getProperty("userStats", {
  quiz: {
    total_taken: 0,
    correct_answers: 0,
    wrong_answers: 0,
    quiz_id: [],
    last_quiz_taken_date: 0
  },
  lesson: { total_taken: 0, lesson_id: [], last_lesson_taken_date: 0 }
})
user.userStats = userStats

//lang support 
const languageSupportAvailable = ["en","ru"]
let systemLang = User.getProperty("system_lang", false)
if (!systemLang) {
  systemLang = "en"
  User.setProperty("system_lang", systemLang)
}

// admin
const defaultAdmin = 7758622069


let adminPanel = []

adminPanel.adminsList = Bot.getProperty("adminList", [defaultAdmin])

const isAdmin = usertgid =>
  adminPanel.adminsList.includes(usertgid.toString()) ||
  adminPanel.adminsList.includes(usertgid)



// now i have an idea you see there *are* multiple ways to do the leaderboard one of the way would be time to time running Bot.runAll() but but .. the idea i came with will be more accurate basically every user after quiz command will consist of a function that would evaluate their quiz score and see if they will fit in the property if yes update the property if no simply nothing, i believe this is fast and accurate

const quizLeaderboard = Bot.getProperty("quizLeaderboard", []) || [];

function evaluateQuizScore() {
  const quizScore = user.points || 0;
  return Math.round(quizScore * 100) / 100;
}


function updateQuizLeaderBoard() {
  const userQuizScore = evaluateQuizScore();

  const userInLeaderboardIndex = quizLeaderboard.findIndex(
    entry => entry.user_tg_id === user.telegramid
  );

  if (userInLeaderboardIndex !== -1) {

    quizLeaderboard[userInLeaderboardIndex].score = userQuizScore;
  } else {
    let minLeaderBoardScore =
      quizLeaderboard.length > 0
        ? Math.min(...quizLeaderboard.map(entry => entry.score))
        : 0;

    if (quizLeaderboard.length < 10 || userQuizScore > minLeaderBoardScore) {
      quizLeaderboard.push({
        user_tg_id: user.telegramid,
        score: userQuizScore
      });
    }
  }


  quizLeaderboard.sort((a, b) => b.score - a.score);
  quizLeaderboard.length = Math.min(quizLeaderboard.length, 10);

  Bot.setProperty("quizLeaderboard", quizLeaderboard, "json");
}




// achivements

const achieved_achivements = User.getProperty("achieved_achievements", [])

const achievements = (user_info = {}, sheet_info = {}) => [
  {
    name: "Newbie Learner",
    condition: () => user_info.lesson.total_taken === 1,
    description: {
      en: "Complete your first lesson.",
      ru: "Пройдите свой первый урок."
    },
    is_hidden: false
  },
  {
    name: "Learning Insect",
    condition: () =>
      user_info.lesson.total_taken === sheet_info.lesson_sheet_size,
    description: {
      en: "Complete all the available lessons.",
      ru: "Завершите все доступные уроки."
    },
    is_hidden: false 
  },
  {
    name: "Quiz Master",
    condition: () => user_info.quiz.total_taken === 3,
    description: {
      en: "Take 3 quizzes.",
      ru: "Пройдите 3 викторины."
    },
    is_hidden: false
  }
]
