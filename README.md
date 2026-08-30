# BA13 Pro Planner

Create a professional responsive web app called “BA13 Calculateur Pro” for calculating materials needed for drywall/BA13 projects. Build the first working MVP, in French, with a clean construction-industry interface and metric units. Main workflow: choose project type (cloison simple parement, cloison double parement, faux plafond, doublage), enter dimensions and configuration, calculate quantities, then show a detailed shopping list and estimated material cost. For cloison calculations, support length, height, stud spacing 40/60 cm, profile size (M48/R48 initially), number of plasterboard layers per side (1 or 2), optional insulation, doors/windows openings, and waste percentage. Calculate boards, rails, studs, screws, joint tape, joint compound, fixings, and insulation. Round purchase quantities intelligently to whole boards/standard profile lengths where appropriate. Include editable unit prices in MAD, totals HT, TVA 20%, and TTC. Include a clear disclaimer that quantities are indicative and should be validated against the selected manufacturer system/technical documentation. Use calculation rules based on manufacturer guidance: studs commonly at 60 cm, 40 cm where required; rails fixed at max 60 cm; screws at 30 cm; board area factor and indicative consumables should be configurable rather than hard-coded. Create a dashboard-like single-page UX with a project form on the left and live results on the right, plus a materials table, cost summary, reset button, and print/export-ready results. Make the calculation engine modular so ceiling and other project types can be added next. Do not invent manufacturer-specific structural limits; keep assumptions editable and clearly labeled. Use French labels throughout and make the UI polished and usable on mobile.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ae754ee4-74fd-4fd4-9d8a-c1add31dfcde).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
