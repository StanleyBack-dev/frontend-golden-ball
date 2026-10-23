import type {
  CompetitionCategory,
  LeaderboardSortField,
  StatsScope,
} from "../../../api/player-stats";

export const SCOPE_OPTIONS: { value: StatsScope; label: string }[] = [
  { value: "ALL", label: "Tudo" },
  { value: "CLUB", label: "Clubes" },
  { value: "LEAGUE", label: "Ligas" },
  { value: "CONTINENTAL", label: "Continentais" },
  { value: "DOMESTIC_CUP", label: "Copas nacionais" },
  { value: "NATIONAL_TEAM", label: "Seleção" },
];

export const CATEGORY_LABELS: Record<CompetitionCategory, string> = {
  LEAGUE: "Liga",
  DOMESTIC_CUP: "Copa nacional",
  CONTINENTAL: "Continental",
  NATIONAL_TEAM: "Seleção",
  OTHER: "Outra",
};

export const POSITION_OPTIONS = [
  "Atacante",
  "Meio-campista",
  "Lateral",
  "Zagueiro",
] as const;

export const MIN_MINUTES_OPTIONS = [
  { value: 0, label: "Qualquer minutagem" },
  { value: 450, label: "450+ min" },
  { value: 900, label: "900+ min" },
  { value: 1800, label: "1.800+ min" },
  { value: 2700, label: "2.700+ min" },
] as const;

export const SORT_LABELS: Record<LeaderboardSortField, string> = {
  GOALS: "Gols",
  ASSISTS: "Assistências",
  GOAL_CONTRIBUTIONS: "Gols + assistências",
  GAMES: "Jogos",
  MINUTES: "Minutos",
  GOALS_PER_90: "Gols por 90 min",
  CONTRIBUTIONS_PER_90: "G+A por 90 min",
  AVERAGE_RATING: "Nota média",
};

// The provider names tournaments in English; the best-known ones read
// better in Portuguese. Anything else is shown as the provider sends it.
const COMPETITION_NAMES: Record<string, string> = {
  "World Cup": "Copa do Mundo 2026",
  "UEFA Champions League": "Champions League",
  "UEFA Europa League": "Europa League",
  "UEFA Super Cup": "Supercopa da UEFA",
  "FIFA Intercontinental Cup": "Copa Intercontinental",
  "FIFA Club World Cup": "Mundial de Clubes",
  "Copa del Rey": "Copa do Rei",
  Supercopa: "Supercopa da Espanha",
  "FA Cup": "Copa da Inglaterra",
  "EFL Cup": "Copa da Liga Inglesa",
  "Coupe de France": "Copa da França",
  "Trophée des Champions": "Supercopa da França",
  "DFB-Pokal": "Copa da Alemanha",
  "Franz-Beckenbauer-Supercup": "Supercopa da Alemanha",
  "Coppa Italia": "Copa da Itália",
  "Italy Cup": "Copa da Itália",
  "King's Cup": "Copa do Rei Saudita",
  "Saudi Super Cup": "Supercopa Saudita",
  "Supercoppa Italiana": "Supercopa da Itália",
};

export const competitionName = (name: string) =>
  COMPETITION_NAMES[name] ?? name;

const TEAM_NAMES: Record<string, string> = {
  Algeria: "Argélia",
  Argentina: "Argentina",
  Austria: "Áustria",
  Belgium: "Bélgica",
  Brazil: "Brasil",
  "Cape Verde": "Cabo Verde",
  Colombia: "Colômbia",
  "Congo DR": "RD Congo",
  Croatia: "Croácia",
  Curaçao: "Curaçao",
  "Czech Republic": "Tchéquia",
  Ecuador: "Equador",
  England: "Inglaterra",
  France: "França",
  Georgia: "Geórgia",
  Germany: "Alemanha",
  Ghana: "Gana",
  Haiti: "Haiti",
  Iraq: "Iraque",
  Italy: "Itália",
  "Ivory Coast": "Costa do Marfim",
  Japan: "Japão",
  Mexico: "México",
  Morocco: "Marrocos",
  Netherlands: "Holanda",
  Norway: "Noruega",
  Panama: "Panamá",
  Portugal: "Portugal",
  "Saudi Arabia": "Arábia Saudita",
  Scotland: "Escócia",
  Senegal: "Senegal",
  "South Africa": "África do Sul",
  "South Korea": "Coreia do Sul",
  Spain: "Espanha",
  Switzerland: "Suíça",
  "United States": "Estados Unidos",
  USA: "Estados Unidos",
  Uruguay: "Uruguai",
  Uzbekistan: "Uzbequistão",
};

/** National teams in Portuguese; club names stay as they are. */
export const teamName = (name: string) => TEAM_NAMES[name] ?? name;
