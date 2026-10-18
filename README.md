# AI Financial Advisor — initial proof of concept

A small React Native / Expo implementation based on sections 5–7 of `../latex/AI_Financial_Advisor_Proposal.tex`. It demonstrates the core flow: conversational entry → transaction categorization → updated financial summary.

## Run

Use Node.js 22 LTS or newer supported LTS, then from this directory:

```sh
npm install
npm start
```

Open with an Expo Go version compatible with SDK 55, or use an iOS/Android development build. For a quick browser demo, run `npm run web`. Expo SDK 55 uses React Native 0.83 and React 19.2; see the [Expo SDK reference](https://docs.expo.dev/versions/v55.0.0/).

## Short demonstration

1. Tap `Received 15000 salary`, then **Add transaction**.
2. Add `Spent 120 on lunch`.
3. Add `دفعت ٥٠ مواصلات`.
4. The summary shows income of EGP 15,000, expenses of EGP 170, and a balance of EGP 14,830. Food is the largest expense category.
5. Remove an entry and watch the totals update. Try an invalid message to see validation.

## Initial “10%” milestone

This is an approximate project milestone, not a measured percentage of the eventual codebase. Implemented: one mobile screen, basic English/Arabic transaction input (including Arabic digits), keyword categorization, session totals, a spending observation, validation, and transaction removal. The app starts empty and never connects to a financial account.

The parser is deterministic, **not an AI model**. It supports one positive EGP amount per entry, simple income/expense keywords, and a small category vocabulary. It does not understand arbitrary conversation, dates, refunds, transfers, multiple transactions, or full Arabic language variations. Unknown expense categories become Other. Entries are in memory only; reloading resets them. Totals cover the current session, not a monthly budget.

Future milestones: Node.js API and MySQL persistence/authentication; LLM extraction with confirmation before saving; budgeting and savings goals; historical analytics/forecasting; verified Egyptian economic data; voice and consent-based SMS input. No API keys are needed for this draft. Future LLM credentials belong on the backend.

## Files and checks

- `App.js`: mobile UI and session state.
- `src/finance.cjs`: replaceable parser, totals, and spending summary; money is stored as integer piastres.
- `tests/finance.test.cjs`: parser validation and dashboard calculation checks.

Run `npm test` (no external test framework needed). Build the browser bundle with `npx expo export --platform web`. Native device behavior should also be checked before presenting the mobile demo.
