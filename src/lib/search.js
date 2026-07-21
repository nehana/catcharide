import { COUNTRY_ALIASES } from '../data/countryAliases.js';

// Fold to a comparable form: strip diacritics so "Côte d'Ivoire" is reachable
// from "Cote dIvoire", drop punctuation, collapse whitespace.
export function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Spaceless form, so "srilanka" and "sri lanka" both land.
const compact = (text) => normalize(text).replace(/ /g, '');

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const row = [i + 1];
    for (let j = 0; j < b.length; j++) {
      row[j + 1] = Math.min(
        prev[j + 1] + 1,
        row[j] + 1,
        prev[j] + (a[i] === b[j] ? 0 : 1)
      );
    }
    prev = row;
  }
  return prev[b.length];
}

// Longer queries earn more forgiveness; "chna" gets 1 edit, "unitd kingdm" gets 3.
const editBudget = (query) => Math.max(1, Math.floor(query.length / 4));

// Best of two readings: the query as a typo of the whole name, or as a typo of
// just its opening. Taking the min stops a short wrong name (canada) from
// beating the right one (china) purely because truncation flattered it.
function prefixDistance(query, name) {
  const full = levenshtein(query, name);
  if (name.length <= query.length) return full;
  return Math.min(full, levenshtein(query, name.slice(0, query.length)));
}

// Every query letter appears in order — catches dropped letters ("chna").
// Returns the span consumed, or -1; a wide span means the letters were
// scattered across an unrelated name rather than genuinely matching it.
function subsequenceSpan(query, text) {
  let i = 0;
  let start = -1;
  for (let j = 0; j < text.length && i < query.length; j++) {
    if (query[i] === text[j]) {
      if (start === -1) start = j;
      i++;
      if (i === query.length) return j - start + 1;
    }
  }
  return -1;
}

// Below four characters nearly every name is a subsequence match, so the tier
// is gated on length and on the match staying tight.
function isTightSubsequence(query, text) {
  if (query.length < 4) return false;
  const span = subsequenceSpan(query, text);
  return span !== -1 && span <= query.length * 2;
}

// Key the alias table by normalized name so a curly-vs-straight apostrophe
// (or any punctuation drift) can't silently drop a country's aliases.
function buildAliasLookup() {
  const lookup = new Map();
  for (const [name, aliases] of Object.entries(COUNTRY_ALIASES)) {
    lookup.set(normalize(name), aliases);
  }
  return lookup;
}

// Precomputed once per country so keystrokes stay cheap.
function buildIndex(countries) {
  const aliasLookup = buildAliasLookup();

  return countries.map((country) => {
    const aliases = aliasLookup.get(normalize(country.country)) ?? [];
    return {
      country,
      name: normalize(country.country),
      nameCompact: compact(country.country),
      words: normalize(country.country).split(' '),
      aliases: aliases.map(normalize),
      aliasesCompact: aliases.map(compact),
    };
  });
}

// Lower score wins. The tiers keep exact and prefix hits above fuzzy noise.
function scoreEntry(entry, query, queryCompact) {
  if (entry.name === query || entry.nameCompact === queryCompact) return 0;
  if (entry.aliases.includes(query) || entry.aliasesCompact.includes(queryCompact)) return 1;
  if (entry.name.startsWith(query) || entry.nameCompact.startsWith(queryCompact)) return 2;
  if (entry.words.some((word) => word.startsWith(query))) return 3;
  if (entry.name.includes(query) || entry.nameCompact.includes(queryCompact)) return 4;
  if (entry.aliases.some((a) => a.startsWith(query))) return 5;
  if (entry.aliases.some((a) => a.includes(query))) return 6;
  if (isTightSubsequence(queryCompact, entry.nameCompact)) return 7;

  const budget = editBudget(query);
  const nameDist = Math.min(
    prefixDistance(query, entry.name),
    prefixDistance(queryCompact, entry.nameCompact)
  );
  if (nameDist <= budget) return 8 + nameDist;

  const aliasDist = Math.min(
    ...entry.aliases.map((a) => prefixDistance(query, a)),
    Infinity
  );
  if (aliasDist <= budget) return 14 + aliasDist;

  return Infinity;
}

// Tiers 0-7 are genuine matches on the name or an alias. Anything above is a
// Levenshtein guess at what was meant, which is useful only when nothing
// genuine matched — otherwise it pads the list with unrelated countries.
const MAX_GENUINE_SCORE = 7;

export function createCountrySearch(countries) {
  const index = buildIndex(countries);

  return function search(rawQuery, limit = Infinity) {
    const query = normalize(rawQuery);
    if (!query) return [];
    const queryCompact = query.replace(/ /g, '');

    const scored = [];
    for (const entry of index) {
      const score = scoreEntry(entry, query, queryCompact);
      if (score !== Infinity) scored.push({ entry, score });
    }

    // Nothing cleared the tiers — fall back to the single closest name so a
    // near-miss still surfaces something, but stay quiet on real gibberish.
    if (scored.length === 0) {
      let best = null;
      for (const entry of index) {
        const dist = Math.min(
          prefixDistance(query, entry.name),
          prefixDistance(queryCompact, entry.nameCompact)
        );
        if (!best || dist < best.dist) best = { entry, dist };
      }
      if (best && best.dist <= Math.ceil(query.length * 0.6)) {
        return [best.entry.country];
      }
      return [];
    }

    // Typo guesses only surface when the query matched nothing for real.
    const genuine = scored.filter((s) => s.score <= MAX_GENUINE_SCORE);
    const results = genuine.length > 0 ? genuine : scored;

    results.sort(
      (a, b) =>
        a.score - b.score ||
        a.entry.name.length - b.entry.name.length ||
        a.entry.name.localeCompare(b.entry.name)
    );

    return results.slice(0, limit).map((s) => s.entry.country);
  };
}
