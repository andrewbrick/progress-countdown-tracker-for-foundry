# Progress/Countdown Tracker for Foundry
A compact, collapsable overlay for progress and countdown/consequence trackers. Useful for Daggerheart™ or any game in which you wish to track progress or countdowns (skill challenges, crafting, etc.). Foundry v13 only.

![GM Tracker](./screenshots/tictac-tracker-gm2.jpg)

Within the window, the GM can:
- add and delete trackers
- change tracker names, types, and visibility for players
- shrink and grow the number of 'pips' each tracker has
- increment and decrement each tracker
- re-order trackers with drag-handlebars (client-scoped)

In the module settings, you can:
- change the icons (a font awesome string without quotes, e.g. fa-solid fa-burst) used for progress and consequence trackers (client-scoped)
- change the font for the window (client-scoped)
- change the colors of 'pips' for progress and consequence trackers (client-scoped)

Other notes:
- new trackers are invisible to players when created (indicated by partial opacity in the GM view), allowing the GM to configure them before they're made visible
- when players have the window minimized (collapsed), a warning will show whenever a tracker is updated; this warning goes away when the player expands the window
- when the GM makes a tracker visible, the window is expanded (uncollapsed) so players are aware
- players can re-order their own trackers, but they can't change anything else about the trackers
- window is sized dynamically to fit tracker names and the number of 'pips' for a uniform look
- each tracker can have between 1 and 24 'pips'

Player view:

![Player Tracker](./screenshots/tictac-tracker-player1.jpg)

Collapsed:

![Collapsed](./screenshots/tictac-tracker-collapsed.jpg)

Player warning on tracker change (if collapsed):

![Collapsed Warning](./screenshots/tictac-tracker-collapsed-warning.jpg)

Quick-start guide:

![How to](./screenshots/tictac-tracker-howto.jpg)

Settings:

![Module Settings](./screenshots/tictac-tracker-settings.jpg)
