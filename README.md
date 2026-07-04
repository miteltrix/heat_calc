# Heat Exchange Calculator

Browser-based calculator for heat transfer from a hot storage tank through a pipe wall into a fluid flowing inside the pipe.

## Current Model

### Physics Overview

![Heat storage tank and pipe model](docs/images/heat-storage-pipe-model.svg)

The pipe-side heat transfer is calculated with the standard heat exchanger form:

```math
Q = U A_o \Delta T_{lm}
```

| Symbol | Meaning | Unit |
| --- | --- | --- |
| `Q` | heat transfer rate | W |
| `U` | overall heat transfer coefficient | W/m2 K |
| `A_o` | outside pipe surface area | m2 |
| `Delta T_lm` | log mean temperature difference, LMTD | K |

For the hot storage tank boundary, the temperature differences are:

```math
\Delta T_1 = T_{tank,max} - T_{in}
```

```math
\Delta T_2 = T_{tank,max} - T_{out}
```

```math
\Delta T_{lm} =
\frac{\Delta T_1 - \Delta T_2}
{\ln \left( \frac{\Delta T_1}{\Delta T_2} \right)}
```

The fluid-side energy balance is shown as a check:

```math
Q_{fluid} = \dot{m} c_p \left(T_{out} - T_{in}\right)
```

If `Q` and `Q_fluid` are far apart, the chosen pipe length, flow speed, outlet temperature, or target heat transfer is not physically balanced yet.

### Thermal Resistance Model

![Thermal resistance model](docs/images/thermal-resistance-model.svg)

The calculator treats the pipe as a cylindrical heat-transfer path. The total thermal resistance is:

```math
R_{total} = R_{outside} + R_{wall} + R_{inside}
```

Inside convection:

```math
R_{inside} = \frac{1}{\alpha_i A_i}
```

```math
A_i = \pi D_i L
```

Pipe wall conduction:

```math
R_{wall} =
\frac{\ln \left( D_o / D_i \right)}
{2 \pi k_{pipe} L}
```

```math
D_o = D_i + 2s
```

Outside medium:

```math
R_{outside,fluid} = \frac{1}{\alpha_o A_o}
```

```math
R_{outside,solid} =
\frac{\ln \left( D_s / D_o \right)}
{2 \pi k_{medium} L}
```

```math
A_o = \pi D_o L
```

Overall coefficient:

```math
U = \frac{1}{R_{total} A_o}
```

```math
U A_o = \frac{1}{R_{total}}
```

### Nusselt And Alpha Estimate

![Nusselt number and alpha workflow](docs/images/nusselt-alpha-workflow.svg)

When a manual alpha value is not provided, the calculator estimates alpha from fluid properties and flow:

```math
Re = \frac{vD}{\nu}
```

```math
Pr = \frac{c_p \rho \nu}{k}
```

```math
\alpha = \frac{Nu \, k}{D}
```

| Symbol | Meaning | Unit |
| --- | --- | --- |
| `Re` | Reynolds number | dimensionless |
| `Pr` | Prandtl number | dimensionless |
| `Nu` | Nusselt number | dimensionless |
| `v` | fluid velocity | m/s |
| `D` | pipe diameter used by the correlation | m |
| `nu` | kinematic viscosity | m2/s internally |
| `rho` | density | kg/m3 |
| `cp` | heat capacity | J/kg K |
| `k` | fluid thermal conductivity | W/m K |
| `alpha` | convection coefficient | W/m2 K |

The UI accepts kinematic viscosity in `mm2/s` because that is common in datasheets. The calculator converts it to `m2/s` internally.

Nusselt estimate used in the current version:

```math
Nu_{laminar} = 3.66
```

```math
Nu_{turbulent} = 0.023 Re^{0.8} Pr^n
```

```math
n =
\begin{cases}
0.4 & \text{fluid is heated} \\
0.3 & \text{fluid is cooled}
\end{cases}
```

For transition flow between `Re = 2300` and `Re = 10000`, the app blends between the laminar and turbulent estimates. This is useful for simulation, but final engineering design should verify the correlation against the real geometry and operating range.

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
