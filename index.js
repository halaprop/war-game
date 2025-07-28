import { PlayerDB } from "./playerDB.js";
import { Question } from "./quiz.js";

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
    this.selectedTeams = this.selectedKeys('teams');
    this.selectedPositions = this.selectedKeys('positions');
    this.startRound();
  }

  startRound() {
    this.timerDiv.hidden = true;
    this.count = 0;
    this.score = 0;

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
    this.question = new Question(randomStat, this.selectedTeams, this.selectedPositions);

    this.clearSelection();
    for (let i = 0; i < 4; i++) {
      const btn = this.choiceButtons[i];
      btn.textContent = this.question.playerName(i);
    }
    const superlative  = randomStat.superlative;
    const capSuperlative = superlative[0].toUpperCase() + superlative.slice(1);
    this.questionLabel.innerText = `${capSuperlative} ${randomStat.label}`;
  }

  clearSelection() {
    for (let i = 0; i < 4; i++) {
      this.choiceButtons[i].classList.remove('choice-selected');
    }
  }

  updateScore() {
    this.scoreEl.textContent = `Score: ${this.score} / ${this.count}`;
  }

  handlePlayerChoice(index) {
    this.count++;
    const isCorrect = this.question.isWinningIndex(index);
    if (isCorrect) this.score++;
    this.updateScore();

    const title = isCorrect ? "Correct" : "Nope";
    this.resultTitle.innerHTML = `<strong>${title}</strong>`;
    this.resultDetail.textContent = this.question.answerString();;

    for (let i = 0; i < 4; i++) {
      const btn = this.choiceButtons[i];
      btn.classList.toggle('choice-selected', i === index);
      btn.textContent = this.question.playerName(i, true);
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