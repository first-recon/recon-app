const gameConfig = require('../../data/game-config');
const ciphers = require('../../data/ciphers');

// brown = true, grey = false by default
function blocksToBool (cryptobox) {
  return cryptobox.map((blocks) => {
    return blocks.map((block) => {
      if (block) {
        if (block.color === 'brown') {
          return true;
        } else if (block.color === 'lightgrey') {
          return false;
        }
      } else {
        throw new Error({ name: 'CryptoboxIncomplete', msg: 'Error, the cryptobox is incomplete!' });
      }
    });
  });
}

function flattenBox (box) {
  // convert to row-first matrix
  const rows = [[false, false, false], [false, false, false], [false, false, false], [false, false, false]];
  box.forEach((col, colIdx) => {
    col.forEach((block, rowIdx) => {
      rows[rowIdx][colIdx] = block;
    });
  });

  return rows.reduce((final, r) => {
    return final.concat(r);
  }, []);
}

function invertCiphers (pattern) {
  return {
    name: pattern.name,
    pattern: pattern.pattern.map(block => !block)
  }
}

function compareToPattern (box, pattern) {
  let isMatch = true;
  box.forEach((block, i) => {
    isMatch = block === pattern[i];
  });
  return isMatch;
}

function compareToCipherPatterns (box) {
  const invertedCiphers = ciphers.map(invertCiphers);
  const allCiphers = ciphers.concat(invertedCiphers);
  return !!allCiphers.find(({ name, pattern }) => {
    return compareToPattern(box, pattern);
  });
}

function detectCipher (cryptobox) {
  try {
    const boolBox = blocksToBool(cryptobox);
    const flattenedBox = flattenBox(boolBox);

    return compareToCipherPatterns(flattenedBox);
  } catch (e) {
    return false;
  }
}

const COLUMN = {
  LEFT: 0,
  CENTER: 1,
  RIGHT: 2
};

// takes state of match add page and converts to match data structure
// essentially, "scores" the match
export function buildMatchScores (state) {

  const keyColumn = (() => {
    switch (state.diceRoll) {
      case 1:
      case 4:
        return state.alliance === 'BLUE' ? COLUMN.RIGHT : COLUMN.LEFT;
      case 2:
      case 5:
        return COLUMN.CENTER;
      case 3:
      case 6:
        return state.alliance === 'BLUE' ? COLUMN.LEFT : COLUMN.RIGHT;
      default:
        return -1; // not a valid column, thus will not score key column bonus
    }
  })(); // depends on state.diceRoll

  let totalBlocks = 0;
  let autoBlocksFound = 0;
  let blockInKeyColumn = false;
  let completedRows = 0;
  let completedColumns = 0;
  let ciphers = 0;

  const boxRows = [[true, true, true, true], [true, true, true, true]];

  state.cryptoboxes.forEach((box, boxIdx) => { // box = array of columns
    if (detectCipher(box)) {
      ciphers++;
    }
    box.forEach((columns, colIdx) => { // columns = array of blocks
      let isColumn = true;
      columns.forEach((block, rowIdx) => {

        if (block) {
          totalBlocks++;
          if (block.isAuto) {
            autoBlocksFound++;
            if (keyColumn === colIdx) {
              blockInKeyColumn = true;
            }
          }
        } else {
          isColumn = false;
          boxRows[boxIdx][rowIdx] = false;
        }
      });

      if (isColumn) {
        completedColumns++;
      }
    });
  });

  boxRows.forEach(rows => {
    completedRows += rows.filter(r => r).length;
  });

  const zone1Relics = state.relicZones[0].facedown + state.relicZones[0].upright;
  const zone2Relics = state.relicZones[1].facedown + state.relicZones[1].upright;
  const zone3Relics = state.relicZones[2].facedown + state.relicZones[2].upright;

  const uprightRelics = state.relicZones.reduce((totalUpright, zone) => {
    return totalUpright + zone.upright;
  }, 0);

  return {
    team: state.team,
    tournament: state.tournament,
    number: state.number,
    alliance: state.alliance,
    comments: state.comments,
    uploaded: false,
    data: {
      rules: gameConfig.rules.map((r) => {
        const rule = r;

        if (rule.name === 'Alliance-specific Jewel remaining on platform') {
          rule.points = state.allianceJewelOnPlatform ? rule.value : 0;
        } else if (rule.name === 'Auto Glyph scored in Cryptobox') {
          rule.points = autoBlocksFound * rule.value;
        } else if (rule.name === 'Glyph bonus for Cryptobox Key column') {
          rule.points = blockInKeyColumn ? rule.value : 0;
        } else if (rule.name === 'Robot parked in Safe Zone') {
          rule.points = state.robotInSafeZone ? rule.value : 0;
        } else if (rule.name === 'Glyph scored in Cryptobox') {
          rule.points = totalBlocks * rule.value;
        } else if (rule.name === 'Completed row of 3 in Cryptobox') {
          rule.points = completedRows * rule.value;
        } else if (rule.name === 'Completed column of 4 in Cryptobox') {
          rule.points = completedColumns * rule.value;
        } else if (rule.name === 'Completed Cipher') {
          rule.points = ciphers * rule.value;
        } else if (rule.name === 'Relic in Recovery Zone #1') {
          rule.points = zone1Relics * rule.value;
        } else if (rule.name === 'Relic in Recovery Zone #2') {
          rule.points = zone2Relics * rule.value;
        } else if (rule.name === 'Relic in Recovery Zone #3') {
          rule.points = zone3Relics * rule.value;
        } else if (rule.name === 'Bonus for keeping Relic upright') {
          rule.points = uprightRelics * rule.value;
        } else if (rule.name === 'Robot balanced on Balancing Stone') {
          rule.points = state.robotBalanced ? rule.value : 0;
        }

        return rule;
      })
    }
  }
}

// TODO: create a canonical model structure
export function empty (team) {
  return {
    team: team,
    tournament: 0,
    number: 1,
    matchId: '',
    alliance: 'RED',
    comments: '',
    uploaded: false,
    data: {
      rules: gameConfig.rules.map((r) => {
        return Object.assign({}, r, { points: 0 });
      })
    }
  }
}