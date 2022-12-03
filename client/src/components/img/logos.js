import MET from './MET.png';
import CEN from './CEN.png';
import PAC from './PAC.png';
import ATL from './ATL.png';

// https://records.nhl.com/site/api/franchise?include=teams.id&include=teams.active&include=teams.triCode&include=teams.placeName&include=teams.commonName&include=teams.fullName&include=teams.logos&include=teams.conference.name&include=teams.division.name&include=teams.franchiseTeam.firstSeason.id&include=teams.franchiseTeam.lastSeason.id&include=teams.franchiseTeam.teamCommonName

export const logos = {
  8: 'https://assets.nhle.com/logos/nhl/svg/MTL_light.svg',
  41: 'https://assets.nhle.com/logos/nhl/svg/MWN_19171918_light.svg',
  36: 'https://assets.nhle.com/logos/nhl/svg/SEN_19171918-19331934_light.svg',
  45: 'https://assets.nhle.com/logos/nhl/svg/SLE_19341935_dark.svg',
  37: 'https://assets.nhle.com/logos/nhl/svg/HAM_19231924-19241925_light.svg',
  42: 'https://assets.nhle.com/logos/nhl/svg/QBD_19191920_light.svg',
  10: 'https://assets.nhle.com/logos/nhl/svg/TOR_alt.svg',
  57: 'https://assets.nhle.com/logos/nhl/svg/TAN_19171918-19181919_light.svg',
  58: 'https://assets.nhle.com/logos/nhl/svg/TSP_19261927_dark.svg',
  6: 'https://assets.nhle.com/logos/nhl/svg/BOS_alt.svg',
  43: 'https://assets.nhle.com/logos/nhl/svg/MMR_19351936-19371938_dark.svg',
  44: 'https://assets.nhle.com/logos/nhl/svg/NYA_19401941_light.svg',
  51: 'https://assets.nhle.com/logos/nhl/svg/BRK_19411942_light.svg',
  38: 'https://assets.nhle.com/logos/nhl/svg/PIR_19291930_light.svg',
  39: 'https://assets.nhle.com/logos/nhl/svg/QUA_19301931_dark.svg',
  3: 'https://assets.nhle.com/logos/nhl/svg/NYR_dark.svg',
  16: 'https://assets.nhle.com/logos/nhl/svg/CHI_dark.svg',
  17: 'https://assets.nhle.com/logos/nhl/svg/DET_dark.svg',
  40: 'https://assets.nhle.com/logos/nhl/svg/DCG_19261927-19291930_light.svg',
  50: 'https://assets.nhle.com/logos/nhl/svg/DFL_19301931-19311932_light.svg',
  46: 'https://assets.nhle.com/logos/nhl/svg/OAK_19671968-19691970_light.svg',
  49: 'https://assets.nhle.com/logos/nhl/svg/CLE_19761977-19771978_dark.svg',
  56: 'https://assets.nhle.com/logos/nhl/svg/CGS_19741975-19761977_light.svg',
  26: 'https://assets.nhle.com/logos/nhl/svg/LAK_light.svg',
  25: 'https://assets.nhle.com/logos/nhl/svg/DAL_light.svg',
  31: 'https://assets.nhle.com/logos/nhl/svg/MNS_19911992-19921993_light.svg',
  4: 'https://assets.nhle.com/logos/nhl/svg/PHI_dark.svg',
  5: 'https://assets.nhle.com/logos/nhl/svg/PIT_light.svg',
  19: 'https://assets.nhle.com/logos/nhl/svg/STL_black.svg',
  7: 'https://assets.nhle.com/logos/nhl/svg/BUF_light.svg',
  23: 'https://assets.nhle.com/logos/nhl/svg/VAN_light.svg',
  20: 'https://assets.nhle.com/logos/nhl/svg/CGY_alt.svg',
  47: 'https://assets.nhle.com/logos/nhl/svg/AFM_19721973-19791980_light.svg',
  2: 'https://assets.nhle.com/logos/nhl/svg/NYI_light.svg',
  1: 'https://assets.nhle.com/logos/nhl/svg/NJD_light.svg',
  35: 'https://assets.nhle.com/logos/nhl/svg/CLR_19761977-19811982_light.svg',
  48: 'https://assets.nhle.com/logos/nhl/svg/KCS_19741975-19761977_dark.svg',
  15: 'https://assets.nhle.com/logos/nhl/svg/WSH_light.svg',
  22: 'https://assets.nhle.com/logos/nhl/svg/EDM_dark.svg',
  12: 'https://assets.nhle.com/logos/nhl/svg/CAR_light.svg',
  34: 'https://assets.nhle.com/logos/nhl/svg/HFD_19921993-19961997_dark.svg',
  21: 'https://assets.nhle.com/logos/nhl/svg/COL_light.svg',
  32: 'https://assets.nhle.com/logos/nhl/svg/QUE_19791980-19941995_light.svg',
  27: 'https://assets.nhle.com/logos/nhl/svg/PHX_20032004-20132014_light.svg',
  33: 'https://assets.nhle.com/logos/nhl/svg/WIN_19901991-19951996_light.svg',
  53: 'https://assets.nhle.com/logos/nhl/svg/ARI_light.svg',
  28: 'https://assets.nhle.com/logos/nhl/svg/SJS_light.svg',
  9: 'https://assets.nhle.com/logos/nhl/svg/OTT_light.svg',
  14: 'https://assets.nhle.com/logos/nhl/svg/TBL_light.svg',
  24: 'https://assets.nhle.com/logos/nhl/svg/ANA_dark.svg',
  13: 'https://assets.nhle.com/logos/nhl/svg/FLA_light.svg',
  18: 'https://assets.nhle.com/logos/nhl/svg/NSH_dark.svg',
  11: 'https://assets.nhle.com/logos/nhl/svg/ATL_19992000-20102011_light.svg',
  52: 'https://assets.nhle.com/logos/nhl/svg/WPG_light.svg',
  29: 'https://assets.nhle.com/logos/nhl/svg/CBJ_light.svg',
  30: 'https://assets.nhle.com/logos/nhl/svg/MIN_dark.svg',
  54: 'https://assets.nhle.com/logos/nhl/svg/VGK_light.svg',
  55: 'https://assets.nhle.com/logos/nhl/svg/SEA_dark.svg',
  60: 'Canada', //
  61: 'Czech Republic', //
  62: 'Finland', //
  63: 'Germany', //
  64: 'Russia', //
  65: 'Slovakia', //
  66: 'Sweden', //
  67: 'United States', //
  80: 'Helsinki Jokerit', //
  81: 'Stockholm Djurgarden', //
  82: 'Stockman Farjestad', //
  87: ATL,
  88: MET,
  89: CEN,
  90: PAC,
  91: 'Team Alfredsson', //
  92: 'Team Chara', //
  93: 'Team Foligno', //
  94: 'Team Toews', //
  95: 'Team Staal', //
  96: 'Team Lidstrom', //
  97: 'All-Stars East', //
  98: 'All-Stars West', //
  100: 'Young Stars East', //
  101: 'Young Stars West', //
};

export const abbrevToTeamId = {
  MTL: 8,
  MWN: 41,
  SEN: 36,
  SLE: 45,
  HAM: 37,
  QBD: 42,
  TOR: 10,
  TAN: 57,
  TSP: 58,
  BOS: 6,
  MMR: 43,
  NYA: 44,
  BRK: 51,
  PIR: 38,
  QUA: 39,
  NYR: 3,
  CHI: 16,
  DET: 17,
  DCG: 40,
  DFL: 50,
  OAK: 46,
  CLE: 49,
  CGS: 56,
  LAK: 26,
  DAL: 25,
  MNS: 31,
  PHI: 4,
  PIT: 5,
  STL: 19,
  BUF: 7,
  VAN: 23,
  CGY: 20,
  AFM: 47,
  NYI: 2,
  NJD: 1,
  CLR: 35,
  KCS: 48,
  WSH: 15,
  EDM: 22,
  CAR: 12,
  HFD: 34,
  COL: 21,
  QUE: 32,
  PHX: 27,
  WIN: 33,
  ARI: 53,
  SJS: 28,
  OTT: 9,
  TBL: 14,
  ANA: 24,
  FLA: 13,
  NSH: 18,
  ATL: 11,
  WPG: 52,
  CBJ: 29,
  MIN: 30,
  VGK: 54,
  SEA: 55,
};

export default logos;
