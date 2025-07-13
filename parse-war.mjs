
import fs from 'fs';
import readline from 'readline';
import util from 'util';

const file = './war-data.csv';

const results = [];

const rl = readline.createInterface({
  input: fs.createReadStream(file),
  crlfDelay: Infinity
});

rl.on('line', line => {
  const parts = line.split(',');
  const name = parts[1]?.trim();
  const team = parts[2]?.trim();
  const war = parseFloat(parts[parts.length - 1]);

  if (name && !isNaN(war)) {
    results.push({ name, team, war });
  }
});

rl.on('close', () => {
  //console.dir(results, { depth: null });
  console.log(util.inspect(results, { depth: null, maxArrayLength: null }));

});