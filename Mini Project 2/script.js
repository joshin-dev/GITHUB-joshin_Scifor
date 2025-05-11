const questions = [
    { q: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], answer: 2 },
    { q: "Who wrote 'Hamlet'?", options: ["Charles Dickens", "William Shakespeare", "Leo Tolstoy", "Mark Twain"], answer: 1 },
    { q: "What planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Saturn"], answer: 1 },
    { q: "Which element has the chemical symbol O?", options: ["Gold", "Oxygen", "Silver", "Zinc"], answer: 1 },
    { q: "What year did World War II end?", options: ["1945", "1939", "1918", "1963"], answer: 0 },
    { q: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
    { q: "Who painted the Mona Lisa?", options: ["Van Gogh", "Da Vinci", "Picasso", "Rembrandt"], answer: 1 },
    { q: "Which country is known for the maple leaf?", options: ["USA", "Canada", "UK", "Australia"], answer: 1 },
    { q: "Which gas do plants absorb from the atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"], answer: 1 },
    { q: "What is the hardest natural substance?", options: ["Gold", "Iron", "Diamond", "Quartz"], answer: 2 },
    { q: "What is the boiling point of water?", options: ["90°C", "100°C", "110°C", "120°C"], answer: 1 },
    { q: "Which language has the most native speakers?", options: ["English", "Hindi", "Mandarin", "Spanish"], answer: 2 },
    { q: "What is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: 1 },
    { q: "Who developed the theory of relativity?", options: ["Newton", "Einstein", "Tesla", "Bohr"], answer: 1 },
    { q: "What is the capital of Japan?", options: ["Beijing", "Seoul", "Tokyo", "Bangkok"], answer: 2 },
    { q: "How many continents are there?", options: ["5", "6", "7", "8"], answer: 2 },
    { q: "Which organ pumps blood in the human body?", options: ["Lungs", "Heart", "Liver", "Kidney"], answer: 1 },
    { q: "Which bird is a universal symbol of peace?", options: ["Sparrow", "Eagle", "Dove", "Owl"], answer: 2 },
    { q: "Which instrument measures temperature?", options: ["Barometer", "Thermometer", "Altimeter", "Speedometer"], answer: 1 },
    { q: "What color is chlorophyll?", options: ["Blue", "Red", "Green", "Yellow"], answer: 2 },
    { q: "Which planet has rings?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 3 },
    { q: "Which animal is known as the King of the Jungle?", options: ["Tiger", "Elephant", "Lion", "Leopard"], answer: 2 },
    { q: "What is the capital of India?", options: ["Mumbai", "Delhi", "Chennai", "Kolkata"], answer: 1 },
    { q: "Who invented the lightbulb?", options: ["Edison", "Tesla", "Bell", "Newton"], answer: 0 },
    { q: "Which blood type is known as the universal donor?", options: ["A", "B", "O", "AB"], answer: 2 },
    { q: "Which continent is the Sahara Desert in?", options: ["Asia", "Africa", "Australia", "South America"], answer: 1 },
    { q: "Which is the smallest prime number?", options: ["0", "1", "2", "3"], answer: 2 },
    { q: "Which festival is known as the Festival of Lights?", options: ["Eid", "Diwali", "Christmas", "Hanukkah"], answer: 1 },
    { q: "What do bees collect and use to make honey?", options: ["Pollen", "Water", "Nectar", "Leaves"], answer: 2 },
  ];

  let quizIndex = 0;
  let score = 0;
  let selectedQuestions = [];
  let timer;
  let timeLeft = 15;

  function startQuiz() {
    score = 0;
    quizIndex = 0;
    selectedQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, 10);
    showQuestion();
  }

  function showQuestion() {
    clearInterval(timer);
    timeLeft = 15;
    const current = selectedQuestions[quizIndex];
    document.getElementById('quiz-box').innerHTML = `
      <div class="info-bar">
        <div>Question ${quizIndex + 1}/10</div>
        <div>Time left: <span id="time">${timeLeft}</span>s</div>
      </div>
      <div class="question">Q${quizIndex + 1}: ${current.q}</div>
      <div class="options">
        ${current.options.map((opt, i) => `<button onclick="checkAnswer(${i})">${opt}</button>`).join('')}
      </div>
    `;
    timer = setInterval(() => {
      timeLeft--;
      document.getElementById('time').textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timer);
        checkAnswer(-1);
      }
    }, 1000);
  }

  function checkAnswer(i) {
    clearInterval(timer);
    if (i === selectedQuestions[quizIndex].answer) score++;
    quizIndex++;
    if (quizIndex < 10) {
      showQuestion();
    } else {
      showScore();
    }
  }

  function showScore() {
    document.getElementById('quiz-box').innerHTML = `
      <div class="score">Your score: ${score}/10</div>
      <button class="btn" onclick="startQuiz()">Restart Quiz</button>
    `;
  }