import { PlayerDB } from "./playerDB.js";

export class Question {
  constructor(playerDB, stat, maxDev = 1.0) {
    this.playerDB = playerDB;
    this.stat = stat;
    this.maximize = this.stat !== 'k';
    this.players = this.playerDB.selectFour(this.stat.key, maxDev);
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
    const result = `${namePhrase} ${conj} ${this.stat.superlative} ${this.stat.label} (${this.winningValue(1)})`;
    return result;
  }

}