import { PlayerDB } from "./playerDB.js";

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
    this.questionLabel = document.getElementById('question');

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
    this.setupMenu();
  }

  setupMenu() {
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
      this.aboutModal.show();
    });

    const statsMenu = document.getElementById('stats-menu');
    for (let stat of PlayerDB.stats()) {
      statsMenu.innerHTML += `<li><label><input class="uk-checkbox stats" type="checkbox" value="${stat.key}">  ${stat.label}</label></li>\n`
    }

    const positionsMenu = document.getElementById('positions-menu');
    for (let position of PlayerDB.positions()) {
      positionsMenu.innerHTML += `<li><label><input class="uk-checkbox positions" type="checkbox" value="${position.key}">  ${position.label}</label></li>\n`
    }

    const teamsMenu = document.getElementById('teams-menu');
    for (let team of PlayerDB.teams()) {
      teamsMenu.innerHTML += `<li><label><input class="uk-checkbox teams" type="checkbox" value="${team.key}">  ${team.shortLabel}</label></li>\n`
    }

    // Toggle expand/collapse
    document.querySelectorAll('.toggle-sublist').forEach(toggle => {
      toggle.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();

        const sublist = toggle.closest('.uk-flex').nextElementSibling;
        if (sublist) {
          sublist.hidden = !sublist.hidden;
          toggle.textContent = sublist.hidden ? '+' : '–';
        }
      });
    });

    // Handle parent checkbox -> child checkboxes
    document.querySelectorAll('.filter-group').forEach(parent => {
      const group = parent.dataset.target;
      const children = document.querySelectorAll(`.${group}`);

      parent.addEventListener('change', () => {
        children.forEach(child => child.checked = parent.checked);
      });

      // Update parent checkbox if any child is manually unchecked
      children.forEach(child => {
        child.addEventListener('change', () => {
          const allChecked = Array.from(children).every(c => c.checked);
          parent.checked = allChecked;
        });
      });
    });

    // user selection
    document.querySelectorAll('input.teams, input.positions, input.stats').forEach(input => {
      input.addEventListener('change', e => this.handleFilterSelect(e));
    });

    document.querySelectorAll('input.filter-group').forEach(groupCheckbox => {
      groupCheckbox.addEventListener('change', e => this.handleFilterSelect(e));
    });
  }

  // pass 'teams', 'positions' or 'stats' to get a list of selections
  getSelection(type) {
    const checked = Array.from(document.querySelectorAll(`input.${type}:checked`))
      .map(el => el.value);

    const objects = PlayerDB[type]();
    return checked.length ? objects.filter(o => checked.includes(o.key)) : objects;
  }

  selectedKeys(type) {
    return this.getSelection(type).map(p => p.key);
  }

  handleFilterSelect(e) {
    const selectedTeams = this.selectedKeys('teams');
    const selectedPositions = this.selectedKeys('positions');
    const allPlayers = PlayerDB.filteredPlayers(selectedTeams, selectedPositions);
    console.log(`selected ${allPlayers.length}`);
    this.startRound();
  }

  startRound() {
    this.timerDiv.hidden = true;
    this.count = 0;
    this.score = 0;
    this.bestStat = 0;
    this.updateScore();
    this.clearSelection();
    if (this.timerID) {
      clearInterval(this.timerID);
    }
    this.nextQuestion();
  }

  nextQuestion() {
    const stats = this.getSelection('stats');
    const randomStat = (stats[Math.floor(Math.random() * stats.length)]);
    this.currentStat = randomStat.key;
    this.currentStatLabel = randomStat.label;
    this.setCurrentPlayers();
    this.clearSelection();
    for (let i = 0; i < 4; i++) {
      const btn = this.choiceButtons[i];
      btn.textContent = i < this.currentPlayers.length ? this.currentPlayers[i].name : '';
    }
    this.questionLabel.innerText = `${this.currentStatLabel}`;
  }

  clearSelection() {
    for (let i = 0; i < 4; i++) {
      this.choiceButtons[i].classList.remove('choice-selected');
    }
  }

  updateScore() {
    this.scoreEl.textContent = `Score: ${this.score} / ${this.count}`;
  }

  setCurrentPlayers(maxStdDevDelta = 1) {
    const selectedTeams = this.selectedKeys('teams');
    const selectedPositions = this.selectedKeys('positions');
    const players = PlayerDB.filteredPlayers(selectedTeams, selectedPositions, true);
    const { mean, stdDev } = PlayerDB.meanStdDev(players, this.currentStat);

    const firstPlayer = players[0];
    this.bestStat = firstPlayer[this.currentStat];
    const currentPlayers = [firstPlayer];
    const maxCount = Math.min(4, players.length)

    for (let index = 1; currentPlayers.length < maxCount && index < players.length; index++) {
      const player = players[index];
      const stDevDelta = Math.abs(player[this.currentStat] - firstPlayer[this.currentStat]);
      if (stDevDelta <= stdDev * maxStdDevDelta || currentPlayers.length < 2) {
        // Always add at least one more player
        currentPlayers.push(player);
        if (player[this.currentStat] > this.bestStat) {
          this.bestStat = player[this.currentStat];
        }
      }
    }
    this.currentPlayers = currentPlayers;
  }

  handlePlayerChoice(index) {
    this.count++;
    const correctPlayers = this.currentPlayers.filter(p => p[this.currentStat] === this.bestStat);
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

    const correctPhrase = `${namePhrase} ${conj} the top ${this.currentStatLabel} (${this.bestStat.toFixed(1)})`;
    const isCorrect = index < this.currentPlayers.length ? this.currentPlayers[index][this.currentStat] === this.bestStat : false;

    if (isCorrect) this.score++;

    this.showResult({
      correct: isCorrect,
      phrase: correctPhrase,
      index: index,
    });
  }

  showResult({ correct, phrase, index }) {
    const title = correct ? "Correct" : "Nope";
    this.resultTitle.innerHTML = `<strong>${title}</strong>`;
    this.resultDetail.textContent = correct ? `Yes, ${phrase}` : phrase;

    this.updateScore();

    for (let i = 0; i < 4; i++) {
      const btn = this.choiceButtons[i];
      const player = i < this.currentPlayers.length ? this.currentPlayers[i] : null;
      btn.classList.toggle('choice-selected', i === index);
      btn.textContent = player ? `${player.name} (${player[this.currentStat]})` : '';
    }
    this.resultModal.hidden = false;
  }

  prepareTimedGame() {
    setTimeout(() => {
      this.readyModal.show();
    }, 10); // wait for offcanvas to finish closing
  }

  startTimedGame(seconds = 60) {
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

}

const warGame = new WarGame();
warGame.startRound();