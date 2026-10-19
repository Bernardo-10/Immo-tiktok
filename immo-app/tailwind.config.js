/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Vert forêt profond — remplace l'emerald par défaut de Tailwind,
        // trop générique. Couleur de marque : boutons primaires, états actifs.
        brand: {
          50: '#EAF3EE',
          100: '#CFE6D9',
          200: '#A0CDB4',
          300: '#6FB18E',
          400: '#3F9670',
          500: '#1F7D57',
          600: '#0B6E4F',
          700: '#095A41',
          800: '#074534',
          900: '#053327',
        },
        // Terre cuite — accent secondaire (boost, alertes chaleureuses),
        // clin d'œil discret au contexte camerounais sans être littéral.
        clay: {
          50: '#FBEEE9',
          100: '#F3D2C4',
          400: '#D97A50',
          500: '#C1502E',
          600: '#A63F22',
        },
        paper: '#FAF7F2',       // fond de page — blanc cassé chaud, pas blanc pur
        surface: '#FFFFFF',     // cartes, champs, boutons pleins
        ink: '#211F1C',         // texte principal
        'ink-muted': '#6E6A63', // texte secondaire
        line: '#DEDACF',        // bordures
        chip: '#EFEAE0',        // fond des boutons/puces non sélectionnés
      },
      borderColor: {
        DEFAULT: '#DEDACF',
      },
    },
  },
  plugins: [],
};
