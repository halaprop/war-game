
class WarGame {
  constructor() {
    // Choice buttons
    this.choiceButtons = [0, 1, 2, 3].map((n, i) => {
      const btn = document.getElementById(`choice-${n}`);
      btn.addEventListener('click', () => this.handlePlayerChoice(i));
      return btn;
    });

    // Menu buttons
    this.timedGameBtn = document.getElementById('timed-game');
    this.resetGameBtn = document.getElementById('reset-game');
    this.playButton = document.getElementById('play-button');
    this.nextButton = document.getElementById('next-button');
    this.aboutBtn = document.getElementById('about');

    // Score & timer display
    this.scoreEl = document.getElementById('score');
    this.timerDiv = document.getElementById('game-time');
    this.finalScore = document.getElementById('final-score');

    // Result modal
    this.resultModal = document.getElementById('result-modal');
    this.resultTitle = document.getElementById('result-title');
    this.resultDetail = document.getElementById('result-detail');

    // Modals
    this.readyModal = UIkit.modal('#ready-modal');
    this.scoreModal = UIkit.modal('#score-modal');
    this.aboutModal = UIkit.modal('#about-modal');
    this.offcanvasNav = UIkit.offcanvas('#offcanvas-nav');

    // Events
    this.nextButton.addEventListener('click', () => {
      this.resultModal.hidden = true;
      this.nextQuestion();
    });

    UIkit.util.on('#result-modal', 'hidden', this.nextQuestion.bind(this));

    this.timedGameBtn.addEventListener('click', e => {
      e.preventDefault();
      this.prepareTimedGame();
    });

    this.resetGameBtn.addEventListener('click', e => {
      e.preventDefault();
      this.offcanvasNav.hide();
      this.startRound();
    });

    this.playButton.addEventListener('click', e => {
      e.preventDefault();
      this.offcanvasNav.hide();
      this.startTimedGame();
    });

    this.aboutBtn.addEventListener('click', e => {
      e.preventDefault();
      this.offcanvasNav.hide();
      this.aboutModal.show(); // now 'this' is the WarGame instance
    });
  }

  startRound() {
    this.timerDiv.hidden = true;
    this.count = 0;
    this.score = 0;
    this.bestWAR = null;
    this.updateScore();
    this.clearSelection();
    if (this.timerID) {
      clearInterval(this.timerID);
    }
    this.nextQuestion();
  }

  nextQuestion() {
    this.setCurrentPlayers();
    this.clearSelection();
    for (let i = 0; i < 4; i++) {
      const btn = this.choiceButtons[i];
      btn.textContent = this.currentPlayers[i].name;
    }
  }

  clearSelection() {
    for (let i = 0; i < 4; i++) {
      this.choiceButtons[i].classList.remove('choice-selected');
    }
  }

  updateScore() {
    this.scoreEl.textContent = `Score: ${this.score} / ${this.count}`;
  }

  setCurrentPlayers(maxWarDelta = 1.5) {
    const allPlayers = WarGame.players();
    WarGame.shuffle(allPlayers);

    const firstPlayer = allPlayers[0];
    this.bestWAR = firstPlayer.war;
    const currentPlayers = [firstPlayer];

    for (let index = 1; currentPlayers.length < 4; index++) {
      const player = allPlayers[index];
      const warDelta = Math.abs(player.war - firstPlayer.war);
      if (warDelta <= maxWarDelta) {
        currentPlayers.push(player);
        if (player.war > this.bestWAR) {
          this.bestWAR = player.war;
        }
      }
    }
    this.currentPlayers = currentPlayers;
  }

  handlePlayerChoice(index) {
    this.count++;
    const correctPlayers = this.currentPlayers.filter(p => p.war === this.bestWAR);
    const correctPlayerNames = correctPlayers.map(p => p.name);

    let namePhrase, conj;
    if (correctPlayerNames.length === 1) {
      namePhrase = correctPlayerNames[0];
      conj = 'has';
    } else if (correctPlayerNames.length === 2) {
      namePhrase = `${correctPlayerNames[0]} and ${correctPlayerNames[1]}`;
      conj = 'both have';
    } else {
      namePhrase = `${correctPlayerNames.slice(0, -1).join(', ')}, and ${correctPlayerNames.slice(-1)}`;
      conj = 'all have';
    }

    const correctPhrase = `${namePhrase} ${conj} the top WAR (${this.bestWAR.toFixed(1)})`;
    const isCorrect = this.currentPlayers[index].war === this.bestWAR;

    if (isCorrect) this.score++;

    this.showResult({
      correct: isCorrect,
      phrase: correctPhrase,
      index: index,
    });
  }

  showResult({ correct, phrase, index }) {
    this.resultTitle.textContent = correct ? "Correct" : "Nope";
    this.resultDetail.textContent = correct ? `Yes, ${phrase}` : phrase;

    this.updateScore();

    for (let i = 0; i < 4; i++) {
      const btn = this.choiceButtons[i];
      const player = this.currentPlayers[i];
      btn.classList.toggle('choice-selected', i === index);
      btn.textContent = `${player.name} (${player.war})`;
    }
    this.resultModal.hidden = false;
  }

  prepareTimedGame() {
    setTimeout(() => {
      this.readyModal.show();
    }, 10); // wait for offcanvas to finish closing
  }

  startTimedGame(seconds = 5) {
    this.readyModal.hide();
    this.startRound();
    this.timerDiv.hidden = false;

    const updateTimerDisplay = sec => {
      const mins = Math.floor(sec / 60).toString().padStart(2, '0');
      const secs = (sec % 60).toString().padStart(2, '0');
      this.timerDiv.textContent = `${mins}:${secs}`;
    };
    updateTimerDisplay(seconds);

    if (this.timerID) clearInterval(this.timerID);
    this.timerID = setInterval(() => {
      seconds--;
      updateTimerDisplay(seconds);

      if (seconds <= 0) {
        clearInterval(this.timerID);
        this.timedGameOver();
      }
    }, 1000);
  }

  timedGameOver() {
    this.finalScore.textContent = `${this.scoreEl.textContent}`;
    this.scoreModal.show();
    this.resultModal.hidden = true;
    this.startRound();
  }

  static shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  static players() {
    const pos = [
      "C",   // Catcher
      "1B",  // First Base
      "2B",  // Second Base
      "3B",  // Third Base
      "SS",  // Shortstop
      "LF",  // Left Field
      "CF",  // Center Field
      "RF",  // Right Field
      "OF",  // Outfield (general, used for aggregated stats)
      "DH",  // Designated Hitter
      "P",   // Pitcher
      "SP",  // Starting Pitcher
      "RP",  // Relief Pitcher
      "2-W", // Two-way player (rare, used for players like Shohei Ohtani)
      "UT",  // Utility (general use, not always official)
    ]
    const randomPosition = () => pos[Math.floor(Math.random() * pos.length)];

    return [
      { name: 'Aaron Judge', team: 'NYY', war: 7.1 },
      { name: 'Cal Raleigh', team: 'SEA', war: 6 },
      { name: 'Pete Crow-Armstrong', team: 'CHC', war: 5.1 },
      { name: 'Tarik Skubal', team: 'DET', war: 4.7 },
      { name: 'Bobby Witt Jr.', team: 'KCR', war: 4.7 },
      { name: 'Shohei Ohtani', team: 'LAD', war: 4.5 },
      { name: 'Jeremy Peña', team: 'HOU', war: 4 },
      { name: 'Paul Skenes', team: 'PIT', war: 3.9 },
      { name: 'James Wood', team: 'WSN', war: 3.9 },
      { name: 'Kyle Tucker', team: 'CHC', war: 3.9 },
      { name: 'Fernando Tatis Jr.', team: 'SDP', war: 3.8 },
      { name: 'Zack Wheeler', team: 'PHI', war: 3.8 },
      { name: 'Garrett Crochet', team: 'BOS', war: 3.8 },
      { name: 'Trea Turner', team: 'PHI', war: 3.7 },
      { name: 'Corbin Carroll', team: 'ARI', war: 3.7 },
      { name: 'Logan Webb', team: 'SFG', war: 3.6 },
      { name: 'José Ramírez', team: 'CLE', war: 3.6 },
      { name: 'Francisco Lindor', team: 'NYM', war: 3.6 },
      { name: 'Will Smith', team: 'LAD', war: 3.5 },
      { name: 'Byron Buxton', team: 'MIN', war: 3.4 },
      { name: 'Ketel Marte', team: 'ARI', war: 3.3 },
      { name: 'Ceddanne Rafaela', team: 'BOS', war: 3.1 },
      { name: 'MacKenzie Gore', team: 'WSN', war: 3.1 },
      { name: 'Kris Bubic', team: 'KCR', war: 3.1 },
      { name: 'Elly De La Cruz', team: 'CIN', war: 3.1 },
      { name: 'Jesús Luzardo', team: 'PHI', war: 3.1 },
      { name: 'Geraldo Perdomo', team: 'ARI', war: 3.1 },
      { name: 'Alejandro Kirk', team: 'TOR', war: 3 },
      { name: 'Manny Machado', team: 'SDP', war: 3 },
      { name: 'Cristopher Sánchez', team: 'PHI', war: 3 },
      { name: 'CJ Abrams', team: 'WSN', war: 2.9 },
      { name: 'Pete Alonso', team: 'NYM', war: 2.9 },
      { name: 'Zach McKinstry', team: 'DET', war: 2.9 },
      { name: 'Matt Olson', team: 'ATL', war: 2.9 },
      { name: 'Andy Pages', team: 'LAD', war: 2.9 },
      { name: 'Max Fried', team: 'NYY', war: 2.9 },
      { name: 'Jacob Wilson', team: 'ATH', war: 2.9 },
      { name: 'Carlos Narváez', team: 'BOS', war: 2.9 },
      { name: 'Hunter Brown', team: 'HOU', war: 2.9 },
      { name: 'Sonny Gray', team: 'STL', war: 2.8 },
      { name: 'Kyle Schwarber', team: 'PHI', war: 2.8 },
      { name: 'Nathan Eovaldi', team: 'TEX', war: 2.8 },
      { name: 'Riley Greene', team: 'DET', war: 2.8 },
      { name: 'Juan Soto', team: 'NYM', war: 2.8 },
      { name: 'Isaac Paredes', team: 'HOU', war: 2.7 },
      { name: 'Michael Busch', team: 'CHC', war: 2.7 },
      { name: 'Masyn Winn', team: 'STL', war: 2.7 },
      { name: 'Framber Valdez', team: 'HOU', war: 2.7 },
      { name: 'Jacob deGrom', team: 'TEX', war: 2.6 },
      { name: 'Cody Bellinger', team: 'NYY', war: 2.6 },
      { name: 'Maikel Garcia', team: 'KCR', war: 2.6 },
      { name: 'Jake Meyers', team: 'HOU', war: 2.5 },
      { name: 'Brendan Donovan', team: 'STL', war: 2.5 },
      { name: 'Chris Sale', team: 'ATL', war: 2.5 },
      { name: 'Matt Chapman', team: 'SFG', war: 2.5 },
      { name: 'Jazz Chisholm Jr.', team: 'NYY', war: 2.5 },
      { name: 'Eugenio Suárez', team: 'ARI', war: 2.5 },
      { name: 'Nick Pivetta', team: 'SDP', war: 2.5 },
      { name: 'Randy Arozarena', team: 'SEA', war: 2.4 },
      { name: 'Joe Ryan', team: 'MIN', war: 2.4 },
      { name: 'Corey Seager', team: 'TEX', war: 2.4 },
      { name: 'Mitch Keller', team: 'PIT', war: 2.4 },
      { name: 'Alex Bregman', team: 'BOS', war: 2.4 },
      { name: 'Gunnar Henderson', team: 'BAL', war: 2.4 },
      { name: 'Matthew Boyd', team: 'CHC', war: 2.4 },
      { name: 'José Soriano', team: 'LAA', war: 2.4 },
      { name: 'Nico Hoerner', team: 'CHC', war: 2.3 },
      { name: 'Bryan Woo', team: 'SEA', war: 2.3 },
      { name: 'Sal Frelick', team: 'MIL', war: 2.3 },
      { name: 'J.P. Crawford', team: 'SEA', war: 2.3 },
      { name: 'Spencer Schwellenbach', team: 'ATL', war: 2.3 },
      { name: 'Seiya Suzuki', team: 'CHC', war: 2.3 },
      { name: 'Austin Wells', team: 'NYY', war: 2.3 },
      { name: 'Gleyber Torres', team: 'DET', war: 2.2 },
      { name: 'Max Muncy', team: 'LAD', war: 2.2 },
      { name: 'Yoshinobu Yamamoto', team: 'LAD', war: 2.2 },
      { name: 'Ernie Clement', team: 'TOR', war: 2.2 },
      { name: 'Jonathan Aranda', team: 'TBR', war: 2.2 },
      { name: 'Steven Kwan', team: 'CLE', war: 2.2 },
      { name: "Ryan O'Hearn", team: 'BAL', war: 2.2 },
      { name: 'Julio Rodríguez', team: 'SEA', war: 2.2 },
      { name: 'Ranger Suárez', team: 'PHI', war: 2.2 },
      { name: 'Andrew Abbott', team: 'CIN', war: 2.1 },
      { name: 'Ronald Acuña Jr.', team: 'ATL', war: 2.1 },
      { name: 'Kyle Stowers', team: 'MIA', war: 2.1 },
      { name: 'Lawrence Butler', team: 'ATH', war: 2.1 },
      { name: 'Brandon Nimmo', team: 'NYM', war: 2.1 },
      { name: 'Addison Barger', team: 'TOR', war: 2.1 },
      { name: 'David Peterson', team: 'NYM', war: 2.1 },
      { name: 'Xander Bogaerts', team: 'SDP', war: 2.1 },
      { name: 'Junior Caminero', team: 'TBR', war: 2.1 },
      { name: 'Freddie Freeman', team: 'LAD', war: 2.1 },
      { name: 'Matthew Liberatore', team: 'STL', war: 2.1 },
      { name: 'Carson Kelly', team: 'CHC', war: 2.1 },
      { name: 'TJ Friedl', team: 'CIN', war: 2.1 },
      { name: 'Drake Baldwin', team: 'ATL', war: 2 },
      { name: 'Vladimir Guerrero Jr.', team: 'TOR', war: 2 },
      { name: 'Wilyer Abreu', team: 'BOS', war: 2 },
      { name: 'Josh Smith', team: 'TEX', war: 2 },
      { name: 'George Springer', team: 'TOR', war: 2 },
      { name: 'Freddy Peralta', team: 'MIL', war: 2 },
      { name: 'Merrill Kelly', team: 'ARI', war: 2 },
      { name: 'Dansby Swanson', team: 'CHC', war: 2 },
      { name: 'Chad Patrick', team: 'MIL', war: 2 },
      { name: 'Willson Contreras', team: 'STL', war: 2 },
      { name: 'Hunter Goodman', team: 'COL', war: 2 },
      { name: 'Rafael Devers', team: '- - -', war: 2 },
      { name: 'Brice Turang', team: 'MIL', war: 1.9 },
      { name: 'Gabriel Moreno', team: 'ARI', war: 1.9 },
      { name: 'Yusei Kikuchi', team: 'LAA', war: 1.9 },
      { name: 'Jackson Chourio', team: 'MIL', war: 1.9 },
      { name: 'Austin Riley', team: 'ATL', war: 1.9 },
      { name: 'Dillon Dingler', team: 'DET', war: 1.9 },
      { name: 'Trent Grisham', team: 'NYY', war: 1.9 },
      { name: 'Will Warren', team: 'NYY', war: 1.9 },
      { name: 'Spencer Torkelson', team: 'DET', war: 1.9 },
      { name: 'Isaac Collins', team: 'MIL', war: 1.9 },
      { name: 'Mauricio Dubón', team: 'HOU', war: 1.8 },
      { name: 'Cam Smith', team: 'HOU', war: 1.8 },
      { name: 'William Contreras', team: 'MIL', war: 1.8 },
      { name: 'Taylor Ward', team: 'LAA', war: 1.8 },
      { name: 'Robbie Ray', team: 'SFG', war: 1.8 },
      { name: 'Harrison Bader', team: 'MIN', war: 1.8 },
      { name: 'Sean Murphy', team: 'ATL', war: 1.8 },
      { name: 'Carlos Rodón', team: 'NYY', war: 1.8 },
      { name: 'Dylan Cease', team: 'SDP', war: 1.8 },
      { name: 'Bo Bichette', team: 'TOR', war: 1.8 },
      { name: 'Wyatt Langford', team: 'TEX', war: 1.8 },
      { name: 'Brent Rooker', team: 'ATH', war: 1.8 },
      { name: 'Otto Lopez', team: 'MIA', war: 1.8 },
      { name: 'Zach Neto', team: 'LAA', war: 1.7 },
      { name: 'Chris Bassitt', team: 'TOR', war: 1.7 },
      { name: 'Marcus Semien', team: 'TEX', war: 1.7 },
      { name: 'Tyler Mahle', team: 'TEX', war: 1.7 },
      { name: 'Kyle Freeland', team: 'COL', war: 1.7 },
      { name: 'Michael Wacha', team: 'KCR', war: 1.7 },
      { name: 'Robert Suarez', team: 'SDP', war: 1.7 },
      { name: 'Aroldis Chapman', team: 'BOS', war: 1.7 },
      { name: 'Kodai Senga', team: 'NYM', war: 1.7 },
      { name: 'Kevin Gausman', team: 'TOR', war: 1.6 },
      { name: 'Cole Ragans', team: 'KCR', war: 1.6 },
      { name: 'Colt Keith', team: 'DET', war: 1.6 },
      { name: 'Ramón Laureano', team: 'BAL', war: 1.6 },
      { name: 'Javier Báez', team: 'DET', war: 1.6 },
      { name: 'Pablo López', team: 'MIN', war: 1.6 },
      { name: 'Randy Rodríguez', team: 'SFG', war: 1.6 },
      { name: 'Willy Adames', team: 'SFG', war: 1.6 },
      { name: 'Patrick Bailey', team: 'SFG', war: 1.6 },
      { name: 'Iván Herrera', team: 'STL', war: 1.6 },
      { name: 'Adrian Houser', team: 'CHW', war: 1.6 },
      { name: 'Nick Lodolo', team: 'CIN', war: 1.6 },
      { name: 'José Berríos', team: 'TOR', war: 1.6 },
      { name: 'Yandy Díaz', team: 'TBR', war: 1.6 },
      { name: 'Mookie Betts', team: 'LAD', war: 1.5 },
      { name: 'Drew Rasmussen', team: 'TBR', war: 1.5 },
      { name: 'Hunter Greene', team: 'CIN', war: 1.5 },
      { name: 'Oneil Cruz', team: 'PIT', war: 1.5 },
      { name: 'Jake Cronenworth', team: 'SDP', war: 1.5 },
      { name: 'Alec Bohm', team: 'PHI', war: 1.5 },
      { name: 'Tyler Heineman', team: 'TOR', war: 1.5 },
      { name: 'Victor Scott II', team: 'STL', war: 1.5 },
      { name: 'Jarren Duran', team: 'BOS', war: 1.5 },
      { name: 'Josh Naylor', team: 'ARI', war: 1.5 },
      { name: 'Nick Martinez', team: 'CIN', war: 1.5 },
      { name: 'Tylor Megill', team: 'NYM', war: 1.5 },
      { name: 'Jung Hoo Lee', team: 'SFG', war: 1.5 },
      { name: 'Heliot Ramos', team: 'SFG', war: 1.4 },
      { name: 'Janson Junk', team: 'MIA', war: 1.4 },
      { name: 'Michael King', team: 'SDP', war: 1.4 },
      { name: 'Brandon Lowe', team: 'TBR', war: 1.4 },
      { name: 'Adrian Morejon', team: 'SDP', war: 1.4 },
      { name: 'Jeff McNeil', team: 'NYM', war: 1.4 },
      { name: 'Bryan Abreu', team: 'HOU', war: 1.4 },
      { name: 'Bryce Harper', team: 'PHI', war: 1.4 },
      { name: 'Nick Allen', team: 'ATL', war: 1.4 },
      { name: 'Tommy Edman', team: 'LAD', war: 1.4 },
      { name: 'Brady Singer', team: 'CIN', war: 1.4 },
      { name: 'Hoby Milner', team: 'TEX', war: 1.4 },
      { name: 'Luis Castillo', team: 'SEA', war: 1.3 },
      { name: 'Jo Adell', team: 'LAA', war: 1.3 },
      { name: 'Griffin Jax', team: 'MIN', war: 1.3 },
      { name: 'Taj Bradley', team: 'TBR', war: 1.3 },
      { name: 'Dean Kremer', team: 'BAL', war: 1.3 },
      { name: 'Casey Mize', team: 'DET', war: 1.3 },
      { name: 'Trevor Story', team: 'BOS', war: 1.3 },
      { name: 'Tyler Soderstrom', team: 'ATH', war: 1.3 },
      { name: 'Lucas Giolito', team: 'BOS', war: 1.3 },
      { name: 'Ryan Pepiot', team: 'TBR', war: 1.3 },
      { name: 'Paul Goldschmidt', team: 'NYY', war: 1.3 },
      { name: 'Ben Rice', team: 'NYY', war: 1.3 },
      { name: 'Gavin Sheets', team: 'SDP', war: 1.3 },
      { name: 'Reese Olson', team: 'DET', war: 1.2 },
      { name: 'Clarke Schmidt', team: 'NYY', war: 1.2 },
      { name: 'Will Vest', team: 'DET', war: 1.2 },
      { name: 'Caleb Durbin', team: 'MIL', war: 1.2 },
      { name: 'Shane Smith', team: 'CHW', war: 1.2 },
      { name: 'Andrés Muñoz', team: 'SEA', war: 1.2 },
      { name: 'Mike Yastrzemski', team: 'SFG', war: 1.2 },
      { name: 'Christian Yelich', team: 'MIL', war: 1.2 },
      { name: 'Jordan Westburg', team: 'BAL', war: 1.2 },
      { name: 'Cade Smith', team: 'CLE', war: 1.2 },
      { name: 'Willi Castro', team: 'MIN', war: 1.2 },
      { name: 'Jack Dreyer', team: 'LAD', war: 1.2 },
      { name: 'Jake Mangum', team: 'TBR', war: 1.2 },
      { name: 'Jose Altuve', team: 'HOU', war: 1.2 },
      { name: 'Evan Carter', team: 'TEX', war: 1.2 },
      { name: 'Romy Gonzalez', team: 'BOS', war: 1.2 },
      { name: 'Lars Nootbaar', team: 'STL', war: 1.2 },
      { name: 'Luis Severino', team: 'ATH', war: 1.2 },
      { name: 'Edwin Díaz', team: 'NYM', war: 1.2 },
      { name: 'Jackson Merrill', team: 'SDP', war: 1.2 },
      { name: 'Trevor Williams', team: 'WSN', war: 1.2 },
      { name: 'Jhoan Duran', team: 'MIN', war: 1.2 },
      { name: 'Logan Gilbert', team: 'SEA', war: 1.1 },
      { name: 'Nolan Arenado', team: 'STL', war: 1.1 },
      { name: 'Chris Paddack', team: 'MIN', war: 1.1 },
      { name: 'Pete Fairbanks', team: 'TBR', war: 1.1 },
      { name: 'Germán Márquez', team: 'COL', war: 1.1 },
      { name: 'Bryson Stott', team: 'PHI', war: 1.1 },
      { name: 'Ryan Jeffers', team: 'MIN', war: 1.1 },
      { name: 'Nolan Schanuel', team: 'LAA', war: 1.1 },
      { name: 'Denzel Clarke', team: 'ATH', war: 1.1 },
      { name: 'Jasson Domínguez', team: 'NYY', war: 1.1 },
      { name: 'Xavier Edwards', team: 'MIA', war: 1.1 },
      { name: 'Rhys Hoskins', team: 'MIL', war: 1.1 },
      { name: 'Jackson Holliday', team: 'BAL', war: 1.1 },
      { name: 'Phil Maton', team: 'STL', war: 1.1 },
      { name: "Ke'Bryan Hayes", team: 'PIT', war: 1.1 },
      { name: 'Max Schuemann', team: 'ATH', war: 1.1 },
      { name: 'Alec Burleson', team: 'STL', war: 1 },
      { name: 'Jose Trevino', team: 'CIN', war: 1 },
      { name: 'Ryne Nelson', team: 'ARI', war: 1 },
      { name: 'Ben Casparius', team: 'LAD', war: 1 },
      { name: 'Josh Hader', team: 'HOU', war: 1 },
      { name: 'Seth Lugo', team: 'KCR', war: 1 },
      { name: 'Dane Myers', team: 'MIA', war: 1 },
      { name: 'Steven Matz', team: 'STL', war: 1 },
      { name: 'Bennett Sousa', team: 'HOU', war: 1 },
      { name: 'Andrés Giménez', team: 'TOR', war: 1 },
      { name: 'Brett Baty', team: 'NYM', war: 1 },
      { name: 'Edward Cabrera', team: 'MIA', war: 1 },
      { name: 'Ryan Gusto', team: 'HOU', war: 1 },
      { name: 'J.T. Realmuto', team: 'PHI', war: 1 },
      { name: 'Jason Adam', team: 'SDP', war: 1 },
      { name: 'Daniel Schneemann', team: 'CLE', war: 1 },
      { name: 'Hyeseong Kim', team: 'LAD', war: 1 },
      { name: 'Mike Tauchman', team: 'CHW', war: 1 },
      { name: 'Abner Uribe', team: 'MIL', war: 1 },
      { name: 'Mitchell Parker', team: 'WSN', war: 1 },
      { name: 'Nathan Lukes', team: 'TOR', war: 1 },
      { name: 'Pavin Smith', team: 'ARI', war: 1 },
      { name: 'Dennis Santana', team: 'PIT', war: 1 },
      { name: 'Emmanuel Clase', team: 'CLE', war: 1 },
      { name: 'José Caballero', team: 'TBR', war: 1 },
      { name: 'Adley Rutschman', team: 'BAL', war: 1 },
      { name: 'David Bednar', team: 'PIT', war: 1 },
      { name: 'Jorge Polanco', team: 'SEA', war: 1 },
      { name: 'Jake Bird', team: 'COL', war: 1 },
      { name: 'Steven Okert', team: 'HOU', war: 1 },
      { name: 'Ben Brown', team: 'CHC', war: 1 },
      { name: 'Trevor Megill', team: 'MIL', war: 1 },
      { name: 'Gabe Speier', team: 'SEA', war: 1 },
      { name: 'Noah Cameron', team: 'KCR', war: 0.9 },
      { name: 'Shane Baz', team: 'TBR', war: 0.9 },
      { name: 'Brendon Little', team: 'TOR', war: 0.9 },
      { name: 'Josh Lowe', team: 'TBR', war: 0.9 },
      { name: 'Lourdes Gurriel Jr.', team: 'ARI', war: 0.9 },
      { name: 'Nick Mears', team: 'MIL', war: 0.9 },
      { name: 'Jack Flaherty', team: 'DET', war: 0.9 },
      { name: 'Louis Varland', team: 'MIN', war: 0.9 },
      { name: 'Shea Langeliers', team: 'ATH', war: 0.9 },
      { name: 'Landen Roupp', team: 'SFG', war: 0.9 },
      { name: 'Spencer Strider', team: 'ATL', war: 0.9 },
      { name: 'Danny Coulombe', team: 'MIN', war: 0.9 },
      { name: 'Patrick Corbin', team: 'TEX', war: 0.9 },
      { name: 'Sean Newcomb', team: '- - -', war: 0.9 },
      { name: 'Griffin Canning', team: 'NYM', war: 0.9 },
      { name: 'Clay Holmes', team: 'NYM', war: 0.9 },
      { name: 'Kody Clemens', team: '- - -', war: 0.9 },
      { name: 'Wenceel Pérez', team: 'DET', war: 0.9 },
      { name: 'Michael Soroka', team: 'WSN', war: 0.9 },
      { name: 'Carlos Correa', team: 'MIN', war: 0.9 },
      { name: 'Nick Kurtz', team: 'ATH', war: 0.9 },
      { name: 'Hunter Dobbins', team: 'BOS', war: 0.9 },
      { name: 'Miguel Amaya', team: 'CHC', war: 0.9 },
      { name: 'Liam Hicks', team: 'MIA', war: 0.9 },
      { name: 'Luis L. Ortiz', team: 'CLE', war: 0.9 },
      { name: 'Eric Lauer', team: 'TOR', war: 0.9 },
      { name: 'Garrett Whitlock', team: 'BOS', war: 0.9 },
      { name: 'Fernando Cruz', team: 'NYY', war: 0.8 },
      { name: 'Chase Meidroth', team: 'CHW', war: 0.8 },
      { name: 'Kyle Hendricks', team: 'LAA', war: 0.8 },
      { name: 'Gabriel Arias', team: 'CLE', war: 0.8 },
      { name: 'Dustin May', team: 'LAD', war: 0.8 },
      { name: 'Ian Happ', team: 'CHC', war: 0.8 },
      { name: 'Simeon Woods Richardson', team: 'MIN', war: 0.8 },
      { name: 'Alex Call', team: 'WSN', war: 0.8 },
      { name: 'Matt McLain', team: 'CIN', war: 0.8 },
      { name: 'Austin Hays', team: 'CIN', war: 0.8 },
      { name: 'Anthony Volpe', team: 'NYY', war: 0.8 },
      { name: 'Trevor Rogers', team: 'BAL', war: 0.8 },
      { name: 'José Alvarado', team: 'PHI', war: 0.8 },
      { name: 'Ryan McMahon', team: 'COL', war: 0.8 },
      { name: 'Jordan Beck', team: 'COL', war: 0.8 },
      { name: 'Caleb Thielbar', team: 'CHC', war: 0.8 },
      { name: 'Marcell Ozuna', team: 'ATL', war: 0.8 },
      { name: 'Bryan King', team: 'HOU', war: 0.8 },
      { name: 'Matt Strahm', team: 'PHI', war: 0.8 },
      { name: 'Devin Williams', team: 'NYY', war: 0.8 },
      { name: 'Jeremiah Estrada', team: 'SDP', war: 0.8 },
      { name: 'Mason Miller', team: 'ATH', war: 0.8 },
      { name: 'Kerry Carpenter', team: 'DET', war: 0.8 },
      { name: 'Mike Trout', team: 'LAA', war: 0.8 },
      { name: 'Cal Quantrill', team: 'MIA', war: 0.8 },
      { name: 'Luis Torrens', team: 'NYM', war: 0.8 },
      { name: 'Cade Povich', team: 'BAL', war: 0.8 },
      { name: 'Bo Naylor', team: 'CLE', war: 0.8 },
      { name: 'George Kirby', team: 'SEA', war: 0.8 },
      { name: 'Jack Leiter', team: 'TEX', war: 0.8 },
      { name: 'Carlos Santana', team: 'CLE', war: 0.8 },
      { name: 'Brad Lord', team: 'WSN', war: 0.8 },
      { name: 'Grant Holmes', team: 'ATL', war: 0.8 },
      { name: 'Michael Lorenzen', team: 'KCR', war: 0.8 },
      { name: 'Tyler Alexander', team: '- - -', war: 0.8 },
      { name: 'Davis Martin', team: 'CHW', war: 0.7 },
      { name: 'Matt Thaiss', team: '- - -', war: 0.7 },
      { name: 'Cedric Mullins', team: 'BAL', war: 0.7 },
      { name: 'Edmundo Sosa', team: 'PHI', war: 0.7 },
      { name: 'Braydon Fisher', team: 'TOR', war: 0.7 },
      { name: 'Eury Pérez', team: 'MIA', war: 0.7 },
      { name: 'Tyler Rogers', team: 'SFG', war: 0.7 },
      { name: 'Mark Leiter Jr.', team: 'NYY', war: 0.7 },
      { name: 'Vinnie Pasquantino', team: 'KCR', war: 0.7 },
      { name: 'Heriberto Hernandez', team: 'MIA', war: 0.7 },
      { name: 'Brandon Marsh', team: 'PHI', war: 0.7 },
      { name: 'Logan Allen', team: 'CLE', war: 0.7 },
      { name: 'Reid Detmers', team: 'LAA', war: 0.7 },
      { name: 'Graham Ashcraft', team: 'CIN', war: 0.7 },
      { name: 'Rob Refsnyder', team: 'BOS', war: 0.7 },
      { name: 'Daniel Palencia', team: 'CHC', war: 0.7 },
      { name: 'Roman Anthony', team: 'BOS', war: 0.7 },
      { name: 'Caleb Ferguson', team: 'PIT', war: 0.7 },
      { name: 'Kyle Finnegan', team: 'WSN', war: 0.7 },
      { name: 'Justin Wilson', team: 'BOS', war: 0.7 },
      { name: 'Brock Stewart', team: 'MIN', war: 0.7 },
      { name: 'Jose A. Ferrer', team: 'WSN', war: 0.7 },
      { name: 'Miles Mikolas', team: 'STL', war: 0.7 },
      { name: 'Corbin Burnes', team: 'ARI', war: 0.7 },
      { name: 'Justin Verlander', team: 'SFG', war: 0.7 },
      { name: 'Jeffrey Springs', team: 'ATH', war: 0.7 },
      { name: 'Brayan Bello', team: 'BOS', war: 0.7 },
      { name: 'Mickey Moniak', team: 'COL', war: 0.7 },
      { name: 'Nick Gonzales', team: 'PIT', war: 0.7 },
      { name: 'Ramón Urías', team: 'BAL', war: 0.7 },
      { name: 'Clayton Kershaw', team: 'LAD', war: 0.7 },
      { name: 'Eduardo Rodriguez', team: 'ARI', war: 0.7 },
      { name: 'Jesús Sánchez', team: 'MIA', war: 0.7 },
      { name: 'Stephen Kolek', team: 'SDP', war: 0.7 },
      { name: 'Tanner Banks', team: 'PHI', war: 0.7 },
      { name: 'Myles Straw', team: 'TOR', war: 0.7 },
      { name: 'Tyler Freeman', team: 'COL', war: 0.7 },
      { name: 'Logan Henderson', team: 'MIL', war: 0.6 },
      { name: 'Jose Quintana', team: 'MIL', war: 0.6 },
      { name: 'Dominic Canzone', team: 'SEA', war: 0.6 },
      { name: 'Austin Wynns', team: '- - -', war: 0.6 },
      { name: 'Alek Thomas', team: 'ARI', war: 0.6 },
      { name: 'Manuel Rodríguez', team: 'TBR', war: 0.6 },
      { name: 'Tanner Scott', team: 'LAD', war: 0.6 },
      { name: 'JP Sears', team: 'ATH', war: 0.6 },
      { name: 'Nick Fortes', team: 'MIA', war: 0.6 },
      { name: 'Jordan Hicks', team: '- - -', war: 0.6 },
      { name: 'James McCann', team: 'ARI', war: 0.6 },
      { name: 'Lucas Erceg', team: 'KCR', war: 0.6 },
      { name: 'Reese McGuire', team: 'CHC', war: 0.6 },
      { name: 'Tanner Bibee', team: 'CLE', war: 0.6 },
      { name: 'Félix Bautista', team: 'BAL', war: 0.6 },
      { name: 'Daulton Varsho', team: 'TOR', war: 0.6 },
      { name: 'Jacob Latz', team: 'TEX', war: 0.6 },
      { name: 'Miguel Vargas', team: 'CHW', war: 0.6 },
      { name: 'Taijuan Walker', team: 'PHI', war: 0.6 },
      { name: 'J.C. Escarra', team: 'NYY', war: 0.6 },
      { name: 'Yoán Moncada', team: 'LAA', war: 0.6 },
      { name: 'Carlos Estévez', team: 'KCR', war: 0.6 },
      { name: 'Grant Taylor', team: 'CHW', war: 0.6 },
      { name: 'Josh Jung', team: 'TEX', war: 0.6 },
      { name: 'Reed Garrett', team: 'NYM', war: 0.6 },
      { name: 'Tyler Anderson', team: 'LAA', war: 0.6 },
      { name: 'Charlie Morton', team: 'BAL', war: 0.6 },
      { name: 'Jacob Lopez', team: 'ATH', war: 0.6 },
      { name: 'Ronel Blanco', team: 'HOU', war: 0.6 },
      { name: 'Chris Martin', team: 'TEX', war: 0.6 },
      { name: 'Brad Keller', team: 'CHC', war: 0.6 },
      { name: 'David Festa', team: 'MIN', war: 0.6 },
      { name: 'Lenyn Sosa', team: 'CHW', war: 0.6 },
      { name: 'Shelby Miller', team: 'ARI', war: 0.6 },
      { name: 'Danny Jansen', team: 'TBR', war: 0.6 },
      { name: 'Ben Williamson', team: 'SEA', war: 0.6 },
      { name: 'Tyler Stephenson', team: 'CIN', war: 0.6 },
      { name: 'Freddy Fermin', team: 'KCR', war: 0.6 },
      { name: 'Noelvi Marte', team: 'CIN', war: 0.6 },
      { name: 'Drew Pomeranz', team: 'CHC', war: 0.6 },
      { name: 'Brandon Walter', team: 'HOU', war: 0.6 },
      { name: 'Zebby Matthews', team: 'MIN', war: 0.6 },
      { name: 'Andrew Heaney', team: 'PIT', war: 0.5 },
      { name: 'Zack Littell', team: 'TBR', war: 0.5 },
      { name: 'Davis Schneider', team: 'TOR', war: 0.5 },
      { name: 'Colton Gordon', team: 'HOU', war: 0.5 },
      { name: 'Quinn Priester', team: 'MIL', war: 0.5 },
      { name: 'Justin Wrobleski', team: 'LAD', war: 0.5 },
      { name: 'Cole Sands', team: 'MIN', war: 0.5 },
      { name: 'Robert Garcia', team: 'TEX', war: 0.5 },
      { name: 'Casey Schmitt', team: 'SFG', war: 0.5 },
      { name: 'Leo Rivas', team: 'SEA', war: 0.5 },
      { name: 'Orion Kerkering', team: 'PHI', war: 0.5 },
      { name: 'Justin Topa', team: 'MIN', war: 0.5 },
      { name: 'Alex Vesia', team: 'LAD', war: 0.5 },
      { name: 'AJ Smith-Shawver', team: 'ATL', war: 0.5 },
      { name: 'Jahmai Jones', team: 'DET', war: 0.5 },
      { name: 'Colton Cowser', team: 'BAL', war: 0.5 },
      { name: 'Luke Raley', team: 'SEA', war: 0.5 },
      { name: 'José Buttó', team: 'NYM', war: 0.5 },
      { name: 'Pierce Johnson', team: 'ATL', war: 0.5 },
      { name: 'Max Meyer', team: 'MIA', war: 0.5 },
      { name: 'Gavin Williams', team: 'CLE', war: 0.5 },
      { name: 'Victor Caratini', team: 'HOU', war: 0.5 },
      { name: 'Valente Bellozo', team: 'MIA', war: 0.5 },
      { name: 'Gregory Soto', team: 'BAL', war: 0.5 },
      { name: 'Michael McGreevy', team: 'STL', war: 0.5 },
      { name: 'Michael A. Taylor', team: 'CHW', war: 0.5 },
      { name: 'Kyle Teel', team: 'CHW', war: 0.5 },
      { name: 'Brenan Hanifee', team: 'DET', war: 0.5 },
      { name: 'Jonathan Cannon', team: 'CHW', war: 0.5 },
      { name: 'Garrett Mitchell', team: 'MIL', war: 0.5 },
      { name: 'Marcelo Mayer', team: 'BOS', war: 0.5 },
      { name: 'Seranthony Domínguez', team: 'BAL', war: 0.5 },
      { name: 'Bailey Falter', team: 'PIT', war: 0.5 },
      { name: 'Austin Hedges', team: 'CLE', war: 0.5 },
      { name: 'Spencer Steer', team: 'CIN', war: 0.5 },
      { name: 'Sandy Alcantara', team: 'MIA', war: 0.5 },
      { name: 'Aaron Bummer', team: 'ATL', war: 0.5 },
      { name: 'Justin Slaten', team: 'BOS', war: 0.5 },
      { name: 'Adolis García', team: 'TEX', war: 0.5 },
      { name: 'Shota Imanaga', team: 'CHC', war: 0.5 },
      { name: 'Ronny Henriquez', team: 'MIA', war: 0.5 },
      { name: 'Jared Koenig', team: 'MIL', war: 0.5 },
      { name: 'Emmet Sheehan', team: 'LAD', war: 0.5 },
      { name: 'Eli White', team: 'ATL', war: 0.5 },
      { name: 'Kameron Misner', team: 'TBR', war: 0.5 },
      { name: 'Francisco Alvarez', team: 'NYM', war: 0.4 },
      { name: 'Luis Urías', team: 'ATH', war: 0.4 },
      { name: 'Isiah Kiner-Falefa', team: 'PIT', war: 0.4 },
      { name: 'Ty France', team: 'MIN', war: 0.4 },
      { name: 'Luke Keaschall', team: 'MIN', war: 0.4 },
      { name: 'Derek Hill', team: 'MIA', war: 0.4 },
      { name: 'Joe Boyle', team: 'TBR', war: 0.4 },
      { name: 'Kyle Isbel', team: 'KCR', war: 0.4 },
      { name: 'Shawn Armstrong', team: 'TEX', war: 0.4 },
      { name: 'Jonny DeLuca', team: 'TBR', war: 0.4 },
      { name: 'Jacob Young', team: 'WSN', war: 0.4 },
      { name: 'Curtis Mead', team: 'TBR', war: 0.4 },
      { name: 'Kyren Paris', team: 'LAA', war: 0.4 },
      { name: 'Teoscar Hernández', team: 'LAD', war: 0.4 },
      { name: 'Agustín Ramírez', team: 'MIA', war: 0.4 },
      { name: 'Brant Hurter', team: 'DET', war: 0.4 },
      { name: 'Starling Marte', team: 'NYM', war: 0.4 },
      { name: 'Slade Cecconi', team: 'CLE', war: 0.4 },
      { name: 'Emilio Pagán', team: 'CIN', war: 0.4 },
      { name: 'Yohel Pozo', team: 'STL', war: 0.4 },
      { name: 'Steven Cruz', team: 'KCR', war: 0.4 },
      { name: 'Eric Orze', team: 'TBR', war: 0.4 },
      { name: 'Bryce Miller', team: 'SEA', war: 0.4 },
      { name: 'Jake Rogers', team: 'DET', war: 0.4 },
      { name: 'Cade Horton', team: 'CHC', war: 0.4 },
      { name: 'Colin Rea', team: 'CHC', war: 0.4 },
      { name: 'Andrew McCutchen', team: 'PIT', war: 0.4 },
      { name: 'Lake Bachar', team: 'MIA', war: 0.4 },
      { name: 'Ryan Walker', team: 'SFG', war: 0.4 },
      { name: 'Dylan Lee', team: 'ATL', war: 0.4 },
      { name: 'Joey Ortiz', team: 'MIL', war: 0.4 },
      { name: 'Ryan Feltner', team: 'COL', war: 0.4 },
      { name: 'Mike Burrows', team: 'PIT', war: 0.4 },
      { name: 'Ryan Brasier', team: 'CHC', war: 0.4 },
      { name: 'Pedro Pagés', team: 'STL', war: 0.4 },
      { name: 'Enyel De Los Santos', team: 'ATL', war: 0.4 },
      { name: 'Ozzie Albies', team: 'ATL', war: 0.4 },
      { name: 'Tyler Fitzgerald', team: 'SFG', war: 0.4 },
      { name: 'Andre Pallante', team: 'STL', war: 0.4 },
      { name: 'Ryan Bergert', team: 'SDP', war: 0.4 },
      { name: 'Bailey Ober', team: 'MIN', war: 0.4 },
      { name: 'Wandy Peralta', team: 'SDP', war: 0.4 },
      { name: 'Jacob Misiorowski', team: 'MIL', war: 0.4 },
      { name: 'Rafael Montero', team: '- - -', war: 0.3 },
      { name: 'Chandler Simpson', team: 'TBR', war: 0.3 },
      { name: 'Matt Wallner', team: 'MIN', war: 0.3 },
      { name: 'Martín Pérez', team: 'CHW', war: 0.3 },
      { name: 'Kolby Allard', team: 'CLE', war: 0.3 },
      { name: 'Max Kepler', team: 'PHI', war: 0.3 },
      { name: 'Johan Rojas', team: 'PHI', war: 0.3 },
      { name: 'Jimmy Herget', team: 'COL', war: 0.3 },
      { name: 'Dalton Rushing', team: 'LAD', war: 0.3 }
    ].map(p => ({ ...p, position: randomPosition() }));
  }

}

const warGame = new WarGame();
warGame.startRound();
