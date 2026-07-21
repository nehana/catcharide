// Alternate names people actually type: official long forms, former names,
// endonyms, common abbreviations, and frequent misspellings.
//
// Keys must match `country` in rideshareData.json exactly. Aliases are
// normalized at load time, so case, accents, and punctuation don't matter here.
//
// Deliberately omitted: short codes that collide with real words or other
// countries ("car" for Central African Republic, "dr" for Dominican Republic,
// "island" for Iceland). Fuzzy matching covers most of what's missing.

export const COUNTRY_ALIASES = {
  // — Commonly typed differently than the canonical name —
  'United States': ['usa', 'us', 'united states of america', 'america', 'the states'],
  'United Kingdom': ['uk', 'great britain', 'britain', 'england', 'scotland', 'wales', 'northern ireland', 'gb'],
  Netherlands: ['holland', 'the netherlands'],
  'Türkiye': ['turkey', 'turkiye', 'republic of turkiye'],
  Czechia: ['czech republic', 'czech'],
  'Côte d’Ivoire': ['ivory coast', 'cote divoire', 'republic of cote divoire'],
  'Cabo Verde': ['cape verde'],
  Eswatini: ['swaziland'],
  'North Macedonia': ['macedonia', 'fyrom'],
  'Timor-Leste': ['east timor'],
  Myanmar: ['burma'],
  'Vatican City': ['holy see', 'vatican'],
  'State of Palestine': ['palestine', 'palestinian territories', 'west bank', 'gaza'],
  'Micronesia (Federated States of)': ['micronesia', 'fsm', 'federated states of micronesia'],

  // — The two Congos, routinely confused —
  'DR Congo': ['democratic republic of the congo', 'drc', 'congo kinshasa', 'zaire'],
  'Congo (Brazzaville)': ['republic of the congo', 'congo brazzaville', 'congo republic'],

  // — Official long forms —
  China: ['peoples republic of china', 'prc', 'mainland china'],
  Taiwan: ['republic of china', 'chinese taipei'],
  'South Korea': ['republic of korea', 'korea', 'rok'],
  'North Korea': ['dprk', 'democratic peoples republic of korea'],
  Russia: ['russian federation'],
  Iran: ['islamic republic of iran', 'persia'],
  Syria: ['syrian arab republic'],
  Laos: ['lao pdr', 'lao peoples democratic republic'],
  Vietnam: ['viet nam', 'socialist republic of vietnam'],
  Brunei: ['brunei darussalam'],
  Tanzania: ['united republic of tanzania'],
  Moldova: ['republic of moldova'],
  Bolivia: ['plurinational state of bolivia'],
  Venezuela: ['bolivarian republic of venezuela'],
  'Saudi Arabia': ['ksa', 'kingdom of saudi arabia'],
  'United Arab Emirates': ['uae', 'emirates'],
  Egypt: ['arab republic of egypt'],
  Ireland: ['republic of ireland', 'eire'],
  Slovakia: ['slovak republic'],
  Kyrgyzstan: ['kyrgyz republic', 'kirghizia'],

  // — Endonyms —
  Germany: ['deutschland'],
  Spain: ['espana'],
  Japan: ['nippon', 'nihon'],
  Greece: ['hellas', 'hellenic republic'],
  Poland: ['polska'],
  Hungary: ['magyarorszag'],
  Finland: ['suomi'],
  Sweden: ['sverige'],
  Norway: ['norge'],
  Denmark: ['danmark'],
  Croatia: ['hrvatska'],
  Georgia: ['sakartvelo'],
  Brazil: ['brasil'],
  Mexico: ['estados unidos mexicanos'],
  'New Zealand': ['nz', 'aotearoa'],
  Switzerland: ['swiss confederation', 'helvetia'],

  // — Former names —
  'Sri Lanka': ['ceylon'],
  Cambodia: ['kampuchea'],
  Ethiopia: ['abyssinia'],
  Zimbabwe: ['rhodesia', 'southern rhodesia'],
  Zambia: ['northern rhodesia'],
  Malawi: ['nyasaland'],
  Namibia: ['south west africa'],
  Lesotho: ['basutoland'],
  Botswana: ['bechuanaland'],
  Benin: ['dahomey'],
  'Burkina Faso': ['upper volta'],
  Ghana: ['gold coast'],
  Belize: ['british honduras'],
  Guyana: ['british guiana'],
  Suriname: ['dutch guiana', 'surinam'],
  Vanuatu: ['new hebrides'],
  Tuvalu: ['ellice islands'],
  Kiribati: ['gilbert islands'],
  Samoa: ['western samoa'],
  Belarus: ['byelorussia', 'white russia'],

  // — Compound names people shorten —
  'Bosnia and Herzegovina': ['bosnia', 'herzegovina', 'bih'],
  'Trinidad and Tobago': ['trinidad', 'tobago'],
  'Antigua and Barbuda': ['antigua', 'barbuda'],
  'Saint Kitts and Nevis': ['st kitts', 'st kitts and nevis', 'nevis'],
  'Saint Lucia': ['st lucia'],
  'Saint Vincent and the Grenadines': ['st vincent', 'st vincent and the grenadines', 'grenadines'],
  'Papua New Guinea': ['png'],
  'São Tomé and Príncipe': ['sao tome', 'sao tome and principe'],
  'Guinea-Bissau': ['guinea bissau'],
  'Equatorial Guinea': ['eq guinea'],
  'Dominican Republic': ['dominican rep'],
  'Central African Republic': ['central african rep'],
  'Solomon Islands': ['solomons'],
  'Marshall Islands': ['marshalls'],
  'Hong Kong': ['hk', 'hong kong sar'],

  // — Articles people include —
  Bahamas: ['the bahamas'],
  Gambia: ['the gambia'],
  Philippines: ['the philippines', 'pilipinas'],
  Maldives: ['the maldives'],
  Comoros: ['the comoros'],
  Ukraine: ['the ukraine'],

  // — Frequent misspellings —
  Colombia: ['columbia'],
  Cameroon: ['cameroun'],
  Chad: ['tchad'],
};
