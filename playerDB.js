
export class PlayerDB {
  constructor() {
    this.selectedTeams = [];
    this.selectedPositions = [];
    this.selectedStats = [];
  }

  playerMatches(player) {
    const teamMatch = this.selectedTeams.length === 0 || this.selectedTeams.includes(player.team);
    const positionMatch = this.selectedPositions.length === 0 || this.selectedPositions.includes(player.pos);
    return teamMatch && positionMatch;
  }

  matchingPlayers(shuffled = true) {
    const matches = PlayerDB.players().filter(p => this.playerMatches(p));
    return shuffled ? PlayerDB.shuffle(matches) : matches;
  }

  // This returns up to four players from those matching the current filters.
  // Tries to find a group whose `statKey` values have a standard deviation
  // between `minDev` and `maxDev`. Always returns the best group found.
  //
  selectFour(statKey, maxDev = 1.0) {
    const players = this.matchingPlayers(false);
    if (players.length <= 4) return players;

    const populationDeviation = PlayerDB.stdDevForStat(statKey);
    const maxDeviation = maxDev * populationDeviation;

    let bestFour = null;
    let lowestDeviation = Infinity;

    for (let i = 0; i < 100; i++) {
      const candidateFour = PlayerDB.randomFour(players);
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

  static randomFour(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result.slice(0, 4);
  }

  static stdDevForStat(statKey) {
    if (!this.stdDevCache) this.stdDevCache = new Map();

    if (!this.stdDevCache.has(statKey)) {
      const values = this.players().map(p => p[statKey]);
      const stdDev = this.stdDeviation(values);
      this.stdDevCache.set(statKey, stdDev);
    }

    return this.stdDevCache.get(statKey);
  }

  static stdDeviation(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );
    return stdDev;
  }

  static shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  static teams() {
    const teams = [
      { key: 'NYY', label: 'New York Yankees', shortLabel: 'Yankees' },
      { key: 'CHC', label: 'Chicago Cubs', shortLabel: 'Cubs' },
      { key: 'SEA', label: 'Seattle Mariners', shortLabel: 'Mariners' },
      { key: 'HOU', label: 'Houston Astros', shortLabel: 'Astros' },
      { key: 'WSH', label: 'Washington Nationals', shortLabel: 'Nationals' },
      { key: 'KC', label: 'Kansas City Royals', shortLabel: 'Royals' },
      { key: 'SD', label: 'San Diego Padres', shortLabel: 'Padres' },
      { key: 'MIN', label: 'Minnesota Twins', shortLabel: 'Twins' },
      { key: 'LAD', label: 'Los Angeles Dodgers', shortLabel: 'Dodgers' },
      { key: 'BOS', label: 'Boston Red Sox', shortLabel: 'Red Sox' },
      { key: 'NYM', label: 'New York Mets', shortLabel: 'Mets' },
      { key: 'CLE', label: 'Cleveland Guardians', shortLabel: 'Guardians' },
      { key: 'ATL', label: 'Atlanta Braves', shortLabel: 'Braves' },
      { key: 'CIN', label: 'Cincinnati Reds', shortLabel: 'Reds' },
      { key: 'TEX', label: 'Texas Rangers', shortLabel: 'Rangers' },
      { key: 'ARI', label: 'Arizona Diamondbacks', shortLabel: 'Diamondbacks' },
      { key: 'LAA', label: 'Los Angeles Angels', shortLabel: 'Angels' },
      { key: 'PHI', label: 'Philadelphia Phillies', shortLabel: 'Phillies' },
      { key: 'SF', label: 'San Francisco Giants', shortLabel: 'Giants' },
      { key: 'MIA', label: 'Miami Marlins', shortLabel: 'Marlins' },
      { key: 'MIL', label: 'Milwaukee Brewers', shortLabel: 'Brewers' },
      { key: 'TB', label: 'Tampa Bay Rays', shortLabel: 'Rays' },
      { key: 'TOR', label: 'Toronto Blue Jays', shortLabel: 'Blue Jays' },
      { key: 'BAL', label: 'Baltimore Orioles', shortLabel: 'Orioles' },
      { key: 'DET', label: 'Detroit Tigers', shortLabel: 'Tigers' },
      { key: 'STL', label: 'St. Louis Cardinals', shortLabel: 'Cardinals' },
      { key: 'ATH', label: 'Oakland Athletics', shortLabel: 'Athletics' },
      { key: 'COL', label: 'Colorado Rockies', shortLabel: 'Rockies' },
      { key: 'PIT', label: 'Pittsburgh Pirates', shortLabel: 'Pirates' },
      { key: 'CHW', label: 'Chicago White Sox', shortLabel: 'White Sox' }
    ];
    return teams;
  }

  static positions() {
    const positions = [
      { key: 'RF', label: 'Right Field' },
      { key: 'CF', label: 'Center Field' },
      { key: 'C', label: 'Catcher' },
      { key: 'SS', label: 'Shortstop' },
      { key: 'LF', label: 'Left Field' },
      { key: 'SP', label: 'Starting Pitcher' },
      { key: '2B', label: 'Second Base' },
      { key: '3B', label: 'Third Base' },
      { key: '1B', label: 'First Base' },
      { key: 'DH', label: 'Designated Hitter' }
    ];
    return positions;
  }

  static stats() {
    const stats = [
      { key: 'gp', label: 'Games Played' },
      { key: 'ab', label: 'At Bats' },
      { key: 'r', label: 'Runs' },
      { key: 'h', label: 'Hits' },
      { key: 'avg', label: 'Batting Average' },
      { key: 'hr', label: 'Home Runs' },
      { key: 'rbi', label: 'Runs Batted In' },
      { key: 'tb', label: 'Total Bases' },
      { key: 'bb', label: 'Walks' },
      { key: 'k', label: 'Strikeouts' },
      { key: 'sb', label: 'Stolen Bases' },
      { key: 'obp', label: 'On-Base Percentage' },
      { key: 'slg', label: 'Slugging Percentage' },
      { key: 'ops', label: 'On-base Plus Slugging' },
      { key: 'war', label: 'Wins Above Replacement' }
    ];
    return stats;
  }

  static players() {
    return [
      { "name": "Aaron Judge", "team": "NYY", "pos": "RF", "gp": 100, "ab": 367, "r": 89, "h": 128, "avg": 0.349, "2b": 24, "3b": 2, "hr": 36, "rbi": 82, "tb": 264, "bb": 72, "k": 117, "sb": 6, "obp": 0.456, "slg": 0.719, "ops": 1.176, "war": 6.9 },
      { "name": "Pete Crow-Armstrong", "team": "CHC", "pos": "CF", "gp": 98, "ab": 385, "r": 68, "h": 104, "avg": 0.27, "2b": 24, "3b": 4, "hr": 26, "rbi": 72, "tb": 214, "bb": 18, "k": 96, "sb": 28, "obp": 0.306, "slg": 0.556, "ops": 0.861, "war": 5.7 },
      { "name": "Cal Raleigh", "team": "SEA", "pos": "C", "gp": 98, "ab": 364, "r": 67, "h": 93, "avg": 0.255, "2b": 16, "3b": 0, "hr": 38, "rbi": 83, "tb": 223, "bb": 63, "k": 107, "sb": 11, "obp": 0.37, "slg": 0.613, "ops": 0.983, "war": 4.9 },
      { "name": "Jeremy Pena", "team": "HOU", "pos": "SS", "gp": 82, "ab": 317, "r": 48, "h": 102, "avg": 0.322, "2b": 18, "3b": 1, "hr": 11, "rbi": 40, "tb": 155, "bb": 20, "k": 55, "sb": 15, "obp": 0.378, "slg": 0.489, "ops": 0.867, "war": 4.4 },
      { "name": "James Wood", "team": "WSH", "pos": "LF", "gp": 99, "ab": 371, "r": 61, "h": 102, "avg": 0.275, "2b": 21, "3b": 0, "hr": 24, "rbi": 70, "tb": 195, "bb": 62, "k": 121, "sb": 14, "obp": 0.379, "slg": 0.526, "ops": 0.905, "war": 4.4 },
      { "name": "Bobby Witt Jr.", "team": "KC", "pos": "SS", "gp": 101, "ab": 399, "r": 60, "h": 115, "avg": 0.288, "2b": 33, "3b": 3, "hr": 14, "rbi": 56, "tb": 196, "bb": 31, "k": 82, "sb": 27, "obp": 0.339, "slg": 0.491, "ops": 0.831, "war": 4.4 },
      { "name": "Fernando Tatis Jr.", "team": "SD", "pos": "RF", "gp": 98, "ab": 370, "r": 67, "h": 98, "avg": 0.265, "2b": 14, "3b": 2, "hr": 16, "rbi": 42, "tb": 164, "bb": 55, "k": 77, "sb": 22, "obp": 0.365, "slg": 0.443, "ops": 0.808, "war": 4.3 },
      { "name": "Byron Buxton", "team": "MIN", "pos": "CF", "gp": 81, "ab": 312, "r": 68, "h": 91, "avg": 0.292, "2b": 14, "3b": 4, "hr": 23, "rbi": 58, "tb": 182, "bb": 28, "k": 90, "sb": 17, "obp": 0.353, "slg": 0.583, "ops": 0.937, "war": 4.2 },
      { "name": "Shohei Ohtani", "team": "LAD", "pos": "SP", "gp": 99, "ab": 386, "r": 94, "h": 106, "avg": 0.275, "2b": 12, "3b": 7, "hr": 35, "rbi": 67, "tb": 237, "bb": 63, "k": 115, "sb": 13, "obp": 0.379, "slg": 0.614, "ops": 0.993, "war": 4.2 },
      { "name": "Kyle Tucker", "team": "CHC", "pos": "RF", "gp": 99, "ab": 369, "r": 70, "h": 102, "avg": 0.276, "2b": 19, "3b": 4, "hr": 18, "rbi": 57, "tb": 183, "bb": 63, "k": 61, "sb": 22, "obp": 0.382, "slg": 0.496, "ops": 0.878, "war": 4.2 },
      { "name": "Ceddanne Rafaela", "team": "BOS", "pos": "CF", "gp": 96, "ab": 333, "r": 56, "h": 90, "avg": 0.27, "2b": 21, "3b": 2, "hr": 14, "rbi": 48, "tb": 157, "bb": 16, "k": 67, "sb": 14, "obp": 0.311, "slg": 0.471, "ops": 0.782, "war": 4.2 },
      { "name": "Will Smith", "team": "LAD", "pos": "C", "gp": 78, "ab": 261, "r": 49, "h": 85, "avg": 0.326, "2b": 16, "3b": 1, "hr": 14, "rbi": 48, "tb": 145, "bb": 45, "k": 55, "sb": 2, "obp": 0.424, "slg": 0.556, "ops": 0.979, "war": 4.1 },
      { "name": "Julio Rodriguez", "team": "SEA", "pos": "CF", "gp": 99, "ab": 409, "r": 65, "h": 102, "avg": 0.249, "2b": 17, "3b": 3, "hr": 14, "rbi": 51, "tb": 167, "bb": 30, "k": 100, "sb": 19, "obp": 0.312, "slg": 0.408, "ops": 0.72, "war": 4 },
      { "name": "Juan Soto", "team": "NYM", "pos": "RF", "gp": 100, "ab": 355, "r": 72, "h": 91, "avg": 0.256, "2b": 15, "3b": 0, "hr": 24, "rbi": 59, "tb": 178, "bb": 79, "k": 83, "sb": 12, "obp": 0.39, "slg": 0.501, "ops": 0.891, "war": 3.9 },
      { "name": "Nico Hoerner", "team": "CHC", "pos": "2B", "gp": 96, "ab": 365, "r": 52, "h": 104, "avg": 0.285, "2b": 18, "3b": 3, "hr": 3, "rbi": 40, "tb": 137, "bb": 21, "k": 30, "sb": 17, "obp": 0.332, "slg": 0.375, "ops": 0.708, "war": 3.8 },
      { "name": "Jose Ramirez", "team": "CLE", "pos": "3B", "gp": 96, "ab": 361, "r": 60, "h": 106, "avg": 0.294, "2b": 18, "3b": 2, "hr": 20, "rbi": 55, "tb": 188, "bb": 38, "k": 45, "sb": 29, "obp": 0.364, "slg": 0.521, "ops": 0.885, "war": 3.8 },
      { "name": "Randy Arozarena", "team": "SEA", "pos": "LF", "gp": 98, "ab": 365, "r": 56, "h": 91, "avg": 0.249, "2b": 22, "3b": 1, "hr": 18, "rbi": 49, "tb": 169, "bb": 45, "k": 116, "sb": 16, "obp": 0.356, "slg": 0.463, "ops": 0.819, "war": 3.7 },
      { "name": "Matt Olson", "team": "ATL", "pos": "1B", "gp": 99, "ab": 374, "r": 56, "h": 98, "avg": 0.262, "2b": 25, "3b": 0, "hr": 18, "rbi": 64, "tb": 177, "bb": 59, "k": 104, "sb": 0, "obp": 0.363, "slg": 0.473, "ops": 0.836, "war": 3.6 },
      { "name": "J.P. Crawford", "team": "SEA", "pos": "SS", "gp": 97, "ab": 362, "r": 45, "h": 103, "avg": 0.285, "2b": 16, "3b": 0, "hr": 7, "rbi": 38, "tb": 140, "bb": 56, "k": 75, "sb": 5, "obp": 0.384, "slg": 0.387, "ops": 0.771, "war": 3.6 },
      { "name": "Elly De La Cruz", "team": "CIN", "pos": "SS", "gp": 101, "ab": 383, "r": 75, "h": 107, "avg": 0.279, "2b": 18, "3b": 3, "hr": 18, "rbi": 65, "tb": 185, "bb": 47, "k": 104, "sb": 26, "obp": 0.36, "slg": 0.483, "ops": 0.843, "war": 3.6 },
      { "name": "Corey Seager", "team": "TEX", "pos": "SS", "gp": 69, "ab": 257, "r": 39, "h": 69, "avg": 0.268, "2b": 13, "3b": 0, "hr": 13, "rbi": 34, "tb": 121, "bb": 38, "k": 62, "sb": 1, "obp": 0.369, "slg": 0.471, "ops": 0.84, "war": 3.5 },
      { "name": "Eugenio Suarez", "team": "ARI", "pos": "3B", "gp": 99, "ab": 362, "r": 64, "h": 93, "avg": 0.257, "2b": 18, "3b": 0, "hr": 36, "rbi": 86, "tb": 219, "bb": 28, "k": 105, "sb": 1, "obp": 0.328, "slg": 0.605, "ops": 0.933, "war": 3.5 },
      { "name": "Michael Busch", "team": "CHC", "pos": "1B", "gp": 94, "ab": 312, "r": 47, "h": 89, "avg": 0.285, "2b": 15, "3b": 3, "hr": 20, "rbi": 60, "tb": 170, "bb": 37, "k": 83, "sb": 4, "obp": 0.372, "slg": 0.545, "ops": 0.917, "war": 3.4 },
      { "name": "Zach Neto", "team": "LAA", "pos": "SS", "gp": 81, "ab": 324, "r": 65, "h": 91, "avg": 0.281, "2b": 19, "3b": 1, "hr": 15, "rbi": 35, "tb": 157, "bb": 18, "k": 89, "sb": 18, "obp": 0.33, "slg": 0.485, "ops": 0.814, "war": 3.3 },
      { "name": "CJ Abrams", "team": "WSH", "pos": "SS", "gp": 86, "ab": 344, "r": 63, "h": 96, "avg": 0.279, "2b": 21, "3b": 4, "hr": 13, "rbi": 36, "tb": 164, "bb": 25, "k": 63, "sb": 20, "obp": 0.344, "slg": 0.477, "ops": 0.821, "war": 3.3 },
      { "name": "Ketel Marte", "team": "ARI", "pos": "2B", "gp": 69, "ab": 256, "r": 53, "h": 74, "avg": 0.289, "2b": 14, "3b": 0, "hr": 19, "rbi": 40, "tb": 145, "bb": 41, "k": 46, "sb": 2, "obp": 0.394, "slg": 0.566, "ops": 0.96, "war": 3.2 },
      { "name": "Corbin Carroll", "team": "ARI", "pos": "RF", "gp": 84, "ab": 340, "r": 66, "h": 85, "avg": 0.25, "2b": 16, "3b": 13, "hr": 21, "rbi": 49, "tb": 190, "bb": 32, "k": 98, "sb": 13, "obp": 0.326, "slg": 0.559, "ops": 0.885, "war": 3.1 },
      { "name": "Carlos Narvaez", "team": "BOS", "pos": "C", "gp": 76, "ab": 263, "r": 38, "h": 70, "avg": 0.266, "2b": 19, "3b": 0, "hr": 8, "rbi": 31, "tb": 113, "bb": 31, "k": 74, "sb": 1, "obp": 0.341, "slg": 0.43, "ops": 0.771, "war": 3.1 },
      { "name": "Kyle Schwarber", "team": "PHI", "pos": "LF", "gp": 100, "ab": 367, "r": 70, "h": 91, "avg": 0.248, "2b": 14, "3b": 1, "hr": 32, "rbi": 74, "tb": 203, "bb": 68, "k": 119, "sb": 9, "obp": 0.377, "slg": 0.553, "ops": 0.93, "war": 3.1 },
      { "name": "Matt Chapman", "team": "SF", "pos": "3B", "gp": 77, "ab": 277, "r": 44, "h": 66, "avg": 0.238, "2b": 14, "3b": 0, "hr": 13, "rbi": 35, "tb": 119, "bb": 43, "k": 78, "sb": 7, "obp": 0.347, "slg": 0.43, "ops": 0.776, "war": 3 },
      { "name": "Otto Lopez", "team": "MIA", "pos": "2B", "gp": 83, "ab": 311, "r": 42, "h": 78, "avg": 0.251, "2b": 11, "3b": 0, "hr": 11, "rbi": 52, "tb": 122, "bb": 32, "k": 46, "sb": 10, "obp": 0.324, "slg": 0.392, "ops": 0.716, "war": 3 },
      { "name": "Steven Kwan", "team": "CLE", "pos": "LF", "gp": 93, "ab": 364, "r": 44, "h": 105, "avg": 0.288, "2b": 20, "3b": 1, "hr": 6, "rbi": 32, "tb": 145, "bb": 36, "k": 34, "sb": 11, "obp": 0.352, "slg": 0.398, "ops": 0.75, "war": 3 },
      { "name": "Carson Kelly", "team": "CHC", "pos": "C", "gp": 65, "ab": 210, "r": 37, "h": 58, "avg": 0.276, "2b": 11, "3b": 1, "hr": 13, "rbi": 34, "tb": 110, "bb": 33, "k": 38, "sb": 0, "obp": 0.374, "slg": 0.524, "ops": 0.898, "war": 2.9 },
      { "name": "Brice Turang", "team": "MIL", "pos": "2B", "gp": 96, "ab": 360, "r": 60, "h": 100, "avg": 0.278, "2b": 15, "3b": 0, "hr": 6, "rbi": 39, "tb": 133, "bb": 40, "k": 85, "sb": 18, "obp": 0.348, "slg": 0.369, "ops": 0.718, "war": 2.9 },
      { "name": "Jonathan Aranda", "team": "TB", "pos": "1B", "gp": 94, "ab": 326, "r": 48, "h": 103, "avg": 0.316, "2b": 20, "3b": 0, "hr": 11, "rbi": 50, "tb": 156, "bb": 35, "k": 90, "sb": 0, "obp": 0.394, "slg": 0.479, "ops": 0.872, "war": 2.9 },
      { "name": "Vladimir Guerrero Jr.", "team": "TOR", "pos": "1B", "gp": 98, "ab": 362, "r": 62, "h": 101, "avg": 0.279, "2b": 19, "3b": 0, "hr": 13, "rbi": 48, "tb": 159, "bb": 60, "k": 59, "sb": 5, "obp": 0.388, "slg": 0.439, "ops": 0.828, "war": 2.9 },
      { "name": "Pete Alonso", "team": "NYM", "pos": "1B", "gp": 101, "ab": 374, "r": 53, "h": 102, "avg": 0.273, "2b": 26, "3b": 1, "hr": 21, "rbi": 77, "tb": 193, "bb": 47, "k": 101, "sb": 1, "obp": 0.368, "slg": 0.516, "ops": 0.884, "war": 2.9 },
      { "name": "Manny Machado", "team": "SD", "pos": "3B", "gp": 100, "ab": 382, "r": 60, "h": 109, "avg": 0.285, "2b": 23, "3b": 0, "hr": 18, "rbi": 60, "tb": 186, "bb": 39, "k": 73, "sb": 8, "obp": 0.347, "slg": 0.487, "ops": 0.834, "war": 2.9 },
      { "name": "Gunnar Henderson", "team": "BAL", "pos": "SS", "gp": 92, "ab": 351, "r": 51, "h": 98, "avg": 0.279, "2b": 22, "3b": 4, "hr": 11, "rbi": 35, "tb": 161, "bb": 33, "k": 91, "sb": 13, "obp": 0.344, "slg": 0.459, "ops": 0.802, "war": 2.9 },
      { "name": "Andy Pages", "team": "LAD", "pos": "CF", "gp": 97, "ab": 365, "r": 47, "h": 103, "avg": 0.282, "2b": 16, "3b": 1, "hr": 18, "rbi": 60, "tb": 175, "bb": 18, "k": 82, "sb": 8, "obp": 0.321, "slg": 0.479, "ops": 0.801, "war": 2.9 },
      { "name": "Jazz Chisholm Jr.", "team": "NYY", "pos": "2B", "gp": 69, "ab": 248, "r": 40, "h": 62, "avg": 0.25, "2b": 11, "3b": 0, "hr": 17, "rbi": 45, "tb": 124, "bb": 33, "k": 75, "sb": 10, "obp": 0.345, "slg": 0.5, "ops": 0.845, "war": 2.9 },
      { "name": "Kyle Stowers", "team": "MIA", "pos": "LF", "gp": 95, "ab": 319, "r": 49, "h": 94, "avg": 0.295, "2b": 14, "3b": 3, "hr": 22, "rbi": 60, "tb": 180, "bb": 36, "k": 101, "sb": 4, "obp": 0.37, "slg": 0.564, "ops": 0.934, "war": 2.9 },
      { "name": "Isaac Paredes", "team": "HOU", "pos": "3B", "gp": 94, "ab": 351, "r": 51, "h": 91, "avg": 0.259, "2b": 15, "3b": 1, "hr": 19, "rbi": 50, "tb": 165, "bb": 49, "k": 67, "sb": 0, "obp": 0.359, "slg": 0.47, "ops": 0.829, "war": 2.8 },
      { "name": "Trea Turner", "team": "PHI", "pos": "SS", "gp": 98, "ab": 402, "r": 64, "h": 115, "avg": 0.286, "2b": 19, "3b": 2, "hr": 11, "rbi": 41, "tb": 171, "bb": 32, "k": 72, "sb": 25, "obp": 0.343, "slg": 0.425, "ops": 0.769, "war": 2.8 },
      { "name": "Cody Bellinger", "team": "NYY", "pos": "LF", "gp": 91, "ab": 354, "r": 56, "h": 99, "avg": 0.28, "2b": 18, "3b": 3, "hr": 17, "rbi": 56, "tb": 174, "bb": 29, "k": 54, "sb": 9, "obp": 0.332, "slg": 0.492, "ops": 0.823, "war": 2.8 },
      { "name": "Ronald Acuna Jr.", "team": "ATL", "pos": "RF", "gp": 49, "ab": 174, "r": 46, "h": 57, "avg": 0.328, "2b": 9, "3b": 1, "hr": 13, "rbi": 24, "tb": 107, "bb": 37, "k": 56, "sb": 4, "obp": 0.445, "slg": 0.615, "ops": 1.06, "war": 2.8 },
      { "name": "Max Muncy", "team": "LAD", "pos": "3B", "gp": 81, "ab": 256, "r": 39, "h": 64, "avg": 0.25, "2b": 10, "3b": 2, "hr": 13, "rbi": 55, "tb": 117, "bb": 51, "k": 69, "sb": 4, "obp": 0.375, "slg": 0.457, "ops": 0.832, "war": 2.8 },
      { "name": "Zach McKinstry", "team": "DET", "pos": "3B", "gp": 92, "ab": 301, "r": 49, "h": 83, "avg": 0.276, "2b": 14, "3b": 8, "hr": 8, "rbi": 32, "tb": 137, "bb": 36, "k": 72, "sb": 16, "obp": 0.357, "slg": 0.455, "ops": 0.812, "war": 2.8 },
      { "name": "Alex Bregman", "team": "BOS", "pos": "3B", "gp": 57, "ab": 219, "r": 34, "h": 64, "avg": 0.292, "2b": 18, "3b": 0, "hr": 12, "rbi": 38, "tb": 118, "bb": 22, "k": 44, "sb": 1, "obp": 0.371, "slg": 0.539, "ops": 0.91, "war": 2.7 },
      { "name": "Jake Meyers", "team": "HOU", "pos": "CF", "gp": 89, "ab": 289, "r": 47, "h": 89, "avg": 0.308, "2b": 15, "3b": 2, "hr": 3, "rbi": 21, "tb": 117, "bb": 27, "k": 58, "sb": 14, "obp": 0.369, "slg": 0.405, "ops": 0.774, "war": 2.7 },
      { "name": "Francisco Lindor", "team": "NYM", "pos": "SS", "gp": 99, "ab": 400, "r": 64, "h": 99, "avg": 0.248, "2b": 18, "3b": 0, "hr": 19, "rbi": 55, "tb": 174, "bb": 33, "k": 80, "sb": 16, "obp": 0.316, "slg": 0.435, "ops": 0.751, "war": 2.7 },
      { "name": "Brandon Nimmo", "team": "NYM", "pos": "LF", "gp": 97, "ab": 361, "r": 49, "h": 94, "avg": 0.26, "2b": 18, "3b": 0, "hr": 18, "rbi": 55, "tb": 166, "bb": 32, "k": 78, "sb": 11, "obp": 0.327, "slg": 0.46, "ops": 0.787, "war": 2.7 },
      { "name": "Trent Grisham", "team": "NYY", "pos": "CF", "gp": 83, "ab": 278, "r": 46, "h": 71, "avg": 0.255, "2b": 9, "3b": 1, "hr": 17, "rbi": 38, "tb": 133, "bb": 44, "k": 71, "sb": 0, "obp": 0.359, "slg": 0.478, "ops": 0.838, "war": 2.7 },
      { "name": "Maikel Garcia", "team": "KC", "pos": "3B", "gp": 99, "ab": 368, "r": 43, "h": 108, "avg": 0.293, "2b": 26, "3b": 3, "hr": 8, "rbi": 41, "tb": 164, "bb": 31, "k": 54, "sb": 18, "obp": 0.347, "slg": 0.446, "ops": 0.793, "war": 2.7 },
      { "name": "Geraldo Perdomo", "team": "ARI", "pos": "SS", "gp": 100, "ab": 367, "r": 55, "h": 99, "avg": 0.27, "2b": 20, "3b": 2, "hr": 10, "rbi": 72, "tb": 153, "bb": 59, "k": 51, "sb": 15, "obp": 0.372, "slg": 0.417, "ops": 0.789, "war": 2.7 },
      { "name": "Wilyer Abreu", "team": "BOS", "pos": "RF", "gp": 87, "ab": 281, "r": 43, "h": 71, "avg": 0.253, "2b": 11, "3b": 0, "hr": 20, "rbi": 55, "tb": 142, "bb": 31, "k": 76, "sb": 5, "obp": 0.325, "slg": 0.505, "ops": 0.83, "war": 2.7 },
      { "name": "Wyatt Langford", "team": "TEX", "pos": "LF", "gp": 80, "ab": 306, "r": 42, "h": 71, "avg": 0.232, "2b": 11, "3b": 0, "hr": 15, "rbi": 38, "tb": 127, "bb": 35, "k": 95, "sb": 15, "obp": 0.312, "slg": 0.415, "ops": 0.727, "war": 2.7 },
      { "name": "Brendan Donovan", "team": "STL", "pos": "2B", "gp": 93, "ab": 358, "r": 52, "h": 105, "avg": 0.293, "2b": 23, "3b": 0, "hr": 8, "rbi": 38, "tb": 152, "bb": 35, "k": 55, "sb": 3, "obp": 0.364, "slg": 0.425, "ops": 0.788, "war": 2.6 },
      { "name": "Sean Murphy", "team": "ATL", "pos": "C", "gp": 64, "ab": 208, "r": 27, "h": 50, "avg": 0.24, "2b": 9, "3b": 0, "hr": 16, "rbi": 38, "tb": 107, "bb": 22, "k": 74, "sb": 0, "obp": 0.331, "slg": 0.514, "ops": 0.845, "war": 2.6 },
      { "name": "Riley Greene", "team": "DET", "pos": "LF", "gp": 99, "ab": 382, "r": 54, "h": 106, "avg": 0.277, "2b": 21, "3b": 1, "hr": 25, "rbi": 79, "tb": 204, "bb": 27, "k": 132, "sb": 1, "obp": 0.327, "slg": 0.534, "ops": 0.861, "war": 2.6 },
      { "name": "Dansby Swanson", "team": "CHC", "pos": "SS", "gp": 99, "ab": 382, "r": 58, "h": 96, "avg": 0.251, "2b": 13, "3b": 2, "hr": 16, "rbi": 47, "tb": 161, "bb": 29, "k": 111, "sb": 7, "obp": 0.301, "slg": 0.421, "ops": 0.723, "war": 2.6 },
      { "name": "Marcus Semien", "team": "TEX", "pos": "2B", "gp": 100, "ab": 366, "r": 48, "h": 84, "avg": 0.23, "2b": 11, "3b": 1, "hr": 12, "rbi": 49, "tb": 133, "bb": 42, "k": 80, "sb": 8, "obp": 0.309, "slg": 0.363, "ops": 0.673, "war": 2.5 },
      { "name": "Jarren Duran", "team": "BOS", "pos": "LF", "gp": 101, "ab": 409, "r": 54, "h": 105, "avg": 0.257, "2b": 25, "3b": 10, "hr": 9, "rbi": 51, "tb": 177, "bb": 34, "k": 108, "sb": 16, "obp": 0.323, "slg": 0.433, "ops": 0.756, "war": 2.5 },
      { "name": "Josh Smith", "team": "TEX", "pos": "SS", "gp": 88, "ab": 312, "r": 48, "h": 86, "avg": 0.276, "2b": 17, "3b": 1, "hr": 8, "rbi": 24, "tb": 129, "bb": 33, "k": 57, "sb": 9, "obp": 0.351, "slg": 0.413, "ops": 0.765, "war": 2.4 },
      { "name": "Bryce Harper", "team": "PHI", "pos": "1B", "gp": 72, "ab": 269, "r": 43, "h": 73, "avg": 0.271, "2b": 22, "3b": 0, "hr": 13, "rbi": 41, "tb": 134, "bb": 44, "k": 65, "sb": 9, "obp": 0.379, "slg": 0.498, "ops": 0.877, "war": 2.4 },
      { "name": "Ramon Laureano", "team": "BAL", "pos": "RF", "gp": 72, "ab": 225, "r": 36, "h": 63, "avg": 0.28, "2b": 16, "3b": 0, "hr": 12, "rbi": 40, "tb": 115, "bb": 20, "k": 65, "sb": 4, "obp": 0.343, "slg": 0.511, "ops": 0.854, "war": 2.4 },
      { "name": "Masyn Winn", "team": "STL", "pos": "SS", "gp": 89, "ab": 342, "r": 57, "h": 92, "avg": 0.269, "2b": 20, "3b": 0, "hr": 7, "rbi": 33, "tb": 133, "bb": 27, "k": 66, "sb": 6, "obp": 0.326, "slg": 0.389, "ops": 0.715, "war": 2.4 },
      { "name": "Nick Kurtz", "team": "ATH", "pos": "1B", "gp": 62, "ab": 221, "r": 39, "h": 62, "avg": 0.281, "2b": 14, "3b": 2, "hr": 19, "rbi": 49, "tb": 137, "bb": 27, "k": 81, "sb": 1, "obp": 0.355, "slg": 0.62, "ops": 0.974, "war": 2.4 },
      { "name": "Taylor Walls", "team": "TB", "pos": "SS", "gp": 87, "ab": 236, "r": 30, "h": 51, "avg": 0.216, "2b": 8, "3b": 1, "hr": 3, "rbi": 32, "tb": 70, "bb": 24, "k": 54, "sb": 12, "obp": 0.282, "slg": 0.297, "ops": 0.579, "war": 2.3 },
      { "name": "Mookie Betts", "team": "LAD", "pos": "SS", "gp": 92, "ab": 361, "r": 58, "h": 87, "avg": 0.241, "2b": 14, "3b": 1, "hr": 11, "rbi": 45, "tb": 136, "bb": 37, "k": 45, "sb": 6, "obp": 0.312, "slg": 0.377, "ops": 0.689, "war": 2.3 },
      { "name": "Gleyber Torres", "team": "DET", "pos": "2B", "gp": 88, "ab": 313, "r": 52, "h": 88, "avg": 0.281, "2b": 16, "3b": 0, "hr": 9, "rbi": 45, "tb": 131, "bb": 54, "k": 50, "sb": 4, "obp": 0.388, "slg": 0.419, "ops": 0.807, "war": 2.2 },
      { "name": "Drake Baldwin", "team": "ATL", "pos": "C", "gp": 69, "ab": 207, "r": 25, "h": 60, "avg": 0.29, "2b": 8, "3b": 0, "hr": 11, "rbi": 39, "tb": 101, "bb": 20, "k": 36, "sb": 0, "obp": 0.358, "slg": 0.488, "ops": 0.846, "war": 2.2 },
      { "name": "Sal Frelick", "team": "MIL", "pos": "RF", "gp": 93, "ab": 344, "r": 46, "h": 101, "avg": 0.294, "2b": 11, "3b": 3, "hr": 7, "rbi": 39, "tb": 139, "bb": 26, "k": 49, "sb": 17, "obp": 0.354, "slg": 0.404, "ops": 0.758, "war": 2.2 },
      { "name": "Mike Yastrzemski", "team": "SF", "pos": "RF", "gp": 90, "ab": 303, "r": 36, "h": 72, "avg": 0.238, "2b": 14, "3b": 1, "hr": 8, "rbi": 28, "tb": 112, "bb": 43, "k": 80, "sb": 6, "obp": 0.333, "slg": 0.37, "ops": 0.703, "war": 2.2 },
      { "name": "Rafael Devers", "team": "SF", "pos": "DH", "gp": 102, "ab": 377, "r": 57, "h": 97, "avg": 0.257, "2b": 24, "3b": 0, "hr": 17, "rbi": 68, "tb": 172, "bb": 74, "k": 115, "sb": 1, "obp": 0.383, "slg": 0.456, "ops": 0.839, "war": 2.2 },
      { "name": "Ernie Clement", "team": "TOR", "pos": "3B", "gp": 98, "ab": 330, "r": 46, "h": 92, "avg": 0.279, "2b": 20, "3b": 0, "hr": 4, "rbi": 26, "tb": 124, "bb": 20, "k": 35, "sb": 3, "obp": 0.318, "slg": 0.376, "ops": 0.694, "war": 2.2 },
      { "name": "Caleb Durbin", "team": "MIL", "pos": "3B", "gp": 77, "ab": 246, "r": 35, "h": 65, "avg": 0.264, "2b": 14, "3b": 0, "hr": 5, "rbi": 35, "tb": 94, "bb": 20, "k": 26, "sb": 9, "obp": 0.35, "slg": 0.382, "ops": 0.732, "war": 2.2 },
      { "name": "Adolis Garcia", "team": "TEX", "pos": "RF", "gp": 96, "ab": 357, "r": 36, "h": 82, "avg": 0.23, "2b": 20, "3b": 0, "hr": 13, "rbi": 56, "tb": 141, "bb": 20, "k": 100, "sb": 10, "obp": 0.273, "slg": 0.395, "ops": 0.668, "war": 2.1 },
      { "name": "Harrison Bader", "team": "MIN", "pos": "LF", "gp": 88, "ab": 249, "r": 29, "h": 62, "avg": 0.249, "2b": 11, "3b": 0, "hr": 12, "rbi": 36, "tb": 109, "bb": 24, "k": 71, "sb": 8, "obp": 0.33, "slg": 0.438, "ops": 0.768, "war": 2.1 },
      { "name": "TJ Friedl", "team": "CIN", "pos": "CF", "gp": 97, "ab": 367, "r": 58, "h": 98, "avg": 0.267, "2b": 15, "3b": 2, "hr": 9, "rbi": 33, "tb": 144, "bb": 47, "k": 68, "sb": 10, "obp": 0.364, "slg": 0.392, "ops": 0.757, "war": 2.1 },
      { "name": "Jacob Wilson", "team": "ATH", "pos": "SS", "gp": 91, "ab": 358, "r": 45, "h": 114, "avg": 0.318, "2b": 17, "3b": 0, "hr": 10, "rbi": 44, "tb": 161, "bb": 20, "k": 29, "sb": 5, "obp": 0.36, "slg": 0.45, "ops": 0.81, "war": 2.1 },
      { "name": "Danny Jansen", "team": "TB", "pos": "C", "gp": 69, "ab": 211, "r": 28, "h": 45, "avg": 0.213, "2b": 8, "3b": 0, "hr": 11, "rbi": 29, "tb": 86, "bb": 29, "k": 61, "sb": 0, "obp": 0.316, "slg": 0.408, "ops": 0.723, "war": 2.1 },
      { "name": "Hunter Goodman", "team": "COL", "pos": "C", "gp": 88, "ab": 334, "r": 48, "h": 93, "avg": 0.278, "2b": 18, "3b": 4, "hr": 18, "rbi": 56, "tb": 173, "bb": 20, "k": 97, "sb": 1, "obp": 0.324, "slg": 0.518, "ops": 0.842, "war": 2.1 },
      { "name": "Trevor Story", "team": "BOS", "pos": "SS", "gp": 98, "ab": 377, "r": 51, "h": 95, "avg": 0.252, "2b": 13, "3b": 0, "hr": 15, "rbi": 59, "tb": 153, "bb": 19, "k": 111, "sb": 17, "obp": 0.293, "slg": 0.406, "ops": 0.699, "war": 2 },
      { "name": "Javier Baez", "team": "DET", "pos": "CF", "gp": 81, "ab": 274, "r": 42, "h": 75, "avg": 0.274, "2b": 13, "3b": 1, "hr": 10, "rbi": 39, "tb": 120, "bb": 9, "k": 65, "sb": 3, "obp": 0.308, "slg": 0.438, "ops": 0.746, "war": 2 },
      { "name": "Seiya Suzuki", "team": "CHC", "pos": "RF", "gp": 96, "ab": 384, "r": 54, "h": 99, "avg": 0.258, "2b": 24, "3b": 3, "hr": 26, "rbi": 80, "tb": 207, "bb": 34, "k": 112, "sb": 2, "obp": 0.314, "slg": 0.539, "ops": 0.853, "war": 2 },
      { "name": "Xavier Edwards", "team": "MIA", "pos": "SS", "gp": 83, "ab": 336, "r": 44, "h": 99, "avg": 0.295, "2b": 16, "3b": 2, "hr": 1, "rbi": 26, "tb": 122, "bb": 33, "k": 52, "sb": 17, "obp": 0.358, "slg": 0.363, "ops": 0.721, "war": 2 },
      { "name": "Cam Smith", "team": "HOU", "pos": "RF", "gp": 86, "ab": 312, "r": 39, "h": 84, "avg": 0.269, "2b": 17, "3b": 2, "hr": 7, "rbi": 42, "tb": 126, "bb": 27, "k": 95, "sb": 5, "obp": 0.335, "slg": 0.404, "ops": 0.739, "war": 2 },
      { "name": "William Contreras", "team": "MIL", "pos": "C", "gp": 94, "ab": 348, "r": 50, "h": 85, "avg": 0.244, "2b": 18, "3b": 0, "hr": 6, "rbi": 40, "tb": 121, "bb": 56, "k": 76, "sb": 5, "obp": 0.347, "slg": 0.348, "ops": 0.695, "war": 2 },
      { "name": "Brent Rooker", "team": "ATH", "pos": "RF", "gp": 102, "ab": 396, "r": 63, "h": 109, "avg": 0.275, "2b": 23, "3b": 3, "hr": 21, "rbi": 56, "tb": 201, "bb": 44, "k": 99, "sb": 3, "obp": 0.351, "slg": 0.508, "ops": 0.858, "war": 1.9 },
      { "name": "Junior Caminero", "team": "TB", "pos": "3B", "gp": 95, "ab": 374, "r": 57, "h": 97, "avg": 0.259, "2b": 20, "3b": 0, "hr": 25, "rbi": 65, "tb": 192, "bb": 22, "k": 81, "sb": 5, "obp": 0.299, "slg": 0.513, "ops": 0.812, "war": 1.9 },
      { "name": "Hyeseong Kim", "team": "LAD", "pos": "2B", "gp": 52, "ab": 122, "r": 17, "h": 39, "avg": 0.32, "2b": 6, "3b": 1, "hr": 2, "rbi": 13, "tb": 53, "bb": 6, "k": 32, "sb": 11, "obp": 0.357, "slg": 0.434, "ops": 0.791, "war": 1.9 },
      { "name": "Bo Bichette", "team": "TOR", "pos": "SS", "gp": 97, "ab": 408, "r": 47, "h": 115, "avg": 0.282, "2b": 28, "3b": 1, "hr": 12, "rbi": 57, "tb": 181, "bb": 23, "k": 70, "sb": 4, "obp": 0.323, "slg": 0.444, "ops": 0.767, "war": 1.9 },
      { "name": "Dillon Dingler", "team": "DET", "pos": "C", "gp": 75, "ab": 258, "r": 26, "h": 69, "avg": 0.267, "2b": 12, "3b": 1, "hr": 8, "rbi": 36, "tb": 107, "bb": 10, "k": 65, "sb": 0, "obp": 0.312, "slg": 0.415, "ops": 0.726, "war": 1.8 },
      { "name": "Lawrence Butler", "team": "ATH", "pos": "RF", "gp": 97, "ab": 380, "r": 55, "h": 92, "avg": 0.242, "2b": 24, "3b": 2, "hr": 13, "rbi": 40, "tb": 159, "bb": 41, "k": 118, "sb": 16, "obp": 0.316, "slg": 0.418, "ops": 0.734, "war": 1.8 },
      { "name": "Brett Baty", "team": "NYM", "pos": "3B", "gp": 79, "ab": 232, "r": 26, "h": 55, "avg": 0.237, "2b": 8, "3b": 2, "hr": 11, "rbi": 33, "tb": 100, "bb": 19, "k": 62, "sb": 5, "obp": 0.295, "slg": 0.431, "ops": 0.726, "war": 1.8 },
      { "name": "Isaac Collins", "team": "MIL", "pos": "LF", "gp": 80, "ab": 208, "r": 34, "h": 56, "avg": 0.269, "2b": 8, "3b": 1, "hr": 6, "rbi": 27, "tb": 84, "bb": 32, "k": 57, "sb": 11, "obp": 0.373, "slg": 0.404, "ops": 0.777, "war": 1.8 },
      { "name": "Yandy Diaz", "team": "TB", "pos": "1B", "gp": 95, "ab": 382, "r": 49, "h": 112, "avg": 0.293, "2b": 19, "3b": 1, "hr": 16, "rbi": 58, "tb": 181, "bb": 34, "k": 56, "sb": 3, "obp": 0.352, "slg": 0.474, "ops": 0.826, "war": 1.8 },
      { "name": "Christian Yelich", "team": "MIL", "pos": "LF", "gp": 94, "ab": 356, "r": 51, "h": 93, "avg": 0.261, "2b": 11, "3b": 0, "hr": 19, "rbi": 66, "tb": 161, "bb": 37, "k": 106, "sb": 15, "obp": 0.338, "slg": 0.452, "ops": 0.791, "war": 1.8 },
      { "name": "Taylor Ward", "team": "LAA", "pos": "LF", "gp": 98, "ab": 378, "r": 56, "h": 88, "avg": 0.233, "2b": 25, "3b": 2, "hr": 23, "rbi": 76, "tb": 186, "bb": 40, "k": 114, "sb": 2, "obp": 0.305, "slg": 0.492, "ops": 0.797, "war": 1.8 },
      { "name": "Mauricio Dubon", "team": "HOU", "pos": "2B", "gp": 76, "ab": 215, "r": 27, "h": 55, "avg": 0.256, "2b": 14, "3b": 0, "hr": 6, "rbi": 20, "tb": 87, "bb": 13, "k": 24, "sb": 2, "obp": 0.297, "slg": 0.405, "ops": 0.702, "war": 1.8 },
      { "name": "Alejandro Kirk", "team": "TOR", "pos": "C", "gp": 84, "ab": 298, "r": 27, "h": 92, "avg": 0.309, "2b": 11, "3b": 0, "hr": 7, "rbi": 46, "tb": 124, "bb": 28, "k": 31, "sb": 0, "obp": 0.366, "slg": 0.416, "ops": 0.782, "war": 1.8 },
      { "name": "George Springer", "team": "TOR", "pos": "RF", "gp": 94, "ab": 315, "r": 56, "h": 87, "avg": 0.276, "2b": 17, "3b": 1, "hr": 17, "rbi": 54, "tb": 157, "bb": 46, "k": 72, "sb": 12, "obp": 0.368, "slg": 0.498, "ops": 0.866, "war": 1.7 },
      { "name": "Victor Scott II", "team": "STL", "pos": "CF", "gp": 94, "ab": 295, "r": 42, "h": 69, "avg": 0.234, "2b": 11, "3b": 1, "hr": 5, "rbi": 33, "tb": 97, "bb": 28, "k": 89, "sb": 25, "obp": 0.315, "slg": 0.329, "ops": 0.644, "war": 1.7 },
      { "name": "Ryan O'Hearn", "team": "BAL", "pos": "1B", "gp": 86, "ab": 288, "r": 40, "h": 80, "avg": 0.278, "2b": 14, "3b": 0, "hr": 12, "rbi": 36, "tb": 130, "bb": 40, "k": 56, "sb": 3, "obp": 0.373, "slg": 0.451, "ops": 0.825, "war": 1.7 },
      { "name": "Addison Barger", "team": "TOR", "pos": "3B", "gp": 76, "ab": 258, "r": 41, "h": 70, "avg": 0.271, "2b": 22, "3b": 0, "hr": 14, "rbi": 42, "tb": 134, "bb": 19, "k": 67, "sb": 3, "obp": 0.324, "slg": 0.519, "ops": 0.843, "war": 1.7 },
      { "name": "Willson Contreras", "team": "STL", "pos": "1B", "gp": 95, "ab": 351, "r": 48, "h": 90, "avg": 0.256, "2b": 24, "3b": 0, "hr": 13, "rbi": 57, "tb": 153, "bb": 32, "k": 100, "sb": 4, "obp": 0.341, "slg": 0.436, "ops": 0.777, "war": 1.7 },
      { "name": "Jackson Chourio", "team": "MIL", "pos": "CF", "gp": 99, "ab": 419, "r": 67, "h": 112, "avg": 0.267, "2b": 26, "3b": 3, "hr": 16, "rbi": 64, "tb": 192, "bb": 18, "k": 90, "sb": 17, "obp": 0.299, "slg": 0.458, "ops": 0.757, "war": 1.7 },
      { "name": "Xander Bogaerts", "team": "SD", "pos": "SS", "gp": 98, "ab": 347, "r": 42, "h": 93, "avg": 0.268, "2b": 21, "3b": 0, "hr": 6, "rbi": 35, "tb": 132, "bb": 43, "k": 63, "sb": 16, "obp": 0.346, "slg": 0.38, "ops": 0.726, "war": 1.7 },
      { "name": "Paul Goldschmidt", "team": "NYY", "pos": "1B", "gp": 94, "ab": 346, "r": 57, "h": 100, "avg": 0.289, "2b": 23, "3b": 1, "hr": 8, "rbi": 37, "tb": 149, "bb": 29, "k": 66, "sb": 5, "obp": 0.347, "slg": 0.431, "ops": 0.777, "war": 1.7 },
      { "name": "Jeff McNeil", "team": "NYM", "pos": "2B", "gp": 67, "ab": 208, "r": 22, "h": 53, "avg": 0.255, "2b": 8, "3b": 4, "hr": 9, "rbi": 32, "tb": 96, "bb": 28, "k": 27, "sb": 1, "obp": 0.352, "slg": 0.462, "ops": 0.814, "war": 1.6 },
      { "name": "Isiah Kiner-Falefa", "team": "PIT", "pos": "SS", "gp": 87, "ab": 288, "r": 27, "h": 79, "avg": 0.274, "2b": 12, "3b": 2, "hr": 1, "rbi": 24, "tb": 98, "bb": 15, "k": 51, "sb": 12, "obp": 0.318, "slg": 0.34, "ops": 0.658, "war": 1.6 },
      { "name": "Austin Riley", "team": "ATL", "pos": "3B", "gp": 93, "ab": 379, "r": 51, "h": 104, "avg": 0.274, "2b": 19, "3b": 1, "hr": 14, "rbi": 48, "tb": 167, "bb": 25, "k": 113, "sb": 2, "obp": 0.324, "slg": 0.441, "ops": 0.764, "war": 1.6 },
      { "name": "Freddie Freeman", "team": "LAD", "pos": "1B", "gp": 88, "ab": 329, "r": 47, "h": 96, "avg": 0.292, "2b": 27, "3b": 1, "hr": 10, "rbi": 49, "tb": 155, "bb": 35, "k": 85, "sb": 1, "obp": 0.364, "slg": 0.471, "ops": 0.835, "war": 1.6 },
      { "name": "Spencer Torkelson", "team": "DET", "pos": "1B", "gp": 95, "ab": 339, "r": 55, "h": 79, "avg": 0.233, "2b": 20, "3b": 0, "hr": 21, "rbi": 59, "tb": 162, "bb": 46, "k": 96, "sb": 1, "obp": 0.336, "slg": 0.478, "ops": 0.814, "war": 1.6 },
      { "name": "Tyler Soderstrom", "team": "ATH", "pos": "LF", "gp": 101, "ab": 365, "r": 51, "h": 94, "avg": 0.258, "2b": 14, "3b": 1, "hr": 18, "rbi": 57, "tb": 164, "bb": 37, "k": 96, "sb": 6, "obp": 0.333, "slg": 0.449, "ops": 0.782, "war": 1.6 },
      { "name": "Evan Carter", "team": "TEX", "pos": "CF", "gp": 45, "ab": 139, "r": 24, "h": 36, "avg": 0.259, "2b": 7, "3b": 1, "hr": 4, "rbi": 18, "tb": 57, "bb": 16, "k": 30, "sb": 12, "obp": 0.348, "slg": 0.41, "ops": 0.758, "war": 1.5 },
      { "name": "Ian Happ", "team": "CHC", "pos": "LF", "gp": 90, "ab": 363, "r": 55, "h": 83, "avg": 0.229, "2b": 16, "3b": 0, "hr": 13, "rbi": 48, "tb": 138, "bb": 51, "k": 93, "sb": 4, "obp": 0.323, "slg": 0.38, "ops": 0.703, "war": 1.5 },
      { "name": "Tyler Heineman", "team": "TOR", "pos": "C", "gp": 35, "ab": 85, "r": 19, "h": 29, "avg": 0.341, "2b": 6, "3b": 0, "hr": 3, "rbi": 16, "tb": 44, "bb": 6, "k": 19, "sb": 2, "obp": 0.396, "slg": 0.518, "ops": 0.913, "war": 1.5 },
      { "name": "Nolan Schanuel", "team": "LAA", "pos": "1B", "gp": 96, "ab": 355, "r": 48, "h": 96, "avg": 0.27, "2b": 17, "3b": 1, "hr": 8, "rbi": 40, "tb": 139, "bb": 45, "k": 49, "sb": 4, "obp": 0.362, "slg": 0.392, "ops": 0.753, "war": 1.5 },
      { "name": "Adley Rutschman", "team": "BAL", "pos": "C", "gp": 68, "ab": 242, "r": 31, "h": 55, "avg": 0.227, "2b": 9, "3b": 1, "hr": 8, "rbi": 20, "tb": 90, "bb": 32, "k": 45, "sb": 0, "obp": 0.319, "slg": 0.372, "ops": 0.691, "war": 1.4 },
      { "name": "Jose Caballero", "team": "TB", "pos": "SS", "gp": 78, "ab": 216, "r": 32, "h": 47, "avg": 0.218, "2b": 12, "3b": 1, "hr": 2, "rbi": 24, "tb": 67, "bb": 28, "k": 76, "sb": 32, "obp": 0.315, "slg": 0.31, "ops": 0.625, "war": 1.4 },
      { "name": "Carlos Santana", "team": "CLE", "pos": "1B", "gp": 93, "ab": 325, "r": 43, "h": 75, "avg": 0.231, "2b": 7, "3b": 0, "hr": 11, "rbi": 43, "tb": 115, "bb": 45, "k": 70, "sb": 6, "obp": 0.326, "slg": 0.354, "ops": 0.68, "war": 1.4 },
      { "name": "Mike Tauchman", "team": "CHW", "pos": "RF", "gp": 48, "ab": 171, "r": 24, "h": 48, "avg": 0.281, "2b": 12, "3b": 1, "hr": 5, "rbi": 25, "tb": 77, "bb": 24, "k": 46, "sb": 0, "obp": 0.374, "slg": 0.45, "ops": 0.824, "war": 1.4 },
      { "name": "Jackson Merrill", "team": "SD", "pos": "CF", "gp": 67, "ab": 255, "r": 35, "h": 66, "avg": 0.259, "2b": 12, "3b": 2, "hr": 7, "rbi": 33, "tb": 103, "bb": 23, "k": 60, "sb": 1, "obp": 0.324, "slg": 0.404, "ops": 0.728, "war": 1.4 },
      { "name": "Ryan McMahon", "team": "COL", "pos": "3B", "gp": 98, "ab": 344, "r": 39, "h": 75, "avg": 0.218, "2b": 15, "3b": 1, "hr": 15, "rbi": 32, "tb": 137, "bb": 47, "k": 124, "sb": 2, "obp": 0.313, "slg": 0.398, "ops": 0.711, "war": 1.4 },
      { "name": "J.T. Realmuto", "team": "PHI", "pos": "C", "gp": 82, "ab": 311, "r": 36, "h": 84, "avg": 0.27, "2b": 18, "3b": 1, "hr": 5, "rbi": 33, "tb": 119, "bb": 23, "k": 81, "sb": 6, "obp": 0.324, "slg": 0.383, "ops": 0.707, "war": 1.4 },
      { "name": "Miguel Vargas", "team": "CHW", "pos": "3B", "gp": 97, "ab": 355, "r": 51, "h": 79, "avg": 0.223, "2b": 25, "3b": 2, "hr": 12, "rbi": 40, "tb": 144, "bb": 38, "k": 68, "sb": 4, "obp": 0.305, "slg": 0.406, "ops": 0.711, "war": 1.4 },
      { "name": "Anthony Volpe", "team": "NYY", "pos": "SS", "gp": 99, "ab": 355, "r": 42, "h": 76, "avg": 0.214, "2b": 22, "3b": 3, "hr": 12, "rbi": 53, "tb": 140, "bb": 35, "k": 94, "sb": 10, "obp": 0.286, "slg": 0.394, "ops": 0.68, "war": 1.3 },
      { "name": "Austin Hays", "team": "CIN", "pos": "LF", "gp": 51, "ab": 190, "r": 35, "h": 54, "avg": 0.284, "2b": 9, "3b": 4, "hr": 10, "rbi": 40, "tb": 101, "bb": 16, "k": 52, "sb": 2, "obp": 0.338, "slg": 0.532, "ops": 0.87, "war": 1.3 },
      { "name": "Jake Cronenworth", "team": "SD", "pos": "2B", "gp": 75, "ab": 239, "r": 31, "h": 58, "avg": 0.243, "2b": 13, "3b": 1, "hr": 8, "rbi": 31, "tb": 97, "bb": 37, "k": 59, "sb": 2, "obp": 0.351, "slg": 0.406, "ops": 0.757, "war": 1.3 },
      { "name": "Max Schuemann", "team": "ATH", "pos": "3B", "gp": 68, "ab": 101, "r": 14, "h": 25, "avg": 0.248, "2b": 1, "3b": 2, "hr": 2, "rbi": 6, "tb": 36, "bb": 16, "k": 19, "sb": 6, "obp": 0.358, "slg": 0.356, "ops": 0.715, "war": 1.3 },
      { "name": "Myles Straw", "team": "TOR", "pos": "CF", "gp": 82, "ab": 176, "r": 29, "h": 43, "avg": 0.244, "2b": 9, "3b": 0, "hr": 1, "rbi": 16, "tb": 55, "bb": 11, "k": 29, "sb": 7, "obp": 0.291, "slg": 0.313, "ops": 0.604, "war": 1.3 },
      { "name": "Nathan Lukes", "team": "TOR", "pos": "RF", "gp": 74, "ab": 193, "r": 28, "h": 52, "avg": 0.269, "2b": 7, "3b": 0, "hr": 5, "rbi": 33, "tb": 74, "bb": 26, "k": 29, "sb": 1, "obp": 0.36, "slg": 0.383, "ops": 0.744, "war": 1.3 },
      { "name": "Tommy Edman", "team": "LAD", "pos": "2B", "gp": 79, "ab": 278, "r": 41, "h": 62, "avg": 0.223, "2b": 13, "3b": 1, "hr": 11, "rbi": 40, "tb": 110, "bb": 17, "k": 53, "sb": 3, "obp": 0.276, "slg": 0.396, "ops": 0.672, "war": 1.3 },
      { "name": "Ben Williamson", "team": "SEA", "pos": "3B", "gp": 76, "ab": 251, "r": 35, "h": 65, "avg": 0.259, "2b": 12, "3b": 0, "hr": 1, "rbi": 19, "tb": 80, "bb": 11, "k": 61, "sb": 3, "obp": 0.293, "slg": 0.319, "ops": 0.612, "war": 1.3 },
      { "name": "Roman Anthony", "team": "BOS", "pos": "RF", "gp": 35, "ab": 121, "r": 20, "h": 32, "avg": 0.264, "2b": 11, "3b": 0, "hr": 2, "rbi": 14, "tb": 49, "bb": 18, "k": 35, "sb": 2, "obp": 0.373, "slg": 0.405, "ops": 0.778, "war": 1.3 },
      { "name": "Nolan Arenado", "team": "STL", "pos": "3B", "gp": 88, "ab": 332, "r": 41, "h": 81, "avg": 0.244, "2b": 15, "3b": 1, "hr": 10, "rbi": 42, "tb": 128, "bb": 26, "k": 35, "sb": 2, "obp": 0.303, "slg": 0.386, "ops": 0.689, "war": 1.2 },
      { "name": "Liam Hicks", "team": "MIA", "pos": "C", "gp": 68, "ab": 179, "r": 19, "h": 50, "avg": 0.279, "2b": 9, "3b": 1, "hr": 4, "rbi": 30, "tb": 73, "bb": 23, "k": 31, "sb": 0, "obp": 0.37, "slg": 0.408, "ops": 0.778, "war": 1.2 },
      { "name": "Freddy Fermin", "team": "KC", "pos": "C", "gp": 60, "ab": 171, "r": 15, "h": 45, "avg": 0.263, "2b": 7, "3b": 0, "hr": 2, "rbi": 8, "tb": 58, "bb": 12, "k": 33, "sb": 0, "obp": 0.319, "slg": 0.339, "ops": 0.658, "war": 1.2 },
      { "name": "Alec Burleson", "team": "STL", "pos": "1B", "gp": 89, "ab": 304, "r": 32, "h": 88, "avg": 0.289, "2b": 17, "3b": 0, "hr": 12, "rbi": 44, "tb": 141, "bb": 23, "k": 44, "sb": 4, "obp": 0.336, "slg": 0.464, "ops": 0.8, "war": 1.2 },
      { "name": "Jung Hoo Lee", "team": "SF", "pos": "CF", "gp": 96, "ab": 362, "r": 50, "h": 90, "avg": 0.249, "2b": 20, "3b": 8, "hr": 6, "rbi": 41, "tb": 144, "bb": 32, "k": 45, "sb": 6, "obp": 0.313, "slg": 0.398, "ops": 0.711, "war": 1.2 },
      { "name": "Vinnie Pasquantino", "team": "KC", "pos": "1B", "gp": 100, "ab": 387, "r": 38, "h": 102, "avg": 0.264, "2b": 14, "3b": 1, "hr": 15, "rbi": 57, "tb": 163, "bb": 29, "k": 72, "sb": 1, "obp": 0.322, "slg": 0.421, "ops": 0.743, "war": 1.2 },
      { "name": "Colton Cowser", "team": "BAL", "pos": "LF", "gp": 41, "ab": 151, "r": 15, "h": 34, "avg": 0.225, "2b": 7, "3b": 0, "hr": 8, "rbi": 18, "tb": 65, "bb": 7, "k": 49, "sb": 5, "obp": 0.282, "slg": 0.43, "ops": 0.713, "war": 1.2 },
      { "name": "Brandon Lowe", "team": "TB", "pos": "2B", "gp": 86, "ab": 323, "r": 55, "h": 87, "avg": 0.269, "2b": 11, "3b": 0, "hr": 19, "rbi": 50, "tb": 155, "bb": 24, "k": 89, "sb": 3, "obp": 0.32, "slg": 0.48, "ops": 0.8, "war": 1.2 },
      { "name": "Josh Naylor", "team": "ARI", "pos": "1B", "gp": 91, "ab": 341, "r": 49, "h": 100, "avg": 0.293, "2b": 19, "3b": 1, "hr": 11, "rbi": 58, "tb": 154, "bb": 37, "k": 48, "sb": 11, "obp": 0.362, "slg": 0.452, "ops": 0.814, "war": 1.2 },
      { "name": "Willy Adames", "team": "SF", "pos": "SS", "gp": 100, "ab": 370, "r": 57, "h": 85, "avg": 0.23, "2b": 16, "3b": 2, "hr": 15, "rbi": 52, "tb": 150, "bb": 45, "k": 112, "sb": 4, "obp": 0.312, "slg": 0.405, "ops": 0.717, "war": 1.1 },
      { "name": "Jordan Westburg", "team": "BAL", "pos": "3B", "gp": 48, "ab": 183, "r": 32, "h": 48, "avg": 0.262, "2b": 6, "3b": 1, "hr": 10, "rbi": 21, "tb": 86, "bb": 10, "k": 48, "sb": 1, "obp": 0.311, "slg": 0.47, "ops": 0.781, "war": 1.1 },
      { "name": "Lars Nootbaar", "team": "STL", "pos": "LF", "gp": 88, "ab": 331, "r": 50, "h": 75, "avg": 0.227, "2b": 15, "3b": 0, "hr": 12, "rbi": 37, "tb": 126, "bb": 48, "k": 83, "sb": 4, "obp": 0.332, "slg": 0.381, "ops": 0.712, "war": 1.1 },
      { "name": "Jorge Polanco", "team": "SEA", "pos": "2B", "gp": 81, "ab": 277, "r": 35, "h": 71, "avg": 0.256, "2b": 13, "3b": 0, "hr": 15, "rbi": 46, "tb": 129, "bb": 21, "k": 43, "sb": 3, "obp": 0.313, "slg": 0.466, "ops": 0.778, "war": 1.1 },
      { "name": "Tyler Fitzgerald", "team": "SF", "pos": "2B", "gp": 63, "ab": 198, "r": 18, "h": 45, "avg": 0.227, "2b": 10, "3b": 1, "hr": 3, "rbi": 13, "tb": 66, "bb": 15, "k": 62, "sb": 9, "obp": 0.287, "slg": 0.333, "ops": 0.62, "war": 1.1 },
      { "name": "Matt Shaw", "team": "CHC", "pos": "3B", "gp": 67, "ab": 218, "r": 30, "h": 47, "avg": 0.216, "2b": 11, "3b": 0, "hr": 4, "rbi": 19, "tb": 70, "bb": 21, "k": 45, "sb": 12, "obp": 0.288, "slg": 0.321, "ops": 0.609, "war": 1.1 },
      { "name": "Heliot Ramos", "team": "SF", "pos": "LF", "gp": 99, "ab": 381, "r": 51, "h": 101, "avg": 0.265, "2b": 18, "3b": 1, "hr": 14, "rbi": 49, "tb": 163, "bb": 33, "k": 103, "sb": 5, "obp": 0.339, "slg": 0.428, "ops": 0.767, "war": 1.1 },
      { "name": "Edmundo Sosa", "team": "PHI", "pos": "2B", "gp": 52, "ab": 139, "r": 15, "h": 38, "avg": 0.273, "2b": 8, "3b": 1, "hr": 3, "rbi": 22, "tb": 57, "bb": 8, "k": 32, "sb": 0, "obp": 0.32, "slg": 0.41, "ops": 0.73, "war": 1.1 },
      { "name": "Colt Keith", "team": "DET", "pos": "2B", "gp": 89, "ab": 266, "r": 43, "h": 68, "avg": 0.256, "2b": 16, "3b": 2, "hr": 8, "rbi": 30, "tb": 112, "bb": 36, "k": 63, "sb": 0, "obp": 0.343, "slg": 0.421, "ops": 0.764, "war": 1.1 },
      { "name": "Nick Allen", "team": "ATL", "pos": "SS", "gp": 90, "ab": 262, "r": 25, "h": 62, "avg": 0.237, "2b": 8, "3b": 0, "hr": 0, "rbi": 18, "tb": 70, "bb": 24, "k": 66, "sb": 6, "obp": 0.305, "slg": 0.267, "ops": 0.572, "war": 1.1 },
      { "name": "Marcell Ozuna", "team": "ATL", "pos": "DH", "gp": 92, "ab": 323, "r": 37, "h": 76, "avg": 0.235, "2b": 11, "3b": 0, "hr": 13, "rbi": 42, "tb": 126, "bb": 64, "k": 89, "sb": 0, "obp": 0.361, "slg": 0.39, "ops": 0.751, "war": 1.1 },
      { "name": "Rhys Hoskins", "team": "MIL", "pos": "1B", "gp": 82, "ab": 269, "r": 30, "h": 65, "avg": 0.242, "2b": 12, "3b": 1, "hr": 12, "rbi": 42, "tb": 115, "bb": 38, "k": 85, "sb": 2, "obp": 0.34, "slg": 0.428, "ops": 0.767, "war": 1.1 },
      { "name": "Oneil Cruz", "team": "PIT", "pos": "CF", "gp": 89, "ab": 322, "r": 49, "h": 68, "avg": 0.211, "2b": 12, "3b": 2, "hr": 16, "rbi": 39, "tb": 132, "bb": 47, "k": 122, "sb": 30, "obp": 0.314, "slg": 0.41, "ops": 0.724, "war": 1.1 },
      { "name": "Andres Gimenez", "team": "TOR", "pos": "2B", "gp": 61, "ab": 211, "r": 26, "h": 46, "avg": 0.218, "2b": 7, "3b": 0, "hr": 5, "rbi": 23, "tb": 68, "bb": 16, "k": 39, "sb": 10, "obp": 0.3, "slg": 0.322, "ops": 0.622, "war": 1 },
      { "name": "Kody Clemens", "team": "MIN", "pos": "2B", "gp": 65, "ab": 163, "r": 25, "h": 36, "avg": 0.221, "2b": 6, "3b": 3, "hr": 12, "rbi": 31, "tb": 84, "bb": 14, "k": 45, "sb": 0, "obp": 0.295, "slg": 0.515, "ops": 0.81, "war": 1 },
      { "name": "Daniel Schneemann", "team": "CLE", "pos": "2B", "gp": 80, "ab": 222, "r": 28, "h": 47, "avg": 0.212, "2b": 10, "3b": 0, "hr": 9, "rbi": 26, "tb": 84, "bb": 25, "k": 62, "sb": 6, "obp": 0.294, "slg": 0.378, "ops": 0.673, "war": 1 },
      { "name": "Rob Refsnyder", "team": "BOS", "pos": "RF", "gp": 43, "ab": 110, "r": 18, "h": 30, "avg": 0.273, "2b": 8, "3b": 0, "hr": 5, "rbi": 16, "tb": 53, "bb": 15, "k": 35, "sb": 3, "obp": 0.359, "slg": 0.482, "ops": 0.841, "war": 1 },
      { "name": "Romy Gonzalez", "team": "BOS", "pos": "1B", "gp": 47, "ab": 150, "r": 26, "h": 46, "avg": 0.307, "2b": 15, "3b": 3, "hr": 5, "rbi": 28, "tb": 82, "bb": 9, "k": 39, "sb": 4, "obp": 0.344, "slg": 0.547, "ops": 0.89, "war": 1 },
      { "name": "Denzel Clarke", "team": "ATH", "pos": "CF", "gp": 47, "ab": 148, "r": 18, "h": 34, "avg": 0.23, "2b": 8, "3b": 2, "hr": 3, "rbi": 8, "tb": 55, "bb": 6, "k": 61, "sb": 6, "obp": 0.274, "slg": 0.372, "ops": 0.646, "war": 1 },
      { "name": "Chase Meidroth", "team": "CHW", "pos": "SS", "gp": 75, "ab": 279, "r": 31, "h": 70, "avg": 0.251, "2b": 11, "3b": 0, "hr": 2, "rbi": 12, "tb": 87, "bb": 32, "k": 42, "sb": 11, "obp": 0.333, "slg": 0.312, "ops": 0.645, "war": 1 },
      { "name": "Victor Caratini", "team": "HOU", "pos": "C", "gp": 70, "ab": 232, "r": 26, "h": 63, "avg": 0.272, "2b": 10, "3b": 0, "hr": 10, "rbi": 36, "tb": 103, "bb": 13, "k": 43, "sb": 1, "obp": 0.32, "slg": 0.444, "ops": 0.764, "war": 1 },
      { "name": "Ke'Bryan Hayes", "team": "PIT", "pos": "3B", "gp": 93, "ab": 341, "r": 32, "h": 82, "avg": 0.24, "2b": 9, "3b": 2, "hr": 2, "rbi": 33, "tb": 101, "bb": 18, "k": 76, "sb": 10, "obp": 0.287, "slg": 0.296, "ops": 0.583, "war": 1 },
      { "name": "Alex Call", "team": "WSH", "pos": "RF", "gp": 68, "ab": 182, "r": 28, "h": 50, "avg": 0.275, "2b": 9, "3b": 2, "hr": 2, "rbi": 21, "tb": 69, "bb": 25, "k": 32, "sb": 1, "obp": 0.375, "slg": 0.379, "ops": 0.754, "war": 1 },
      { "name": "Christian Koss", "team": "SF", "pos": "2B", "gp": 41, "ab": 98, "r": 12, "h": 26, "avg": 0.265, "2b": 3, "3b": 0, "hr": 2, "rbi": 12, "tb": 35, "bb": 5, "k": 25, "sb": 2, "obp": 0.305, "slg": 0.357, "ops": 0.662, "war": 1 },
      { "name": "Edgar Quero", "team": "CHW", "pos": "C", "gp": 63, "ab": 194, "r": 14, "h": 52, "avg": 0.268, "2b": 11, "3b": 0, "hr": 2, "rbi": 21, "tb": 69, "bb": 22, "k": 38, "sb": 0, "obp": 0.35, "slg": 0.356, "ops": 0.706, "war": 1 },
      { "name": "Ramon Urias", "team": "BAL", "pos": "3B", "gp": 70, "ab": 234, "r": 24, "h": 57, "avg": 0.244, "2b": 11, "3b": 0, "hr": 6, "rbi": 29, "tb": 86, "bb": 18, "k": 55, "sb": 2, "obp": 0.294, "slg": 0.368, "ops": 0.661, "war": 1 },
      { "name": "Ivan Herrera", "team": "STL", "pos": "C", "gp": 47, "ab": 171, "r": 22, "h": 53, "avg": 0.31, "2b": 8, "3b": 0, "hr": 8, "rbi": 37, "tb": 85, "bb": 17, "k": 39, "sb": 3, "obp": 0.378, "slg": 0.497, "ops": 0.875, "war": 1 },
      { "name": "Miguel Amaya", "team": "CHC", "pos": "C", "gp": 27, "ab": 93, "r": 14, "h": 26, "avg": 0.28, "2b": 9, "3b": 0, "hr": 4, "rbi": 25, "tb": 47, "bb": 4, "k": 22, "sb": 0, "obp": 0.313, "slg": 0.505, "ops": 0.819, "war": 1 },
      { "name": "Jo Adell", "team": "LAA", "pos": "CF", "gp": 93, "ab": 309, "r": 38, "h": 75, "avg": 0.243, "2b": 13, "3b": 0, "hr": 21, "rbi": 58, "tb": 151, "bb": 23, "k": 83, "sb": 3, "obp": 0.313, "slg": 0.489, "ops": 0.802, "war": 1 },
      { "name": "Dominic Canzone", "team": "SEA", "pos": "RF", "gp": 33, "ab": 103, "r": 12, "h": 32, "avg": 0.311, "2b": 6, "3b": 0, "hr": 6, "rbi": 12, "tb": 56, "bb": 4, "k": 21, "sb": 1, "obp": 0.343, "slg": 0.544, "ops": 0.886, "war": 1 },
      { "name": "Jacob Young", "team": "WSH", "pos": "CF", "gp": 75, "ab": 213, "r": 23, "h": 53, "avg": 0.249, "2b": 7, "3b": 1, "hr": 0, "rbi": 17, "tb": 62, "bb": 18, "k": 32, "sb": 10, "obp": 0.313, "slg": 0.291, "ops": 0.604, "war": 0.9 },
      { "name": "Mike Trout", "team": "LAA", "pos": "RF", "gp": 74, "ab": 260, "r": 39, "h": 62, "avg": 0.238, "2b": 6, "3b": 1, "hr": 17, "rbi": 44, "tb": 121, "bb": 50, "k": 89, "sb": 2, "obp": 0.364, "slg": 0.465, "ops": 0.829, "war": 0.9 },
      { "name": "Jake Fraley", "team": "CIN", "pos": "RF", "gp": 52, "ab": 134, "r": 25, "h": 34, "avg": 0.254, "2b": 7, "3b": 0, "hr": 5, "rbi": 20, "tb": 56, "bb": 21, "k": 29, "sb": 4, "obp": 0.359, "slg": 0.418, "ops": 0.777, "war": 0.9 },
      { "name": "Luis Torrens", "team": "NYM", "pos": "C", "gp": 66, "ab": 186, "r": 9, "h": 41, "avg": 0.22, "2b": 10, "3b": 1, "hr": 2, "rbi": 16, "tb": 59, "bb": 17, "k": 46, "sb": 0, "obp": 0.289, "slg": 0.317, "ops": 0.606, "war": 0.9 },
      { "name": "Willi Castro", "team": "MIN", "pos": "LF", "gp": 78, "ab": 271, "r": 45, "h": 70, "avg": 0.258, "2b": 14, "3b": 2, "hr": 10, "rbi": 27, "tb": 118, "bb": 31, "k": 75, "sb": 8, "obp": 0.35, "slg": 0.435, "ops": 0.785, "war": 0.9 },
      { "name": "Austin Wynns", "team": "CIN", "pos": "C", "gp": 37, "ab": 93, "r": 11, "h": 26, "avg": 0.28, "2b": 6, "3b": 0, "hr": 6, "rbi": 21, "tb": 50, "bb": 5, "k": 28, "sb": 0, "obp": 0.313, "slg": 0.538, "ops": 0.851, "war": 0.9 },
      { "name": "Alec Bohm", "team": "PHI", "pos": "3B", "gp": 92, "ab": 353, "r": 39, "h": 98, "avg": 0.278, "2b": 12, "3b": 2, "hr": 8, "rbi": 42, "tb": 138, "bb": 22, "k": 62, "sb": 2, "obp": 0.324, "slg": 0.391, "ops": 0.715, "war": 0.9 },
      { "name": "Gabriel Arias", "team": "CLE", "pos": "SS", "gp": 77, "ab": 255, "r": 28, "h": 59, "avg": 0.231, "2b": 17, "3b": 0, "hr": 6, "rbi": 31, "tb": 94, "bb": 18, "k": 88, "sb": 3, "obp": 0.293, "slg": 0.369, "ops": 0.661, "war": 0.9 },
      { "name": "Cole Young", "team": "SEA", "pos": "2B", "gp": 38, "ab": 126, "r": 14, "h": 32, "avg": 0.254, "2b": 5, "3b": 0, "hr": 2, "rbi": 12, "tb": 43, "bb": 10, "k": 30, "sb": 0, "obp": 0.317, "slg": 0.341, "ops": 0.658, "war": 0.9 },
      { "name": "Josh Lowe", "team": "TB", "pos": "RF", "gp": 55, "ab": 201, "r": 32, "h": 48, "avg": 0.239, "2b": 12, "3b": 0, "hr": 6, "rbi": 22, "tb": 78, "bb": 20, "k": 45, "sb": 6, "obp": 0.309, "slg": 0.388, "ops": 0.697, "war": 0.9 },
      { "name": "Daulton Varsho", "team": "TOR", "pos": "CF", "gp": 24, "ab": 92, "r": 14, "h": 19, "avg": 0.207, "2b": 5, "3b": 1, "hr": 8, "rbi": 20, "tb": 50, "bb": 5, "k": 31, "sb": 1, "obp": 0.24, "slg": 0.543, "ops": 0.783, "war": 0.9 },
      { "name": "Ben Rice", "team": "NYY", "pos": "1B", "gp": 82, "ab": 272, "r": 44, "h": 64, "avg": 0.235, "2b": 17, "3b": 2, "hr": 14, "rbi": 31, "tb": 127, "bb": 29, "k": 64, "sb": 3, "obp": 0.328, "slg": 0.467, "ops": 0.795, "war": 0.9 },
      { "name": "Jackson Holliday", "team": "BAL", "pos": "2B", "gp": 92, "ab": 365, "r": 43, "h": 95, "avg": 0.26, "2b": 14, "3b": 2, "hr": 13, "rbi": 39, "tb": 152, "bb": 21, "k": 95, "sb": 9, "obp": 0.309, "slg": 0.416, "ops": 0.726, "war": 0.9 },
      { "name": "Tyrone Taylor", "team": "NYM", "pos": "CF", "gp": 89, "ab": 256, "r": 25, "h": 54, "avg": 0.211, "2b": 13, "3b": 3, "hr": 2, "rbi": 17, "tb": 79, "bb": 11, "k": 65, "sb": 10, "obp": 0.264, "slg": 0.309, "ops": 0.572, "war": 0.8 },
      { "name": "Ozzie Albies", "team": "ATL", "pos": "2B", "gp": 99, "ab": 377, "r": 42, "h": 84, "avg": 0.223, "2b": 12, "3b": 1, "hr": 9, "rbi": 39, "tb": 125, "bb": 36, "k": 67, "sb": 8, "obp": 0.295, "slg": 0.332, "ops": 0.627, "war": 0.8 },
      { "name": "Jake Mangum", "team": "TB", "pos": "LF", "gp": 64, "ab": 226, "r": 24, "h": 68, "avg": 0.301, "2b": 10, "3b": 1, "hr": 2, "rbi": 28, "tb": 86, "bb": 13, "k": 31, "sb": 14, "obp": 0.342, "slg": 0.381, "ops": 0.722, "war": 0.8 },
      { "name": "Sam Haggerty", "team": "TEX", "pos": "CF", "gp": 47, "ab": 128, "r": 25, "h": 32, "avg": 0.25, "2b": 4, "3b": 3, "hr": 2, "rbi": 11, "tb": 48, "bb": 14, "k": 25, "sb": 9, "obp": 0.329, "slg": 0.375, "ops": 0.704, "war": 0.8 },
      { "name": "Pavin Smith", "team": "ARI", "pos": "1B", "gp": 79, "ab": 222, "r": 33, "h": 58, "avg": 0.261, "2b": 15, "3b": 1, "hr": 8, "rbi": 28, "tb": 99, "bb": 40, "k": 84, "sb": 2, "obp": 0.371, "slg": 0.446, "ops": 0.817, "war": 0.8 },
      { "name": "Francisco Alvarez", "team": "NYM", "pos": "C", "gp": 36, "ab": 125, "r": 12, "h": 30, "avg": 0.24, "2b": 4, "3b": 0, "hr": 3, "rbi": 11, "tb": 43, "bb": 15, "k": 38, "sb": 0, "obp": 0.331, "slg": 0.344, "ops": 0.675, "war": 0.8 },
      { "name": "Jordan Beck", "team": "COL", "pos": "LF", "gp": 88, "ab": 328, "r": 44, "h": 89, "avg": 0.271, "2b": 18, "3b": 5, "hr": 11, "rbi": 33, "tb": 150, "bb": 23, "k": 100, "sb": 11, "obp": 0.324, "slg": 0.457, "ops": 0.781, "war": 0.8 },
      { "name": "Yainer Diaz", "team": "HOU", "pos": "C", "gp": 87, "ab": 335, "r": 34, "h": 80, "avg": 0.239, "2b": 11, "3b": 1, "hr": 13, "rbi": 39, "tb": 132, "bb": 14, "k": 64, "sb": 1, "obp": 0.271, "slg": 0.394, "ops": 0.665, "war": 0.8 },
      { "name": "Kerry Carpenter", "team": "DET", "pos": "RF", "gp": 78, "ab": 265, "r": 40, "h": 68, "avg": 0.257, "2b": 11, "3b": 2, "hr": 16, "rbi": 32, "tb": 131, "bb": 7, "k": 60, "sb": 1, "obp": 0.285, "slg": 0.494, "ops": 0.78, "war": 0.8 },
      { "name": "Miguel Rojas", "team": "LAD", "pos": "2B", "gp": 60, "ab": 137, "r": 18, "h": 35, "avg": 0.255, "2b": 6, "3b": 0, "hr": 6, "rbi": 14, "tb": 59, "bb": 9, "k": 18, "sb": 1, "obp": 0.301, "slg": 0.431, "ops": 0.732, "war": 0.8 },
      { "name": "Ryan Jeffers", "team": "MIN", "pos": "C", "gp": 80, "ab": 263, "r": 31, "h": 69, "avg": 0.262, "2b": 19, "3b": 0, "hr": 7, "rbi": 34, "tb": 109, "bb": 34, "k": 52, "sb": 0, "obp": 0.358, "slg": 0.414, "ops": 0.772, "war": 0.8 },
      { "name": "Derek Hill", "team": "MIA", "pos": "CF", "gp": 33, "ab": 90, "r": 14, "h": 19, "avg": 0.211, "2b": 4, "3b": 0, "hr": 2, "rbi": 7, "tb": 29, "bb": 7, "k": 37, "sb": 6, "obp": 0.276, "slg": 0.322, "ops": 0.598, "war": 0.8 },
      { "name": "Matt Thaiss", "team": "TB", "pos": "C", "gp": 55, "ab": 144, "r": 15, "h": 32, "avg": 0.222, "2b": 5, "3b": 1, "hr": 1, "rbi": 16, "tb": 42, "bb": 28, "k": 41, "sb": 1, "obp": 0.354, "slg": 0.292, "ops": 0.646, "war": 0.8 },
      { "name": "Logan O'Hoppe", "team": "LAA", "pos": "C", "gp": 80, "ab": 292, "r": 29, "h": 69, "avg": 0.236, "2b": 4, "3b": 1, "hr": 18, "rbi": 38, "tb": 129, "bb": 14, "k": 100, "sb": 2, "obp": 0.275, "slg": 0.442, "ops": 0.717, "war": 0.8 },
      { "name": "Teoscar Hernandez", "team": "LAD", "pos": "RF", "gp": 81, "ab": 308, "r": 42, "h": 76, "avg": 0.247, "2b": 19, "3b": 0, "hr": 14, "rbi": 58, "tb": 137, "bb": 15, "k": 79, "sb": 5, "obp": 0.282, "slg": 0.445, "ops": 0.727, "war": 0.7 },
      { "name": "Colson Montgomery", "team": "CHW", "pos": "SS", "gp": 14, "ab": 42, "r": 3, "h": 11, "avg": 0.262, "2b": 1, "3b": 1, "hr": 0, "rbi": 6, "tb": 14, "bb": 6, "k": 14, "sb": 0, "obp": 0.354, "slg": 0.333, "ops": 0.687, "war": 0.7 },
      { "name": "Kyle Higashioka", "team": "TEX", "pos": "C", "gp": 55, "ab": 179, "r": 15, "h": 44, "avg": 0.246, "2b": 9, "3b": 0, "hr": 4, "rbi": 25, "tb": 65, "bb": 11, "k": 36, "sb": 3, "obp": 0.295, "slg": 0.363, "ops": 0.658, "war": 0.7 },
      { "name": "Dane Myers", "team": "MIA", "pos": "CF", "gp": 70, "ab": 216, "r": 22, "h": 57, "avg": 0.264, "2b": 8, "3b": 0, "hr": 4, "rbi": 23, "tb": 77, "bb": 13, "k": 51, "sb": 14, "obp": 0.31, "slg": 0.356, "ops": 0.667, "war": 0.7 },
      { "name": "Dylan Moore", "team": "SEA", "pos": "2B", "gp": 73, "ab": 175, "r": 27, "h": 36, "avg": 0.206, "2b": 4, "3b": 0, "hr": 9, "rbi": 19, "tb": 67, "bb": 15, "k": 65, "sb": 10, "obp": 0.266, "slg": 0.383, "ops": 0.648, "war": 0.7 },
      { "name": "Kyle Isbel", "team": "KC", "pos": "CF", "gp": 87, "ab": 240, "r": 27, "h": 62, "avg": 0.258, "2b": 10, "3b": 4, "hr": 3, "rbi": 18, "tb": 89, "bb": 10, "k": 49, "sb": 2, "obp": 0.285, "slg": 0.371, "ops": 0.655, "war": 0.7 },
      { "name": "Noelvi Marte", "team": "CIN", "pos": "3B", "gp": 32, "ab": 112, "r": 16, "h": 31, "avg": 0.277, "2b": 5, "3b": 1, "hr": 6, "rbi": 25, "tb": 56, "bb": 8, "k": 21, "sb": 5, "obp": 0.328, "slg": 0.5, "ops": 0.828, "war": 0.7 },
      { "name": "Tyler Stephenson", "team": "CIN", "pos": "C", "gp": 57, "ab": 202, "r": 25, "h": 47, "avg": 0.233, "2b": 12, "3b": 0, "hr": 7, "rbi": 30, "tb": 80, "bb": 25, "k": 81, "sb": 0, "obp": 0.313, "slg": 0.396, "ops": 0.709, "war": 0.7 },
      { "name": "Jasson Dominguez", "team": "NYY", "pos": "LF", "gp": 83, "ab": 284, "r": 43, "h": 72, "avg": 0.254, "2b": 15, "3b": 1, "hr": 8, "rbi": 34, "tb": 113, "bb": 33, "k": 93, "sb": 14, "obp": 0.329, "slg": 0.398, "ops": 0.727, "war": 0.7 },
      { "name": "Matt McLain", "team": "CIN", "pos": "2B", "gp": 91, "ab": 331, "r": 49, "h": 71, "avg": 0.215, "2b": 11, "3b": 0, "hr": 11, "rbi": 35, "tb": 115, "bb": 37, "k": 100, "sb": 14, "obp": 0.302, "slg": 0.347, "ops": 0.65, "war": 0.7 },
      { "name": "Ezequiel Tovar", "team": "COL", "pos": "SS", "gp": 35, "ab": 139, "r": 16, "h": 37, "avg": 0.266, "2b": 6, "3b": 2, "hr": 4, "rbi": 13, "tb": 59, "bb": 7, "k": 32, "sb": 2, "obp": 0.306, "slg": 0.424, "ops": 0.731, "war": 0.7 },
      { "name": "Jose Trevino", "team": "CIN", "pos": "C", "gp": 59, "ab": 180, "r": 22, "h": 48, "avg": 0.267, "2b": 17, "3b": 0, "hr": 4, "rbi": 14, "tb": 77, "bb": 12, "k": 23, "sb": 0, "obp": 0.309, "slg": 0.428, "ops": 0.737, "war": 0.7 },
      { "name": "Giancarlo Stanton", "team": "NYY", "pos": "DH", "gp": 25, "ab": 81, "r": 11, "h": 23, "avg": 0.284, "2b": 3, "3b": 0, "hr": 5, "rbi": 17, "tb": 41, "bb": 11, "k": 27, "sb": 0, "obp": 0.376, "slg": 0.506, "ops": 0.883, "war": 0.7 },
      { "name": "DJ LeMahieu", "team": "NYY", "pos": "2B", "gp": 45, "ab": 128, "r": 13, "h": 34, "avg": 0.266, "2b": 3, "3b": 0, "hr": 2, "rbi": 12, "tb": 43, "bb": 14, "k": 35, "sb": 0, "obp": 0.338, "slg": 0.336, "ops": 0.674, "war": 0.7 },
      { "name": "Starling Marte", "team": "NYM", "pos": "LF", "gp": 58, "ab": 163, "r": 22, "h": 44, "avg": 0.27, "2b": 7, "3b": 0, "hr": 4, "rbi": 20, "tb": 63, "bb": 14, "k": 33, "sb": 5, "obp": 0.353, "slg": 0.387, "ops": 0.739, "war": 0.7 },
      { "name": "James McCann", "team": "ARI", "pos": "C", "gp": 11, "ab": 31, "r": 7, "h": 11, "avg": 0.355, "2b": 2, "3b": 0, "hr": 2, "rbi": 5, "tb": 19, "bb": 7, "k": 8, "sb": 0, "obp": 0.487, "slg": 0.613, "ops": 1.1, "war": 0.7 },
      { "name": "Keibert Ruiz", "team": "WSH", "pos": "C", "gp": 68, "ab": 255, "r": 19, "h": 63, "avg": 0.247, "2b": 12, "3b": 0, "hr": 2, "rbi": 25, "tb": 81, "bb": 8, "k": 26, "sb": 0, "obp": 0.277, "slg": 0.318, "ops": 0.595, "war": 0.7 },
      { "name": "Blaze Alexander", "team": "ARI", "pos": "SS", "gp": 15, "ab": 33, "r": 6, "h": 9, "avg": 0.273, "2b": 4, "3b": 0, "hr": 0, "rbi": 3, "tb": 13, "bb": 3, "k": 10, "sb": 2, "obp": 0.368, "slg": 0.394, "ops": 0.762, "war": 0.7 },
      { "name": "Casey Schmitt", "team": "SF", "pos": "3B", "gp": 44, "ab": 130, "r": 14, "h": 32, "avg": 0.246, "2b": 5, "3b": 0, "hr": 4, "rbi": 16, "tb": 49, "bb": 13, "k": 37, "sb": 0, "obp": 0.329, "slg": 0.377, "ops": 0.706, "war": 0.7 },
      { "name": "Luis Urias", "team": "ATH", "pos": "2B", "gp": 73, "ab": 230, "r": 22, "h": 54, "avg": 0.235, "2b": 7, "3b": 0, "hr": 7, "rbi": 18, "tb": 82, "bb": 27, "k": 36, "sb": 2, "obp": 0.321, "slg": 0.357, "ops": 0.677, "war": 0.6 },
      { "name": "Tommy Pham", "team": "PIT", "pos": "LF", "gp": 70, "ab": 219, "r": 21, "h": 54, "avg": 0.247, "2b": 8, "3b": 0, "hr": 4, "rbi": 25, "tb": 74, "bb": 22, "k": 57, "sb": 3, "obp": 0.314, "slg": 0.338, "ops": 0.652, "war": 0.6 },
      { "name": "Heriberto Hernandez", "team": "MIA", "pos": "LF", "gp": 33, "ab": 85, "r": 12, "h": 27, "avg": 0.318, "2b": 5, "3b": 0, "hr": 3, "rbi": 12, "tb": 41, "bb": 8, "k": 26, "sb": 0, "obp": 0.372, "slg": 0.482, "ops": 0.855, "war": 0.6 },
      { "name": "Shea Langeliers", "team": "ATH", "pos": "C", "gp": 70, "ab": 258, "r": 32, "h": 62, "avg": 0.24, "2b": 15, "3b": 0, "hr": 14, "rbi": 36, "tb": 119, "bb": 23, "k": 56, "sb": 4, "obp": 0.299, "slg": 0.461, "ops": 0.761, "war": 0.6 },
      { "name": "Kyren Paris", "team": "LAA", "pos": "CF", "gp": 44, "ab": 126, "r": 20, "h": 24, "avg": 0.19, "2b": 4, "3b": 1, "hr": 6, "rbi": 11, "tb": 48, "bb": 10, "k": 59, "sb": 7, "obp": 0.266, "slg": 0.381, "ops": 0.647, "war": 0.6 },
      { "name": "Kyle Teel", "team": "CHW", "pos": "C", "gp": 27, "ab": 78, "r": 12, "h": 19, "avg": 0.244, "2b": 5, "3b": 0, "hr": 0, "rbi": 6, "tb": 24, "bb": 14, "k": 28, "sb": 1, "obp": 0.368, "slg": 0.308, "ops": 0.676, "war": 0.6 },
      { "name": "Jesus Sanchez", "team": "MIA", "pos": "RF", "gp": 79, "ab": 279, "r": 37, "h": 72, "avg": 0.258, "2b": 11, "3b": 4, "hr": 8, "rbi": 32, "tb": 115, "bb": 26, "k": 65, "sb": 9, "obp": 0.321, "slg": 0.412, "ops": 0.734, "war": 0.6 },
      { "name": "Jose Altuve", "team": "HOU", "pos": "LF", "gp": 97, "ab": 374, "r": 54, "h": 104, "avg": 0.278, "2b": 17, "3b": 1, "hr": 17, "rbi": 53, "tb": 174, "bb": 35, "k": 67, "sb": 6, "obp": 0.337, "slg": 0.465, "ops": 0.803, "war": 0.6 },
      { "name": "Gavin Sheets", "team": "SD", "pos": "LF", "gp": 96, "ab": 333, "r": 36, "h": 85, "avg": 0.255, "2b": 15, "3b": 1, "hr": 14, "rbi": 51, "tb": 144, "bb": 28, "k": 72, "sb": 1, "obp": 0.314, "slg": 0.432, "ops": 0.747, "war": 0.6 },
      { "name": "Kameron Misner", "team": "TB", "pos": "CF", "gp": 71, "ab": 197, "r": 27, "h": 42, "avg": 0.213, "2b": 9, "3b": 1, "hr": 5, "rbi": 22, "tb": 68, "bb": 16, "k": 69, "sb": 8, "obp": 0.273, "slg": 0.345, "ops": 0.618, "war": 0.6 },
      { "name": "Michael A. Taylor", "team": "CHW", "pos": "RF", "gp": 84, "ab": 183, "r": 23, "h": 41, "avg": 0.224, "2b": 15, "3b": 1, "hr": 5, "rbi": 25, "tb": 73, "bb": 18, "k": 70, "sb": 7, "obp": 0.294, "slg": 0.399, "ops": 0.693, "war": 0.6 },
      { "name": "Luis Robert Jr.", "team": "CHW", "pos": "CF", "gp": 83, "ab": 282, "r": 35, "h": 58, "avg": 0.206, "2b": 9, "3b": 0, "hr": 10, "rbi": 40, "tb": 97, "bb": 34, "k": 94, "sb": 25, "obp": 0.292, "slg": 0.344, "ops": 0.636, "war": 0.6 },
      { "name": "Patrick Bailey", "team": "SF", "pos": "C", "gp": 79, "ab": 232, "r": 24, "h": 47, "avg": 0.203, "2b": 11, "3b": 2, "hr": 2, "rbi": 27, "tb": 68, "bb": 20, "k": 80, "sb": 0, "obp": 0.264, "slg": 0.293, "ops": 0.557, "war": 0.6 },
      { "name": "Andrew Benintendi", "team": "CHW", "pos": "LF", "gp": 70, "ab": 252, "r": 36, "h": 59, "avg": 0.234, "2b": 12, "3b": 2, "hr": 11, "rbi": 37, "tb": 108, "bb": 25, "k": 47, "sb": 1, "obp": 0.303, "slg": 0.429, "ops": 0.731, "war": 0.6 },
      { "name": "Luke Raley", "team": "SEA", "pos": "RF", "gp": 46, "ab": 136, "r": 19, "h": 31, "avg": 0.228, "2b": 6, "3b": 0, "hr": 4, "rbi": 18, "tb": 49, "bb": 16, "k": 42, "sb": 2, "obp": 0.35, "slg": 0.36, "ops": 0.71, "war": 0.5 },
      { "name": "Lenyn Sosa", "team": "CHW", "pos": "2B", "gp": 85, "ab": 304, "r": 29, "h": 81, "avg": 0.266, "2b": 15, "3b": 1, "hr": 9, "rbi": 34, "tb": 125, "bb": 9, "k": 74, "sb": 2, "obp": 0.292, "slg": 0.411, "ops": 0.703, "war": 0.5 },
      { "name": "Josh Jung", "team": "TEX", "pos": "3B", "gp": 76, "ab": 281, "r": 28, "h": 68, "avg": 0.242, "2b": 10, "3b": 1, "hr": 9, "rbi": 36, "tb": 107, "bb": 17, "k": 73, "sb": 4, "obp": 0.29, "slg": 0.381, "ops": 0.671, "war": 0.5 },
      { "name": "Abraham Toro", "team": "BOS", "pos": "1B", "gp": 55, "ab": 186, "r": 25, "h": 52, "avg": 0.28, "2b": 12, "3b": 0, "hr": 5, "rbi": 20, "tb": 79, "bb": 12, "k": 30, "sb": 1, "obp": 0.33, "slg": 0.425, "ops": 0.755, "war": 0.5 },
      { "name": "Henry Davis", "team": "PIT", "pos": "C", "gp": 49, "ab": 139, "r": 16, "h": 26, "avg": 0.187, "2b": 5, "3b": 0, "hr": 4, "rbi": 12, "tb": 43, "bb": 11, "k": 37, "sb": 0, "obp": 0.25, "slg": 0.309, "ops": 0.559, "war": 0.5 },
      { "name": "Adam Frazier", "team": "KC", "pos": "2B", "gp": 81, "ab": 240, "r": 22, "h": 62, "avg": 0.258, "2b": 12, "3b": 0, "hr": 3, "rbi": 23, "tb": 83, "bb": 18, "k": 45, "sb": 7, "obp": 0.322, "slg": 0.346, "ops": 0.668, "war": 0.5 },
      { "name": "Leo Rivas", "team": "SEA", "pos": "2B", "gp": 30, "ab": 60, "r": 14, "h": 17, "avg": 0.283, "2b": 1, "3b": 0, "hr": 0, "rbi": 4, "tb": 18, "bb": 12, "k": 15, "sb": 4, "obp": 0.411, "slg": 0.3, "ops": 0.711, "war": 0.5 },
      { "name": "Mitch Garver", "team": "SEA", "pos": "C", "gp": 54, "ab": 158, "r": 17, "h": 36, "avg": 0.228, "2b": 4, "3b": 0, "hr": 6, "rbi": 22, "tb": 58, "bb": 19, "k": 57, "sb": 3, "obp": 0.318, "slg": 0.367, "ops": 0.686, "war": 0.5 },
      { "name": "Alek Thomas", "team": "ARI", "pos": "CF", "gp": 89, "ab": 268, "r": 33, "h": 66, "avg": 0.246, "2b": 13, "3b": 2, "hr": 5, "rbi": 26, "tb": 98, "bb": 15, "k": 77, "sb": 5, "obp": 0.294, "slg": 0.366, "ops": 0.66, "war": 0.5 },
      { "name": "Gabriel Moreno", "team": "ARI", "pos": "C", "gp": 53, "ab": 174, "r": 29, "h": 47, "avg": 0.27, "2b": 8, "3b": 1, "hr": 5, "rbi": 20, "tb": 72, "bb": 13, "k": 32, "sb": 1, "obp": 0.324, "slg": 0.414, "ops": 0.738, "war": 0.5 },
      { "name": "Dylan Crews", "team": "WSH", "pos": "RF", "gp": 45, "ab": 158, "r": 24, "h": 31, "avg": 0.196, "2b": 2, "3b": 1, "hr": 7, "rbi": 15, "tb": 56, "bb": 11, "k": 48, "sb": 11, "obp": 0.266, "slg": 0.354, "ops": 0.62, "war": 0.5 },
      { "name": "Nick Fortes", "team": "MIA", "pos": "C", "gp": 54, "ab": 121, "r": 11, "h": 30, "avg": 0.248, "2b": 5, "3b": 1, "hr": 2, "rbi": 10, "tb": 43, "bb": 7, "k": 20, "sb": 0, "obp": 0.298, "slg": 0.355, "ops": 0.653, "war": 0.5 },
      { "name": "Wilmer Flores", "team": "SF", "pos": "1B", "gp": 90, "ab": 319, "r": 34, "h": 78, "avg": 0.245, "2b": 9, "3b": 0, "hr": 11, "rbi": 55, "tb": 120, "bb": 29, "k": 62, "sb": 1, "obp": 0.318, "slg": 0.376, "ops": 0.694, "war": 0.5 },
      { "name": "Yohel Pozo", "team": "STL", "pos": "C", "gp": 39, "ab": 96, "r": 12, "h": 29, "avg": 0.302, "2b": 6, "3b": 0, "hr": 4, "rbi": 14, "tb": 47, "bb": 4, "k": 11, "sb": 0, "obp": 0.327, "slg": 0.49, "ops": 0.816, "war": 0.5 },
      { "name": "Andrew McCutchen", "team": "PIT", "pos": "RF", "gp": 89, "ab": 317, "r": 32, "h": 81, "avg": 0.256, "2b": 15, "3b": 0, "hr": 8, "rbi": 31, "tb": 120, "bb": 38, "k": 76, "sb": 1, "obp": 0.336, "slg": 0.379, "ops": 0.715, "war": 0.5 },
      { "name": "Emmanuel Rivera", "team": "BAL", "pos": "3B", "gp": 26, "ab": 70, "r": 3, "h": 16, "avg": 0.229, "2b": 3, "3b": 0, "hr": 0, "rbi": 3, "tb": 19, "bb": 6, "k": 12, "sb": 1, "obp": 0.299, "slg": 0.271, "ops": 0.57, "war": 0.5 },
      { "name": "Matt Wallner", "team": "MIN", "pos": "RF", "gp": 59, "ab": 187, "r": 22, "h": 40, "avg": 0.214, "2b": 10, "3b": 2, "hr": 11, "rbi": 19, "tb": 87, "bb": 23, "k": 64, "sb": 0, "obp": 0.308, "slg": 0.465, "ops": 0.774, "war": 0.4 },
      { "name": "Otto Kemp", "team": "PHI", "pos": "1B", "gp": 30, "ab": 99, "r": 12, "h": 25, "avg": 0.253, "2b": 6, "3b": 0, "hr": 2, "rbi": 12, "tb": 37, "bb": 6, "k": 29, "sb": 1, "obp": 0.327, "slg": 0.374, "ops": 0.701, "war": 0.4 },
      { "name": "Austin Slater", "team": "CHW", "pos": "LF", "gp": 47, "ab": 110, "r": 17, "h": 26, "avg": 0.236, "2b": 6, "3b": 1, "hr": 4, "rbi": 10, "tb": 46, "bb": 11, "k": 34, "sb": 0, "obp": 0.306, "slg": 0.418, "ops": 0.724, "war": 0.4 },
      { "name": "Curtis Mead", "team": "TB", "pos": "1B", "gp": 49, "ab": 115, "r": 14, "h": 26, "avg": 0.226, "2b": 2, "3b": 1, "hr": 3, "rbi": 8, "tb": 39, "bb": 12, "k": 33, "sb": 4, "obp": 0.318, "slg": 0.339, "ops": 0.657, "war": 0.4 },
      { "name": "Luis Arraez", "team": "SD", "pos": "1B", "gp": 94, "ab": 381, "r": 41, "h": 108, "avg": 0.283, "2b": 17, "3b": 4, "hr": 5, "rbi": 36, "tb": 148, "bb": 19, "k": 12, "sb": 5, "obp": 0.319, "slg": 0.388, "ops": 0.707, "war": 0.4 },
      { "name": "David Hamilton", "team": "BOS", "pos": "2B", "gp": 62, "ab": 123, "r": 16, "h": 22, "avg": 0.179, "2b": 3, "3b": 0, "hr": 3, "rbi": 12, "tb": 34, "bb": 7, "k": 31, "sb": 15, "obp": 0.229, "slg": 0.276, "ops": 0.505, "war": 0.4 },
      { "name": "Eli White", "team": "ATL", "pos": "RF", "gp": 69, "ab": 178, "r": 27, "h": 43, "avg": 0.242, "2b": 7, "3b": 3, "hr": 4, "rbi": 17, "tb": 68, "bb": 9, "k": 41, "sb": 6, "obp": 0.282, "slg": 0.382, "ops": 0.664, "war": 0.4 },
      { "name": "Ronny Mauricio", "team": "NYM", "pos": "3B", "gp": 32, "ab": 102, "r": 14, "h": 22, "avg": 0.216, "2b": 4, "3b": 0, "hr": 4, "rbi": 6, "tb": 38, "bb": 9, "k": 32, "sb": 2, "obp": 0.286, "slg": 0.373, "ops": 0.658, "war": 0.4 },
      { "name": "Mickey Moniak", "team": "COL", "pos": "RF", "gp": 83, "ab": 247, "r": 36, "h": 67, "avg": 0.271, "2b": 11, "3b": 6, "hr": 14, "rbi": 36, "tb": 132, "bb": 16, "k": 65, "sb": 5, "obp": 0.32, "slg": 0.534, "ops": 0.854, "war": 0.4 },
      { "name": "Jose Fermin", "team": "STL", "pos": "2B", "gp": 11, "ab": 19, "r": 2, "h": 7, "avg": 0.368, "2b": 2, "3b": 0, "hr": 1, "rbi": 2, "tb": 12, "bb": 2, "k": 2, "sb": 1, "obp": 0.429, "slg": 0.632, "ops": 1.06, "war": 0.4 },
      { "name": "Oswaldo Cabrera", "team": "NYY", "pos": "3B", "gp": 34, "ab": 107, "r": 17, "h": 26, "avg": 0.243, "2b": 4, "3b": 0, "hr": 1, "rbi": 11, "tb": 33, "bb": 11, "k": 25, "sb": 0, "obp": 0.322, "slg": 0.308, "ops": 0.631, "war": 0.4 },
      { "name": "Bo Naylor", "team": "CLE", "pos": "C", "gp": 75, "ab": 222, "r": 29, "h": 38, "avg": 0.171, "2b": 9, "3b": 1, "hr": 10, "rbi": 21, "tb": 79, "bb": 31, "k": 69, "sb": 1, "obp": 0.271, "slg": 0.356, "ops": 0.626, "war": 0.4 },
      { "name": "Johan Rojas", "team": "PHI", "pos": "CF", "gp": 67, "ab": 141, "r": 22, "h": 32, "avg": 0.227, "2b": 3, "3b": 2, "hr": 1, "rbi": 16, "tb": 42, "bb": 12, "k": 38, "sb": 12, "obp": 0.282, "slg": 0.298, "ops": 0.58, "war": 0.4 },
      { "name": "Luke Keaschall", "team": "MIN", "pos": "2B", "gp": 7, "ab": 19, "r": 4, "h": 7, "avg": 0.368, "2b": 3, "3b": 0, "hr": 0, "rbi": 2, "tb": 10, "bb": 5, "k": 2, "sb": 5, "obp": 0.538, "slg": 0.526, "ops": 1.065, "war": 0.4 },
      { "name": "Davis Schneider", "team": "TOR", "pos": "LF", "gp": 36, "ab": 80, "r": 14, "h": 17, "avg": 0.213, "2b": 2, "3b": 0, "hr": 5, "rbi": 11, "tb": 34, "bb": 16, "k": 29, "sb": 0, "obp": 0.357, "slg": 0.425, "ops": 0.782, "war": 0.4 },
      { "name": "Jonny DeLuca", "team": "TB", "pos": "CF", "gp": 9, "ab": 23, "r": 4, "h": 10, "avg": 0.435, "2b": 0, "3b": 1, "hr": 0, "rbi": 1, "tb": 12, "bb": 2, "k": 4, "sb": 4, "obp": 0.48, "slg": 0.522, "ops": 1.002, "war": 0.4 },
      { "name": "Austin Wells", "team": "NYY", "pos": "C", "gp": 81, "ab": 269, "r": 31, "h": 59, "avg": 0.219, "2b": 15, "3b": 1, "hr": 14, "rbi": 54, "tb": 118, "bb": 19, "k": 73, "sb": 3, "obp": 0.276, "slg": 0.439, "ops": 0.714, "war": 0.4 },
      { "name": "Reese McGuire", "team": "CHC", "pos": "C", "gp": 21, "ab": 67, "r": 10, "h": 14, "avg": 0.209, "2b": 1, "3b": 0, "hr": 5, "rbi": 10, "tb": 30, "bb": 2, "k": 14, "sb": 0, "obp": 0.232, "slg": 0.448, "ops": 0.68, "war": 0.4 },
      { "name": "Jose Tena", "team": "WSH", "pos": "3B", "gp": 44, "ab": 137, "r": 18, "h": 34, "avg": 0.248, "2b": 12, "3b": 2, "hr": 0, "rbi": 13, "tb": 50, "bb": 15, "k": 33, "sb": 2, "obp": 0.325, "slg": 0.365, "ops": 0.69, "war": 0.3 },
      { "name": "Javier Sanoja", "team": "MIA", "pos": "2B", "gp": 70, "ab": 181, "r": 24, "h": 43, "avg": 0.238, "2b": 11, "3b": 2, "hr": 1, "rbi": 18, "tb": 61, "bb": 13, "k": 29, "sb": 3, "obp": 0.283, "slg": 0.337, "ops": 0.62, "war": 0.3 },
      { "name": "Jon Berti", "team": "CHC", "pos": "3B", "gp": 48, "ab": 96, "r": 12, "h": 21, "avg": 0.219, "2b": 2, "3b": 0, "hr": 0, "rbi": 2, "tb": 23, "bb": 5, "k": 21, "sb": 11, "obp": 0.272, "slg": 0.24, "ops": 0.511, "war": 0.3 },
      { "name": "Royce Lewis", "team": "MIN", "pos": "3B", "gp": 45, "ab": 150, "r": 16, "h": 35, "avg": 0.233, "2b": 7, "3b": 0, "hr": 4, "rbi": 15, "tb": 54, "bb": 13, "k": 23, "sb": 1, "obp": 0.293, "slg": 0.36, "ops": 0.653, "war": 0.3 },
      { "name": "Luisangel Acuna", "team": "NYM", "pos": "2B", "gp": 72, "ab": 157, "r": 24, "h": 38, "avg": 0.242, "2b": 7, "3b": 0, "hr": 0, "rbi": 7, "tb": 45, "bb": 11, "k": 32, "sb": 11, "obp": 0.294, "slg": 0.287, "ops": 0.581, "war": 0.3 },
      { "name": "Michael Harris II", "team": "ATL", "pos": "CF", "gp": 97, "ab": 362, "r": 23, "h": 76, "avg": 0.21, "2b": 13, "3b": 3, "hr": 7, "rbi": 46, "tb": 116, "bb": 11, "k": 81, "sb": 12, "obp": 0.234, "slg": 0.32, "ops": 0.555, "war": 0.3 },
      { "name": "Brady House", "team": "WSH", "pos": "3B", "gp": 26, "ab": 104, "r": 10, "h": 29, "avg": 0.279, "2b": 6, "3b": 0, "hr": 2, "rbi": 13, "tb": 41, "bb": 4, "k": 24, "sb": 3, "obp": 0.3, "slg": 0.394, "ops": 0.694, "war": 0.3 },
      { "name": "Chandler Simpson", "team": "TB", "pos": "CF", "gp": 57, "ab": 203, "r": 26, "h": 61, "avg": 0.3, "2b": 7, "3b": 1, "hr": 0, "rbi": 15, "tb": 70, "bb": 10, "k": 20, "sb": 27, "obp": 0.33, "slg": 0.345, "ops": 0.675, "war": 0.3 },
      { "name": "Ryan Ritter", "team": "COL", "pos": "SS", "gp": 31, "ab": 101, "r": 13, "h": 24, "avg": 0.238, "2b": 4, "3b": 2, "hr": 1, "rbi": 12, "tb": 35, "bb": 7, "k": 35, "sb": 1, "obp": 0.291, "slg": 0.347, "ops": 0.637, "war": 0.3 },
      { "name": "Yoan Moncada", "team": "LAA", "pos": "3B", "gp": 38, "ab": 122, "r": 21, "h": 29, "avg": 0.238, "2b": 6, "3b": 1, "hr": 8, "rbi": 22, "tb": 61, "bb": 17, "k": 34, "sb": 0, "obp": 0.338, "slg": 0.5, "ops": 0.838, "war": 0.3 },
      { "name": "Enrique Hernandez", "team": "LAD", "pos": "1B", "gp": 71, "ab": 169, "r": 23, "h": 33, "avg": 0.195, "2b": 5, "3b": 0, "hr": 8, "rbi": 22, "tb": 62, "bb": 15, "k": 48, "sb": 0, "obp": 0.259, "slg": 0.367, "ops": 0.626, "war": 0.3 },
      { "name": "Tim Tawa", "team": "ARI", "pos": "2B", "gp": 59, "ab": 155, "r": 21, "h": 31, "avg": 0.2, "2b": 6, "3b": 0, "hr": 6, "rbi": 14, "tb": 55, "bb": 13, "k": 47, "sb": 7, "obp": 0.262, "slg": 0.355, "ops": 0.616, "war": 0.3 },
      { "name": "Taylor Trammell", "team": "HOU", "pos": "LF", "gp": 18, "ab": 43, "r": 6, "h": 9, "avg": 0.209, "2b": 3, "3b": 0, "hr": 2, "rbi": 8, "tb": 18, "bb": 6, "k": 16, "sb": 0, "obp": 0.3, "slg": 0.419, "ops": 0.719, "war": 0.3 },
      { "name": "Alexander Canario", "team": "PIT", "pos": "LF", "gp": 54, "ab": 150, "r": 18, "h": 33, "avg": 0.22, "2b": 5, "3b": 1, "hr": 3, "rbi": 13, "tb": 49, "bb": 14, "k": 52, "sb": 2, "obp": 0.287, "slg": 0.327, "ops": 0.613, "war": 0.3 },
      { "name": "Nick Gonzales", "team": "PIT", "pos": "2B", "gp": 39, "ab": 146, "r": 16, "h": 40, "avg": 0.274, "2b": 7, "3b": 2, "hr": 4, "rbi": 15, "tb": 63, "bb": 14, "k": 25, "sb": 0, "obp": 0.335, "slg": 0.432, "ops": 0.767, "war": 0.3 },
      { "name": "Dustin Harris", "team": "TEX", "pos": "LF", "gp": 16, "ab": 35, "r": 4, "h": 7, "avg": 0.2, "2b": 2, "3b": 0, "hr": 1, "rbi": 1, "tb": 12, "bb": 3, "k": 11, "sb": 1, "obp": 0.263, "slg": 0.343, "ops": 0.606, "war": 0.3 },
      { "name": "Brett Wisely", "team": "SF", "pos": "2B", "gp": 18, "ab": 40, "r": 5, "h": 9, "avg": 0.225, "2b": 3, "3b": 0, "hr": 1, "rbi": 9, "tb": 15, "bb": 3, "k": 7, "sb": 1, "obp": 0.279, "slg": 0.375, "ops": 0.654, "war": 0.3 },
      { "name": "Ty France", "team": "MIN", "pos": "1B", "gp": 94, "ab": 330, "r": 38, "h": 81, "avg": 0.245, "2b": 16, "3b": 0, "hr": 6, "rbi": 42, "tb": 115, "bb": 15, "k": 57, "sb": 1, "obp": 0.309, "slg": 0.348, "ops": 0.658, "war": 0.2 },
      { "name": "Akil Baddoo", "team": "DET", "pos": "LF", "gp": 7, "ab": 17, "r": 0, "h": 2, "avg": 0.118, "2b": 1, "3b": 0, "hr": 0, "rbi": 1, "tb": 3, "bb": 1, "k": 5, "sb": 1, "obp": 0.167, "slg": 0.176, "ops": 0.343, "war": 0.2 },
      { "name": "J.C. Escarra", "team": "NYY", "pos": "C", "gp": 38, "ab": 80, "r": 5, "h": 17, "avg": 0.213, "2b": 5, "3b": 0, "hr": 2, "rbi": 10, "tb": 28, "bb": 11, "k": 14, "sb": 1, "obp": 0.309, "slg": 0.35, "ops": 0.659, "war": 0.2 },
      { "name": "Jacob Melton", "team": "HOU", "pos": "LF", "gp": 11, "ab": 29, "r": 3, "h": 7, "avg": 0.241, "2b": 0, "3b": 1, "hr": 0, "rbi": 6, "tb": 9, "bb": 2, "k": 12, "sb": 3, "obp": 0.29, "slg": 0.31, "ops": 0.601, "war": 0.2 },
      { "name": "Kyle Manzardo", "team": "CLE", "pos": "1B", "gp": 84, "ab": 274, "r": 28, "h": 60, "avg": 0.219, "2b": 12, "3b": 2, "hr": 16, "rbi": 38, "tb": 124, "bb": 29, "k": 76, "sb": 1, "obp": 0.295, "slg": 0.453, "ops": 0.748, "war": 0.2 },
      { "name": "Salvador Perez", "team": "KC", "pos": "C", "gp": 96, "ab": 372, "r": 32, "h": 94, "avg": 0.253, "2b": 26, "3b": 0, "hr": 17, "rbi": 60, "tb": 171, "bb": 18, "k": 77, "sb": 0, "obp": 0.295, "slg": 0.46, "ops": 0.755, "war": 0.2 },
      { "name": "Jahmai Jones", "team": "DET", "pos": "RF", "gp": 28, "ab": 49, "r": 5, "h": 12, "avg": 0.245, "2b": 5, "3b": 0, "hr": 2, "rbi": 5, "tb": 23, "bb": 6, "k": 10, "sb": 0, "obp": 0.339, "slg": 0.469, "ops": 0.809, "war": 0.2 },
      { "name": "Jake Burger", "team": "TEX", "pos": "1B", "gp": 75, "ab": 272, "r": 33, "h": 62, "avg": 0.228, "2b": 14, "3b": 0, "hr": 11, "rbi": 35, "tb": 109, "bb": 8, "k": 73, "sb": 1, "obp": 0.259, "slg": 0.401, "ops": 0.659, "war": 0.2 },
      { "name": "Miles Mastrobuoni", "team": "SEA", "pos": "3B", "gp": 70, "ab": 146, "r": 19, "h": 37, "avg": 0.253, "2b": 3, "3b": 0, "hr": 1, "rbi": 12, "tb": 43, "bb": 17, "k": 28, "sb": 5, "obp": 0.329, "slg": 0.295, "ops": 0.624, "war": 0.2 },
      { "name": "Korey Lee", "team": "CHW", "pos": "C", "gp": 14, "ab": 28, "r": 7, "h": 7, "avg": 0.25, "2b": 3, "3b": 0, "hr": 0, "rbi": 1, "tb": 10, "bb": 2, "k": 5, "sb": 0, "obp": 0.3, "slg": 0.357, "ops": 0.657, "war": 0.2 },
      { "name": "Dalton Rushing", "team": "LAD", "pos": "C", "gp": 25, "ab": 71, "r": 9, "h": 15, "avg": 0.211, "2b": 3, "3b": 0, "hr": 1, "rbi": 11, "tb": 21, "bb": 7, "k": 33, "sb": 0, "obp": 0.278, "slg": 0.296, "ops": 0.574, "war": 0.2 },
      { "name": "Amed Rosario", "team": "WSH", "pos": "3B", "gp": 45, "ab": 144, "r": 19, "h": 39, "avg": 0.271, "2b": 8, "3b": 0, "hr": 5, "rbi": 18, "tb": 62, "bb": 7, "k": 22, "sb": 1, "obp": 0.312, "slg": 0.431, "ops": 0.742, "war": 0.2 },
      { "name": "Luke Maile", "team": "KC", "pos": "C", "gp": 6, "ab": 8, "r": 2, "h": 3, "avg": 0.375, "2b": 0, "3b": 0, "hr": 1, "rbi": 1, "tb": 6, "bb": 2, "k": 1, "sb": 0, "obp": 0.5, "slg": 0.75, "ops": 1.25, "war": 0.2 },
    ];
  }
}

