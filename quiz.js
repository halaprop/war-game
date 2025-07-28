import { PlayerDB } from "./playerDB.js";

export class Question {
  constructor(stat, teams = [], positions = [], maxDev = 0.3) {
    this.stat = stat;
    this.maximize = this.stat.key !== 'k';
    this.players = this.selectFourPlayers(this.stat.key, teams, positions, maxDev);
  }

  // returns up to four players from those matching the current filters.
  // Tries to find a group whose `statKey` values have a standard deviation
  // between `minDev` and `maxDev`. Always returns the best group found.
  //
  selectFourPlayers(statKey, teams, positions, maxDev) {
    const players = PlayerDB.players().filter(p => {
      const teamMatch = teams.length === 0 || teams.includes(p.team);
      const positionMatch = positions.length === 0 || positions.includes(p.pos);
      return teamMatch && positionMatch;
    });

    if (players.length <= 4) return players;

    const populationDeviation = PlayerDB.stdDevForStat(statKey);
    const maxDeviation = maxDev * populationDeviation;

    let bestFour = null;
    let lowestDeviation = Infinity;

    for (let i = 0; i < 100; i++) {
      const candidateFour = PlayerDB.randomFourPlayers();
      const values = candidateFour.map(p => p[statKey]);
      const stdDeviation = PlayerDB.stdDeviation(values);

      if (stdDeviation <= maxDeviation) {
        bestFour = candidateFour;
        break;
      }

      if (stdDeviation < lowestDeviation) {
        lowestDeviation = stdDeviation;
        bestFour = candidateFour;
      }
    }
    return bestFour;
  }


  statName() {
    return this.stat.label;
  }

  playerAt(index) {
    return index < this.players.length ? this.players[index] : null;
  }

  playerName(index, appendStat = false) {
    const player = this.playerAt(index);
    if (!player) return '';
    const result = player.name + (appendStat ? ` (${player[this.stat.key]})` : '');
    return result;
  }

  isWinningIndex(index) {
    const player = this.playerAt(index);
    const result = player ? this.winningPlayers().includes(player) : false;
    return result;
  }

  winningValue() {
    const key = this.stat.key;
    const reducer = this.maximize ? (a, b) => (b[key] > a[key] ? b : a) : (a, b) => (b[key] < a[key] ? b : a);
    return this.players.reduce(reducer)[key];
  }

  winningPlayers() {
    return this.players.filter(player => player[this.stat.key] == this.winningValue());
  }

  answerString() {
    const winningPlayerNames = this.winningPlayers().map(p => p.name);

    let namePhrase, conj;
    if (winningPlayerNames.length === 1) {
      namePhrase = winningPlayerNames[0];
      conj = 'has';
    } else if (winningPlayerNames.length === 2) {
      namePhrase = `${winningPlayerNames[0]} and ${winningPlayerNames[1]}`;
      conj = 'both have';
    } else {
      namePhrase = `${winningPlayerNames.slice(0, -1).join(', ')}, and ${winningPlayerNames.slice(-1)}`;
      conj = 'all have';
    }
    const result = `${namePhrase} ${conj} the ${this.stat.superlative} ${this.stat.label.toLowerCase()} (${this.winningValue(1)})`;
    return result;
  }

}