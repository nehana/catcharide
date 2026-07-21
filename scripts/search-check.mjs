// Assertions for country search. No test framework — run with:
//   npm run test:search
//
// Each case is [query, expectedTopResult]. `null` means "expect no matches".
// Add a case here whenever a search bug is reported, so it stays fixed.

import { readFileSync } from 'node:fs';
import { createCountrySearch } from '../src/lib/search.js';

const data = JSON.parse(
  readFileSync(new URL('../src/data/rideshareData.json', import.meta.url), 'utf8')
);
const search = createCountrySearch(data.countries);

const CASES = [
  // Plain names
  ['China', 'China'],
  ['china', 'China'],
  ['vietnam', 'Vietnam'],

  // Stray whitespace — the original reported bug
  ['china ', 'China'],
  [' china', 'China'],
  ['  china  ', 'China'],

  // Accents folded both directions
  ['sao tome', 'São Tomé and Príncipe'],
  ['São Tomé', 'São Tomé and Príncipe'],
  ['principe', 'São Tomé and Príncipe'],
  ['cote divoire', "Côte d'Ivoire"],
  ['Turkiye', 'Türkiye'],
  ['turkey', 'Türkiye'],

  // Single letters must prefer names that start with them
  ['s', 'Samoa'],
  ['u', 'Uganda'],
  ['j', 'Japan'],

  // Aliases: abbreviations, former names, endonyms, official forms
  ['usa', 'United States'],
  ['uk', 'United Kingdom'],
  ['england', 'United Kingdom'],
  ['holland', 'Netherlands'],
  ['burma', 'Myanmar'],
  ['zaire', 'DR Congo'],
  ['drc', 'DR Congo'],
  ['ceylon', 'Sri Lanka'],
  ['persia', 'Iran'],
  ['swaziland', 'Eswatini'],
  ['cape verde', 'Cabo Verde'],
  ['east timor', 'Timor-Leste'],
  ['holy see', 'Vatican City'],
  ['deutschland', 'Germany'],
  ['czech republic', 'Czechia'],
  ['st lucia', 'Saint Lucia'],
  ['png', 'Papua New Guinea'],
  ['hk', 'Hong Kong'],

  // Typos
  ['chna', 'China'],
  ['phillipines', 'Philippines'],
  ['switerland', 'Switzerland'],
  ['moroco', 'Morocco'],
  ['singapor', 'Singapore'],
  ['columbia', 'Colombia'],

  // Gibberish stays quiet rather than guessing
  ['xqzzy', null],
  ['', null],
  ['   ', null],
];

let failed = 0;

for (const [query, expected] of CASES) {
  const results = search(query);
  const actual = results[0]?.country ?? null;

  if (actual === expected) {
    console.log(`  ok    ${JSON.stringify(query)} -> ${actual ?? '(none)'}`);
  } else {
    failed++;
    console.log(
      `  FAIL  ${JSON.stringify(query)} -> expected ${expected ?? '(none)'}, got ${actual ?? '(none)'}`
    );
  }
}

// Ranking rules that apply across queries, not to one expected answer.
const invariants = [
  [
    // Contains-matches still appear, but only after every starts-with match.
    'single letter ranks all starts-with names ahead of contains-only names',
    () => {
      const names = search('s').map((c) => c.country.toLowerCase());
      const lastStartsWith = names.findLastIndex((n) => n.startsWith('s'));
      return names.slice(0, lastStartsWith + 1).every((n) => n.startsWith('s'));
    },
  ],
  [
    'results are no longer capped at 6',
    () => search('a').length > 6,
  ],
  [
    'a real match suppresses the typo-guess tier',
    () => search('india').every((c) => /ind/i.test(c.country)),
  ],
  [
    'every country is reachable by its own exact name',
    () =>
      data.countries.every((c) => search(c.country)[0]?.country === c.country),
  ],
];

for (const [label, check] of invariants) {
  let passed = false;
  try {
    passed = check();
  } catch {
    passed = false;
  }
  if (passed) {
    console.log(`  ok    ${label}`);
  } else {
    failed++;
    console.log(`  FAIL  ${label}`);
  }
}

const total = CASES.length + invariants.length;
console.log(`\n${total - failed}/${total} passed`);
process.exit(failed > 0 ? 1 : 0);
