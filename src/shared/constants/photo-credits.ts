/**
 * Player photos in public/players/ come from Wikimedia Commons under free
 * licenses, which require crediting the author and the license. Shown in the
 * page footer.
 */
export interface PhotoCredit {
  author: string;
  license: string;
  licenseUrl: string;
  /** Commons file page. */
  source: string;
}

export const PHOTO_CREDITS: Record<string, PhotoCredit> = {
  "jude-bellingham": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Jude_Bellingham_England_v_Ghana_23_June_2026-061_(cropped).jpg",
  },
  "pau-cubarsi": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Pau_Cubarsi_Argentina_v_Spain_19_July_2026-181_(cropped).jpg",
  },
  "marc-cucurella": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Marc_Cucurella_Argentina_v_Spain_19_July_2026-064_(cropped).jpg",
  },
  "ousmane-dembele": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Ousmane_Dembele_France_v_Senegal_16_June_2026-341_(cropped)_2.jpg",
  },
  "luis-diaz": {
    author: "Werner100359",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_(2026-01-06_Testspiel)_40_(Luiz_D%C3%ADaz).jpg",
  },
  "bruno-fernandes": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Bruno_Fernandes_USMNT_v_Portugal_Mar_31_2026-27_(cropped).jpg",
  },
  "gabriel-magalhaes": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Gabriel_Magalhaes_Brazil_V_Morocco_13_June_2026-132_(cropped).jpg",
  },
  "erling-haaland": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Erling_Haaland_Morocco_v_Norway_7_June_2026-51.jpg",
  },
  "achraf-hakimi": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Achraf_Hakimi_Morocco_v_Norway_7_June_2026-16.jpg",
  },
  "harry-kane": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Harry_Kane_England_v_Ghana_23_June_2026-024_(cropped).jpg",
  },
  "khvicha-kvaratskhelia": {
    author: "Paté kroute",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    source:
      "https://commons.wikimedia.org/wiki/File:Kvaratskhelia_asse_psg_2425.png",
  },
  "lamine-yamal": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Lamine_Yamal_France_v_Spain_7.24.26-142.jpg",
  },
  "sadio-mane": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Sadio_Mane_France_v_Senegal_16_June_2026-450.jpg",
  },
  marquinhos: {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Marquinhos_Brazil_V_Morocco_13_June_2026-153_(cropped).jpg",
  },
  "lautaro-martinez": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Lautaro_Martinez_Argentina_v_Spain_19_July_2026-049_(cropped).jpg",
  },
  "kylian-mbappe": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Kylian_Mbappe_France_v_Senegal_16_June_2026-391_(cropped).jpg",
  },
  "nuno-mendes": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Nuno_Mendes_Croatia_v_Portugal_2_July_2026-135_(cropped).jpg",
  },
  "lionel-messi": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Leo_Messi_Argentina_v_Egypt_7_July_2026-1.jpg",
  },
  "joao-neves": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Joao_Neves_Croatia_v_Portugal_2_July_2026-102.jpg",
  },
  "michael-olise": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Michael_Olise_France_v_Senegal_16_June_2026-307_(cropped).jpg",
  },
  "willian-pacho": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Willian_Pacho_Ecuador_v_Germany_25_June_2026-228.jpg",
  },
  "julian-quinones": {
    author: "Selección Nacional de México",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Juli%C3%A1n_Qui%C3%B1ones.png",
  },
  "declan-rice": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Declan_Rice_England_v_Ghana_23_June_2026-150.jpg",
  },
  rodri: {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Rodri_Argentina_v_Spain_19_July_2026-187_(cropped).jpg",
  },
  "fabian-ruiz": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Fabian_Ruiz_Argentina_v_Spain_19_July_2026-315.jpg",
  },
  "william-saliba": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:William_Saliba_France_v_Paraguay_4_July_2026-183.jpg",
  },
  "ferran-torres": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Ferran_Torres_France_v_Spain_7.24.26-237_(cropped).jpg",
  },
  "dayot-upamecano": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Dayot_Upamecano_France_v_Senegal_16_June_2026-402_(cropped).jpg",
  },
  "vinicius-junior": {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Vin%C3%ADcius_J%C3%BAnior_Brazil_V_Morocco_13_June_2026-207_(cropped).jpg",
  },
  vitinha: {
    author: "Bryan Berlin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Vitinha_USMNT_v_Portugal_Mar_31_2026-50_(cropped).jpg",
  },
};
