# Return Period Simulator

An interactive risk communication tool that teaches how return periods and Annual Exceedance Probabilities (AEP) translate into real-world likelihood across different decision timeframes.

Built for [Resilience Explorer®](https://resilience-explorer.com) by Urban Intelligence.

## What it does

Most people hear "1-in-100-year flood" and assume it happens once a century. This tool demonstrates why that framing misleads: each year is an independent draw with a fixed probability, and the chance of experiencing at least one event grows substantially over the life of a home, asset, or plan.

Users can:
- Select a return period (2–500 years)
- Choose a decision timeframe (1 year to 100 years) mapped to real contexts — mortgage, election cycle, infrastructure asset life
- Step through a simulated future year by year, or run all years at once
- Compare many simulated futures to see how outcomes vary
- Read the cumulative probability expressed as a frequency ("about 1 in 4") alongside a plain-language likelihood label

The teaching panel covers:
- Why "1-in-100-year" is a misnomer and how ARI and AEP relate
- Why the annual probability frame understates risk for most decisions
- The research case for using numbers and frequencies over verbal labels alone (Peters et al., 2025)
- The IPCC qualitative likelihood framework used for labels
- How climate change is shifting historical return period baselines

## Tech

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Deployment

Pushes to `main` automatically build and deploy to GitHub Pages via the included Actions workflow.

The live URL will be:
```
https://uintel.github.io/return-period-simulator/
```

To enable: go to **Settings → Pages → Source** and select **GitHub Actions**.

## Embedding

The built app is a self-contained static site — no server required. Embed it in any website via iframe:

```html
<iframe
  src="https://uintel.github.io/return-period-simulator/"
  width="100%"
  height="900"
  style="border:none;"
/>
```

## The component

`src/ReturnPeriodSimulator.tsx` is a self-contained embeddable React component. If your target site already runs React with Tailwind, Framer Motion, and Lucide React, you can import it directly without the surrounding Vite project.

## References

- Peters, E., Blow, A., Chapman, D. A., & Shoots-Reinhard, B. (2025). The power of numbers in natural hazard communication. *Journal of Risk Research*. https://doi.org/10.1080/13669877.2025.2512082
- IPCC Guidance Note on Consistent Treatment of Uncertainties (AR5)
- Ministry for the Environment, *Coastal Hazards and Climate Change Guidance for Local Government* (2017), Appendix F
