# Heat Exchange Calculator

Browser-based calculator for heat transfer from a hot storage tank through a pipe wall into a fluid flowing inside the pipe.

## Current Model

The primary heat-transfer equation is:

```text
Q = U * A * LMTD
```

Where:

- `Q` is heat transfer rate in W.
- `U` is the overall heat exchange coefficient in W/m2 K.
- `A` is the outside pipe surface area in m2.
- `LMTD` is the log mean temperature difference between tank temperature and pipe-fluid inlet/outlet temperatures.

For the hot storage tank boundary:

```text
deltaT1 = T_tank_max - T_fluid_in
deltaT2 = T_tank_max - T_fluid_out
LMTD = (deltaT1 - deltaT2) / ln(deltaT1 / deltaT2)
```

The fluid-side energy check is:

```text
Q_fluid = mass_flow * cp * (T_fluid_out - T_fluid_in)
```

The inside heat-transfer coefficient is estimated from Reynolds, Prandtl, and Nusselt numbers when manual alpha is blank.

## Features

- Three input groups: fluid in pipe, pipe, and medium around pipe.
- Temperature units can be changed between Celsius, Kelvin, and Fahrenheit.
- Fluid and material presets are editable after selection.
- Missing or invalid inputs are highlighted and listed by group.
- Solver can calculate heat rate, overall coefficient, fluid temperature rise, pipe length, outlet temperature, fluid velocity, and outside alpha.
- Velocity sweep table for simulation.
- Project profiles such as `House` and `Power facility`, each with separate saved experiments.
- Saved experiments use browser local storage for now.

## Run Locally

Open `index.html` directly in a browser, or run the static server:

```bash
npm start
```

Then open:

```text
http://localhost:8090
```

Use a different port:

```bash
PORT=3000 npm start
```

## Linux Server

Copy this folder to the server, install Node.js 18 or newer, then run:

```bash
npm start
```

For a persistent service, run it behind Nginx or a process manager such as systemd or pm2. The app listens on `0.0.0.0` by default and uses `PORT=8090` unless another port is set.

## Docker

```bash
docker build -t heat-exchange-calculator .
docker run -p 8090:8090 heat-exchange-calculator
```

## GitHub

From this folder:

```bash
git init
git add .
git commit -m "Initial heat exchange calculator"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Formula References

- LMTD: https://en.wikipedia.org/wiki/Logarithmic_mean_temperature_difference
- Nusselt number and pipe-flow correlations: https://en.wikipedia.org/wiki/Nusselt_number

For engineering use, verify selected correlations and material properties against design standards or manufacturer data before committing to hardware.
