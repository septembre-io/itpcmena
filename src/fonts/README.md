# Polices auto-hébergées

Chargées par `next/font/local` dans `src/app/[locale]/layout.tsx`. Le build ne
contacte plus Google Fonts (les builds Turbopack échouaient quand Google
renvoyait des URL `fonts.gstatic.com/l/font?kit=…&skey=…`).

| Fichier | Famille | Axes | Sous-ensemble |
|---|---|---|---|
| plus-jakarta-sans-latin.woff2 | Plus Jakarta Sans 2.071, normal | wght 200–800 | latin |
| newsreader-latin.woff2 | Newsreader 1.003, normal | wght 200–800 (opsz fixé à 18) | latin |
| newsreader-italic-latin.woff2 | Newsreader 1.003, italique | wght 200–800 (opsz fixé à 18) | latin |

Ce sont les fichiers que Google Fonts servait au build le 10/11/2026 pour la
configuration précédente (`subsets: ["latin"]`), récupérés tels quels : rendu et
poids identiques. Plage latin : U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC,
U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,
U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD. Les caractères hors plage
(ă, ș…) s'affichent dans la police de repli.

Licence : SIL Open Font License 1.1 (OFL-*.txt).

Pour régénérer (même requête que next/font/google) :

```sh
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
curl -A "$UA" 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
curl -A "$UA" 'https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;1,400;1,500&display=swap'
# puis télécharger les URL des blocs /* latin */
```
