const fluidPresets = {
  custom: { label: "Custom / manual fluid", custom: true },
  water20: { label: "Water at 20 deg C", density: 998, viscosity: 1.004, cp: 4182, k: 0.598, min: 0, max: 100 },
  water60: { label: "Water at 60 deg C", density: 983, viscosity: 0.475, cp: 4185, k: 0.653, min: 0, max: 100 },
  glycol40: { label: "Ethylene glycol 40%", density: 1050, viscosity: 3.1, cp: 3500, k: 0.40, min: -25, max: 120 },
  air20: { label: "Air at 20 deg C", density: 1.204, viscosity: 15.1, cp: 1006, k: 0.0257, min: -40, max: 200 },
  oil: { label: "Thermal oil", density: 860, viscosity: 32, cp: 2100, k: 0.13, min: -20, max: 300 }
};

const pipePresets = {
  custom: { label: "Custom / manual pipe material", custom: true },
  stainless: { label: "Stainless steel", k: 16 },
  carbon: { label: "Carbon steel", k: 45 },
  copper: { label: "Copper", k: 385 },
  aluminum: { label: "Aluminum", k: 205 },
  pex: { label: "PEX / polymer", k: 0.40 },
  glass: { label: "Glass", k: 1.05 }
};

const solidPresets = {
  custom: { label: "Custom / manual solid medium", custom: true },
  concrete: { label: "Concrete", k: 1.4, min: -20, max: 200 },
  soil: { label: "Moist soil", k: 1.5, min: -10, max: 60 },
  sand: { label: "Dry sand", k: 0.27, min: -20, max: 180 },
  insulation: { label: "Mineral wool insulation", k: 0.04, min: -50, max: 250 },
  ice: { label: "Ice", k: 2.2, min: -30, max: 0 }
};

const ids = [
  "temperatureUnit", "solveFor", "insidePreset", "insideDensity", "insideViscosity", "insideCp",
  "insideK", "insidePr", "fluidVelocity", "fluidInletTemp", "fluidOutletTemp", "insideMinTemp",
  "insideMaxTemp", "insideAlpha", "pipePreset", "pipeLength", "innerDiameter", "wallThickness",
  "pipeK", "heatRateTarget", "deltaT", "outsidePreset", "outsideDensity", "outsideViscosity",
  "outsideCp", "outsideK", "outsidePr", "outsideVelocity", "outsideAlpha", "outsideThickness",
  "outsideTemp", "outsideMinTemp", "outsideMaxTemp", "rangeMin", "rangeMax", "rangeSteps"
];

const el = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
const tempIds = ["fluidInletTemp", "fluidOutletTemp", "insideMinTemp", "insideMaxTemp", "outsideTemp", "outsideMinTemp", "outsideMaxTemp"];
let currentTempUnit = "C";

function num(id) {
  const raw = String(el[id].value).trim().replace(",", ".");
  if (raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function setNum(id, value, digits = 4) {
  el[id].value = Number.isFinite(value) ? Number(value.toFixed(digits)).toString() : "";
}

function toC(value, unit = currentTempUnit) {
  if (value == null) return null;
  if (unit === "K") return value - 273.15;
  if (unit === "F") return (value - 32) * 5 / 9;
  return value;
}

function fromC(value, unit = currentTempUnit) {
  if (value == null) return null;
  if (unit === "K") return value + 273.15;
  if (unit === "F") return value * 9 / 5 + 32;
  return value;
}

function dToK(value, unit = currentTempUnit) {
  if (value == null) return null;
  return unit === "F" ? value * 5 / 9 : value;
}

function dFromK(value, unit = currentTempUnit) {
  if (value == null) return null;
  return unit === "F" ? value * 9 / 5 : value;
}

function tempSuffix() {
  return currentTempUnit === "F" ? "deg F" : currentTempUnit === "K" ? "K" : "deg C";
}

function fmt(value, digits = 3, unit = "") {
  if (!Number.isFinite(value)) return "-";
  let scaledValue = value;
  let scaledUnit = unit;
  let scaledDigits = digits;

  if (unit === "kW") {
    const watts = value * 1000;
    if (Math.abs(watts) < 1000) {
      scaledValue = watts;
      scaledUnit = "W";
      scaledDigits = Math.min(digits, 2);
    } else if (Math.abs(watts) >= 1000000) {
      scaledValue = watts / 1000000;
      scaledUnit = "MW";
      scaledDigits = Math.min(digits, 3);
    }
  } else if (unit === "W/K" || unit === "W/m2 K") {
    const suffix = unit === "W/K" ? "W/K" : "W/m2 K";
    const abs = Math.abs(value);
    if (abs >= 1000000) {
      scaledValue = value / 1000000;
      scaledUnit = `MW/${suffix.slice(2)}`;
      scaledDigits = Math.min(digits, 3);
    } else if (abs >= 1000) {
      scaledValue = value / 1000;
      scaledUnit = `kW/${suffix.slice(2)}`;
      scaledDigits = Math.min(digits, 3);
    } else if (abs > 0 && abs < 1) {
      scaledValue = value * 1000;
      scaledUnit = `mW/${suffix.slice(2)}`;
      scaledDigits = Math.min(digits, 3);
    }
  } else if (unit === "K/W") {
    const abs = Math.abs(value);
    if (abs >= 1000000) {
      scaledValue = value / 1000000;
      scaledUnit = "MK/W";
      scaledDigits = Math.min(digits, 3);
    } else if (abs >= 1000) {
      scaledValue = value / 1000;
      scaledUnit = "kK/W";
      scaledDigits = Math.min(digits, 3);
    } else if (abs > 0 && abs < 0.000001) {
      scaledValue = value * 1000000000;
      scaledUnit = "nK/W";
      scaledDigits = Math.min(digits, 3);
    } else if (abs > 0 && abs < 0.001) {
      scaledValue = value * 1000000;
      scaledUnit = "uK/W";
      scaledDigits = Math.min(digits, 3);
    } else if (abs > 0 && abs < 1) {
      scaledValue = value * 1000;
      scaledUnit = "mK/W";
      scaledDigits = Math.min(digits, 3);
    }
  } else if (unit === "kg/s" && Math.abs(value) > 0 && Math.abs(value) < 1) {
    scaledValue = value * 1000;
    scaledUnit = "g/s";
    scaledDigits = Math.min(digits, 3);
  }

  const text = scaledValue.toLocaleString("en-US", {
    maximumFractionDigits: scaledDigits,
    minimumFractionDigits: 0
  });
  return `${text}${scaledUnit ? ` ${scaledUnit}` : ""}`;
}

function fillSelect(select, data) {
  select.innerHTML = "";
  Object.entries(data).forEach(([key, item]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = item.label;
    select.appendChild(option);
  });
}

function updateTempLabels() {
  const suffix = tempSuffix();
  const labels = {
    fluidInletTemp: `Fluid inlet temperature Tin (${suffix})`,
    fluidOutletTemp: `Fluid outlet temperature Tout (${suffix})`,
    insideMinTemp: `Minimum allowed fluid temperature (${suffix})`,
    insideMaxTemp: `Maximum allowed fluid temperature (${suffix})`,
    outsideTemp: `Storage tank maximum temperature (${suffix})`,
    outsideMinTemp: `Minimum allowed storage temperature (${suffix})`,
    outsideMaxTemp: `Maximum allowed storage temperature (${suffix})`,
    deltaT: `Fluid temperature rise Tout - Tin (${currentTempUnit === "F" ? "deg F difference" : "K or deg C difference"})`
  };
  Object.entries(labels).forEach(([id, label]) => {
    const span = el[id].closest(".field")?.querySelector("span");
    if (span) span.textContent = label;
  });
}

function convertTemperatureInputs(nextUnit) {
  const oldUnit = currentTempUnit;
  tempIds.forEach((id) => {
    const value = num(id);
    if (value != null) setNum(id, fromC(toC(value, oldUnit), nextUnit), 3);
  });
  const delta = num("deltaT");
  if (delta != null) setNum("deltaT", dFromK(dToK(delta, oldUnit), nextUnit), 3);
  currentTempUnit = nextUnit;
  updateTempLabels();
}

function reynolds(velocity, diameterM, viscosityMm2s) {
  return velocity * diameterM / (viscosityMm2s * 1e-6);
}

function prandtl(rho, cp, viscosityMm2s, k) {
  return cp * rho * viscosityMm2s * 1e-6 / k;
}

function nusseltInternal(re, pr, heating = true) {
  if (!Number.isFinite(re) || !Number.isFinite(pr) || re <= 0 || pr <= 0) return { nu: NaN, regime: "invalid", warning: "Re and Pr are required" };
  if (re < 2300) return { nu: 3.66, regime: "laminar", warning: re < 100 ? "very low flow" : "" };
  if (re < 10000) {
    const lam = 3.66;
    const turb = 0.023 * Math.pow(re, 0.8) * Math.pow(pr, heating ? 0.4 : 0.3);
    const blend = (re - 2300) / (10000 - 2300);
    return { nu: lam + (turb - lam) * blend, regime: "transition", warning: "transition region" };
  }
  return { nu: 0.023 * Math.pow(re, 0.8) * Math.pow(pr, heating ? 0.4 : 0.3), regime: "turbulent", warning: pr < 0.6 || pr > 160 ? "Pr outside Dittus-Boelter range" : "" };
}

function alphaFromFlow({ rho, cp, viscosity, k, pr, velocity, diameterM, heating }) {
  const prValue = pr ?? prandtl(rho, cp, viscosity, k);
  const re = reynolds(velocity, diameterM, viscosity);
  const nu = nusseltInternal(re, prValue, heating);
  return { alpha: nu.nu * k / diameterM, re, pr: prValue, nu: nu.nu, regime: nu.regime, warning: nu.warning };
}

function lmtd(dt1, dt2) {
  if (!Number.isFinite(dt1) || !Number.isFinite(dt2) || dt1 <= 0 || dt2 <= 0) return NaN;
  if (Math.abs(dt1 - dt2) < 1e-9) return dt1;
  return (dt1 - dt2) / Math.log(dt1 / dt2);
}

function outsideType() {
  return document.querySelector("input[name='outsideType']:checked").value;
}

function readInputs(overrides = {}) {
  const merged = (id) => overrides[id] ?? num(id);
  const tinC = toC(merged("fluidInletTemp"));
  let toutC = toC(merged("fluidOutletTemp"));
  const riseK = dToK(merged("deltaT"));
  if (toutC == null && tinC != null && riseK != null) toutC = tinC + riseK;
  if (toutC != null && tinC != null && riseK == null) overrides.deltaTRuntime = toutC - tinC;

  return {
    solveFor: el.solveFor.value,
    type: outsideType(),
    inside: {
      rho: merged("insideDensity"), viscosity: merged("insideViscosity"), cp: merged("insideCp"),
      k: merged("insideK"), pr: merged("insidePr"), velocity: merged("fluidVelocity"),
      alphaManual: merged("insideAlpha"), tinC, toutC,
      minC: toC(merged("insideMinTemp")), maxC: toC(merged("insideMaxTemp"))
    },
    pipe: {
      length: merged("pipeLength"), di: merged("innerDiameter") != null ? merged("innerDiameter") / 1000 : null,
      wall: merged("wallThickness") != null ? merged("wallThickness") / 1000 : null,
      k: merged("pipeK"), targetQ: merged("heatRateTarget") != null ? merged("heatRateTarget") * 1000 : null,
      riseK: riseK ?? overrides.deltaTRuntime ?? null
    },
    outside: {
      rho: merged("outsideDensity"), viscosity: merged("outsideViscosity"), cp: merged("outsideCp"),
      k: merged("outsideK"), pr: merged("outsidePr"), velocity: merged("outsideVelocity"),
      alphaManual: merged("outsideAlpha"), thickness: merged("outsideThickness") != null ? merged("outsideThickness") / 1000 : null,
      tankC: toC(merged("outsideTemp")), minC: toC(merged("outsideMinTemp")), maxC: toC(merged("outsideMaxTemp"))
    }
  };
}

function requiredForModel(input) {
  const miss = [];
  const unknown = input.solveFor;
  const req = (id, label, group, positive = true) => {
    if (unknown === id) return;
    const value = num(id);
    if (value == null || (positive && value <= 0)) miss.push({ id, label, group });
  };
  req("insideDensity", "Fluid density rho", "Fluid in pipe");
  req("insideViscosity", "Fluid kinematic viscosity nu", "Fluid in pipe");
  req("insideCp", "Fluid heat capacity cp", "Fluid in pipe");
  req("insideK", "Fluid thermal conductivity", "Fluid in pipe");
  req("fluidVelocity", "Fluid velocity", "Fluid in pipe");
  req("fluidInletTemp", "Fluid inlet temperature", "Fluid in pipe", false);
  if (unknown !== "fluidOutletTemp" && num("deltaT") == null && num("fluidOutletTemp") == null) {
    miss.push({ id: "deltaT", label: "Fluid temperature rise or outlet temperature", group: "Fluid in pipe" });
  }
  req("pipeLength", "Pipe length", "Pipe");
  req("innerDiameter", "Pipe inner diameter", "Pipe");
  req("wallThickness", "Pipe wall thickness", "Pipe");
  req("pipeK", "Pipe material thermal conductivity", "Pipe");
  req("outsideK", "Outside medium thermal conductivity", "Medium around pipe");
  req("outsideTemp", "Storage tank maximum temperature", "Medium around pipe", false);
  if (input.type === "fluid") {
    if (num("outsideAlpha") == null) {
      req("outsideDensity", "Outside fluid density rho", "Medium around pipe");
      req("outsideViscosity", "Outside fluid kinematic viscosity nu", "Medium around pipe");
      req("outsideCp", "Outside fluid heat capacity cp", "Medium around pipe");
      req("outsideVelocity", "Outside fluid velocity", "Medium around pipe");
    }
  } else {
    req("outsideThickness", "Outside solid layer thickness", "Medium around pipe");
  }
  if (["pipeLength", "fluidVelocity", "outsideAlpha", "deltaT"].includes(unknown)) {
    req("heatRateTarget", "Heat rate target dQ/dt", "Pipe");
  }
  return miss;
}

function thermalModel(input) {
  const { inside, pipe, outside } = input;
  const doM = pipe.di + 2 * pipe.wall;
  const areaI = Math.PI * pipe.di * pipe.length;
  const areaO = Math.PI * doM * pipe.length;
  const heating = outside.tankC == null || inside.tinC == null ? true : outside.tankC > inside.tinC;
  const inFlow = inside.alphaManual ? null : alphaFromFlow({ ...inside, diameterM: pipe.di, heating });
  const alphaI = inside.alphaManual ?? inFlow.alpha;
  let alphaO = null;
  let outFlow = null;
  let rOutside = 0;

  if (input.type === "fluid") {
    outFlow = outside.alphaManual ? null : alphaFromFlow({ ...outside, diameterM: doM, heating: !heating });
    alphaO = outside.alphaManual ?? outFlow.alpha;
    rOutside = 1 / (alphaO * areaO);
  } else {
    const d2 = doM + 2 * outside.thickness;
    rOutside = Math.log(d2 / doM) / (2 * Math.PI * outside.k * pipe.length);
  }

  const rInside = 1 / (alphaI * areaI);
  const rWall = Math.log(doM / pipe.di) / (2 * Math.PI * pipe.k * pipe.length);
  const rTotal = rInside + rWall + rOutside;
  const uOuter = 1 / (rTotal * areaO);
  const conductance = 1 / rTotal;
  const dtIn = outside.tankC - inside.tinC;
  const dtOut = outside.tankC - inside.toutC;
  const meanDt = lmtd(dtIn, dtOut);
  const qByUa = conductance * meanDt;
  const flowArea = Math.PI * pipe.di * pipe.di / 4;
  const massFlow = inside.rho * inside.velocity * flowArea;
  const qByFluid = massFlow * inside.cp * (inside.toutC - inside.tinC);

  return { doM, areaI, areaO, alphaI, alphaO, inFlow, outFlow, rInside, rWall, rOutside, rTotal, uOuter, conductance, dtIn, dtOut, meanDt, qByUa, massFlow, qByFluid };
}

function solveByBisection(makeValue, low, high, target, iterations = 80) {
  let fLow = makeValue(low) - target;
  let fHigh = makeValue(high) - target;
  if (!Number.isFinite(fLow) || !Number.isFinite(fHigh) || fLow * fHigh > 0) return null;
  for (let i = 0; i < iterations; i += 1) {
    const mid = (low + high) / 2;
    const fMid = makeValue(mid) - target;
    if (!Number.isFinite(fMid)) return null;
    if (Math.abs(fMid) < Math.max(0.01, Math.abs(target) * 1e-8)) return mid;
    if (fLow * fMid <= 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }
  return (low + high) / 2;
}

function solveModel() {
  const base = readInputs();
  const missing = requiredForModel(base);
  clearMissing();
  if (missing.length) return { error: missing };

  const target = base.pipe.targetQ;
  let solved = { id: base.solveFor, value: null, note: "" };
  let input = base;

  if (base.solveFor === "heatRate" || base.solveFor === "conductance") {
    const model = thermalModel(input);
    solved.value = base.solveFor === "heatRate" ? model.qByUa : model.uOuter;
    return { input, model, solved };
  }

  if (base.solveFor === "deltaT") {
    const trial = thermalModel(base);
    const rise = target / (trial.massFlow * base.inside.cp);
    input = readInputs({ deltaT: dFromK(rise), fluidOutletTemp: fromC(base.inside.tinC + rise) });
    solved = { id: "deltaT", value: rise, note: "from target Q and fluid mass flow" };
    return { input, model: thermalModel(input), solved };
  }

  if (base.solveFor === "fluidOutletTemp") {
    const maxOut = Math.min(base.outside.tankC - 0.001, base.inside.maxC ?? base.outside.tankC - 0.001);
    const root = solveByBisection((toutC) => {
      const trial = readInputs({ fluidOutletTemp: fromC(toutC), deltaT: dFromK(toutC - base.inside.tinC) });
      const m = thermalModel(trial);
      return m.qByUa - m.qByFluid;
    }, base.inside.tinC + 0.0001, maxOut, 0);
    if (root == null) return { noSolution: "Could not find an outlet temperature where pipe transfer and fluid energy balance match. Check tank temperature, velocity, or pipe length." };
    input = readInputs({ fluidOutletTemp: fromC(root), deltaT: dFromK(root - base.inside.tinC) });
    solved = { id: "fluidOutletTemp", value: root, note: "balanced Q = U*A*LMTD and m_dot*cp*dT" };
    return { input, model: thermalModel(input), solved };
  }

  if (base.solveFor === "pipeLength") {
    const root = solveByBisection((length) => thermalModel(readInputs({ pipeLength: length })).qByUa, 0.01, 10000, target);
    if (root == null) return { noSolution: "Target heat rate is outside the searchable pipe length range of 0.01 to 10000 m." };
    input = readInputs({ pipeLength: root });
    solved = { id: "pipeLength", value: root, note: "length required for target heat rate" };
    return { input, model: thermalModel(input), solved };
  }

  if (base.solveFor === "fluidVelocity") {
    const root = solveByBisection((velocity) => thermalModel(readInputs({ fluidVelocity: velocity })).qByUa, 0.001, 20, target);
    if (root == null) return { noSolution: "Target heat rate is outside the searchable velocity range of 0.001 to 20 m/s." };
    input = readInputs({ fluidVelocity: root });
    solved = { id: "fluidVelocity", value: root, note: "velocity required for target heat rate" };
    return { input, model: thermalModel(input), solved };
  }

  if (base.solveFor === "outsideAlpha") {
    const root = solveByBisection((alpha) => thermalModel(readInputs({ outsideAlpha: alpha })).qByUa, 0.1, 50000, target);
    if (root == null) return { noSolution: "Target heat rate is outside the searchable outside alpha range of 0.1 to 50000 W/m2 K." };
    input = readInputs({ outsideAlpha: root });
    solved = { id: "outsideAlpha", value: root, note: "outside alpha required for target heat rate" };
    return { input, model: thermalModel(input), solved };
  }

  return { input, model: thermalModel(input), solved };
}

function clearMissing() {
  document.querySelectorAll("input.missing").forEach((node) => node.classList.remove("missing"));
}

function showMissing(items) {
  const grouped = items.reduce((acc, item) => {
    acc[item.group] = acc[item.group] || [];
    acc[item.group].push(item.label);
    const field = document.getElementById(item.id);
    if (field) field.classList.add("missing");
    return acc;
  }, {});
  const parts = Object.entries(grouped).map(([group, labels]) => `${group}: ${labels.join(", ")}`);
  document.getElementById("message").textContent = `Missing or invalid parameters. ${parts.join(" | ")}`;
}

function dl(targetId, rows) {
  const target = document.getElementById(targetId);
  target.innerHTML = rows.map(([key, value, cls = ""]) => `<dt>${key}</dt><dd class="${cls}">${value}</dd>`).join("");
}

function limitClass(value, min, max) {
  if (!Number.isFinite(value)) return "";
  if (min != null && value < min) return "warn";
  if (max != null && value > max) return "warn";
  return "ok";
}

function render(result) {
  const message = document.getElementById("message");
  message.textContent = "";
  if (result.error) {
    showMissing(result.error);
    return;
  }
  if (result.noSolution) {
    message.textContent = result.noSolution;
    return;
  }

  const { input, model, solved } = result;
  const qKw = model.qByUa / 1000;
  const fluidKw = model.qByFluid / 1000;
  const tempUnit = tempSuffix();
  const toutDisplay = fromC(input.inside.toutC);
  const dtFluid = input.inside.toutC - input.inside.tinC;
  const balanceError = model.qByUa - model.qByFluid;
  const mainBySolved = {
    heatRate: ["Heat transfer rate Q", fmt(qKw, 3, "kW")],
    conductance: ["Overall heat exchange coefficient U", fmt(model.uOuter, 3, "W/m2 K")],
    deltaT: ["Required fluid temperature rise", fmt(dFromK(dtFluid), 3, currentTempUnit === "F" ? "deg F" : "K")],
    pipeLength: ["Required pipe length", fmt(input.pipe.length, 3, "m")],
    fluidOutletTemp: ["Fluid outlet temperature", fmt(toutDisplay, 2, tempUnit)],
    fluidVelocity: ["Required fluid velocity", fmt(input.inside.velocity, 3, "m/s")],
    outsideAlpha: ["Required outside alpha", fmt(model.alphaO, 3, "W/m2 K")]
  };

  if (solved.id === "pipeLength") setNum("pipeLength", input.pipe.length, 4);
  if (solved.id === "fluidVelocity") setNum("fluidVelocity", input.inside.velocity, 4);
  if (solved.id === "outsideAlpha") setNum("outsideAlpha", model.alphaO, 4);
  if (solved.id === "fluidOutletTemp") setNum("fluidOutletTemp", toutDisplay, 3);
  if (solved.id === "deltaT") setNum("deltaT", dFromK(dtFluid), 3);

  document.getElementById("topConductance").textContent = fmt(model.uOuter, 3, "W/m2 K");
  document.getElementById("mainLabel").textContent = mainBySolved[solved.id]?.[0] ?? "Heat transfer rate Q";
  document.getElementById("mainValue").textContent = mainBySolved[solved.id]?.[1] ?? fmt(qKw, 3, "kW");
  document.getElementById("mainNote").textContent = `Q = U * A * LMTD; fluid side = ${fmt(fluidKw, 3, "kW")}`;
  document.getElementById("conductanceValue").textContent = fmt(model.uOuter, 3, "W/m2 K");
  document.getElementById("deltaValue").textContent = fmt(dFromK(model.meanDt), 3, currentTempUnit === "F" ? "deg F diff" : "K");
  document.getElementById("deltaNote").textContent = `tank-inlet ${fmt(dFromK(model.dtIn), 2)} / tank-outlet ${fmt(dFromK(model.dtOut), 2)}`;
  document.getElementById("outletValue").textContent = fmt(toutDisplay, 2, tempUnit);
  document.getElementById("outletNote").textContent = `fluid rise ${fmt(dFromK(dtFluid), 2, currentTempUnit === "F" ? "deg F" : "K")}`;

  dl("resistanceList", [
    ["Inner surface area", fmt(model.areaI, 3, "m2")],
    ["Outer surface area A", fmt(model.areaO, 3, "m2")],
    ["Inside alpha", fmt(model.alphaI, 2, "W/m2 K")],
    ["Outside alpha", input.type === "fluid" ? fmt(model.alphaO, 2, "W/m2 K") : "solid conduction"],
    ["Inside resistance", fmt(model.rInside, 6, "K/W")],
    ["Pipe wall resistance", fmt(model.rWall, 6, "K/W")],
    ["Outside resistance", fmt(model.rOutside, 6, "K/W")],
    ["Total conductance U*A", fmt(model.conductance, 3, "W/K")]
  ]);

  dl("flowList", [
    ["Mass flow", fmt(model.massFlow, 4, "kg/s")],
    ["Inside Reynolds", fmt(model.inFlow?.re, 0)],
    ["Inside Prandtl", fmt(model.inFlow?.pr, 3)],
    ["Inside Nusselt", fmt(model.inFlow?.nu, 3)],
    ["Flow regime", model.inFlow?.regime ?? "manual alpha"],
    ["Energy balance difference", fmt(balanceError / 1000, 3, "kW"), Math.abs(balanceError) > Math.max(50, Math.abs(model.qByUa) * 0.05) ? "warn" : "ok"],
    ["Outlet temp limit", `${fmt(toutDisplay, 2, tempUnit)} / ${fmt(fromC(input.inside.maxC), 2, tempUnit)}`, limitClass(input.inside.toutC, input.inside.minC, input.inside.maxC)]
  ]);

  renderRange(input);
  drawPipe(input, model);
}

function renderRange(input) {
  const min = num("rangeMin");
  const max = num("rangeMax");
  const steps = Math.max(2, Math.min(30, Math.round(num("rangeSteps") ?? 7)));
  const body = document.getElementById("rangeBody");
  if (min == null || max == null || min <= 0 || max <= min) {
    body.innerHTML = `<tr><td colspan="6">Enter a valid velocity range.</td></tr>`;
    return;
  }
  const rows = [];
  for (let i = 0; i < steps; i += 1) {
    const velocity = min + (max - min) * i / (steps - 1);
    const trial = readInputs({ fluidVelocity: velocity });
    const model = thermalModel(trial);
    rows.push(`<tr>
      <td>${fmt(velocity, 3)}</td>
      <td>${fmt(model.alphaI, 1)}</td>
      <td>${fmt(model.conductance, 2)}</td>
      <td>${fmt(model.qByUa / 1000, 3)}</td>
      <td>${fmt(fromC(trial.inside.toutC), 2)}</td>
      <td>${fmt(model.inFlow?.re, 0)}</td>
    </tr>`);
  }
  body.innerHTML = rows.join("");
}

function drawPipe(input, model) {
  const canvas = document.getElementById("pipeCanvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#eff5f2";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#d8e6df";
  ctx.fillRect(60, 55, width - 120, 170);
  ctx.strokeStyle = "#9db4ad";
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 55, width - 120, 170);

  const y = 140;
  ctx.lineWidth = 36;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#8f9694";
  ctx.beginPath();
  ctx.moveTo(110, y);
  ctx.lineTo(width - 110, y);
  ctx.stroke();

  ctx.lineWidth = 24;
  const grad = ctx.createLinearGradient(110, 0, width - 110, 0);
  grad.addColorStop(0, "#2f5f94");
  grad.addColorStop(1, "#d5673f");
  ctx.strokeStyle = grad;
  ctx.beginPath();
  ctx.moveTo(110, y);
  ctx.lineTo(width - 110, y);
  ctx.stroke();

  ctx.fillStyle = "#18201f";
  ctx.font = "700 18px Arial";
  ctx.fillText(`Tank max: ${fmt(fromC(input.outside.tankC), 1, tempSuffix())}`, 78, 38);
  ctx.fillText(`Tin: ${fmt(fromC(input.inside.tinC), 1, tempSuffix())}`, 96, 196);
  ctx.textAlign = "right";
  ctx.fillText(`Tout: ${fmt(fromC(input.inside.toutC), 1, tempSuffix())}`, width - 96, 196);
  ctx.textAlign = "left";
  ctx.fillStyle = "#0f4c49";
  ctx.fillText(`Q ${fmt(model.qByUa / 1000, 2, "kW")}`, width / 2 - 55, 105);
  ctx.font = "14px Arial";
  ctx.fillStyle = "#50605c";
  ctx.fillText(`U ${fmt(model.uOuter, 2, "W/m2 K")}  A ${fmt(model.areaO, 2, "m2")}  LMTD ${fmt(dFromK(model.meanDt), 2)}`, width / 2 - 155, 228);
}

function applyFluidPreset(prefix, preset) {
  if (!preset || preset.custom) return;
  setNum(`${prefix}Density`, preset.density, 4);
  setNum(`${prefix}Viscosity`, preset.viscosity, 4);
  setNum(`${prefix}Cp`, preset.cp, 2);
  setNum(`${prefix}K`, preset.k, 4);
  setNum(`${prefix}MinTemp`, fromC(preset.min), 2);
  setNum(`${prefix}MaxTemp`, fromC(preset.max), 2);
  el[`${prefix}Pr`].value = "";
}

function applyPipePreset() {
  const preset = pipePresets[el.pipePreset.value];
  if (preset && !preset.custom) setNum("pipeK", preset.k, 4);
}

function applyOutsidePreset() {
  if (outsideType() === "fluid") {
    applyFluidPreset("outside", fluidPresets[el.outsidePreset.value] ?? fluidPresets.air20);
  } else {
    const preset = solidPresets[el.outsidePreset.value] ?? solidPresets.concrete;
    if (preset.custom) return;
    setNum("outsideK", preset.k, 4);
    setNum("outsideMinTemp", fromC(preset.min), 2);
    setNum("outsideMaxTemp", fromC(preset.max), 2);
  }
}

const storageKey = "heatExchangeCalculatorProjects";

function getStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (parsed?.profiles?.length) return parsed;
  } catch {}
  return {
    activeProfile: "House",
    profiles: [
      { name: "House", experiments: [] },
      { name: "Power facility", experiments: [] }
    ]
  };
}

function setStore(store) {
  localStorage.setItem(storageKey, JSON.stringify(store));
}

function activeProfile(store = getStore()) {
  return store.profiles.find((profile) => profile.name === store.activeProfile) ?? store.profiles[0];
}

function renderProfiles() {
  const store = getStore();
  const select = document.getElementById("projectProfile");
  select.innerHTML = store.profiles.map((profile) => `<option value="${profile.name}">${profile.name}</option>`).join("");
  select.value = store.activeProfile;
  renderExperiments();
}

function renderExperiments() {
  const store = getStore();
  const profile = activeProfile(store);
  const list = document.getElementById("experimentList");
  if (!profile.experiments.length) {
    list.innerHTML = `<div class="experiment-item"><div><strong>No saved experiments in ${profile.name}</strong><small>Name a run and save it here.</small></div></div>`;
    return;
  }
  list.innerHTML = profile.experiments.map((item, index) => `<div class="experiment-item">
    <div><strong>${item.name}</strong><small>${item.summary}</small></div>
    <button type="button" data-load="${index}">Load</button>
  </div>`).join("");
  list.querySelectorAll("button[data-load]").forEach((button) => {
    button.addEventListener("click", () => loadSnapshot(profile.experiments[Number(button.dataset.load)].snapshot));
  });
}

function snapshotInputs() {
  const snapshot = {};
  ids.forEach((id) => {
    snapshot[id] = el[id].value;
  });
  snapshot.outsideType = outsideType();
  return snapshot;
}

function loadSnapshot(snapshot) {
  if (!snapshot) return;
  ids.forEach((id) => {
    if (snapshot[id] != null) el[id].value = snapshot[id];
  });
  currentTempUnit = el.temperatureUnit.value;
  if (snapshot.outsideType) {
    const radio = document.querySelector(`input[name="outsideType"][value="${snapshot.outsideType}"]`);
    if (radio) radio.checked = true;
  }
  document.body.classList.toggle("solid-mode", outsideType() === "solid");
  updateTempLabels();
  calculate();
}

function saveExperiment() {
  const result = solveModel();
  if (result.error || result.noSolution) {
    render(result);
    return;
  }
  const store = getStore();
  const profile = activeProfile(store);
  const nameInput = document.getElementById("experimentName");
  const name = nameInput.value.trim() || `Experiment ${new Date().toLocaleString()}`;
  const summary = `${fmt(result.model.qByUa / 1000, 3, "kW")} | U ${fmt(result.model.uOuter, 2, "W/m2 K")} | pipe ${fmt(result.input.pipe.length, 2, "m")}`;
  profile.experiments.unshift({ name, summary, snapshot: snapshotInputs(), savedAt: Date.now() });
  profile.experiments = profile.experiments.slice(0, 50);
  setStore(store);
  renderProfiles();
}

function updateOutsideMode(resetPreset = true) {
  document.body.classList.toggle("solid-mode", outsideType() === "solid");
  fillSelect(el.outsidePreset, outsideType() === "fluid" ? fluidPresets : solidPresets);
  if (resetPreset) applyOutsidePreset();
}

function calculate() {
  const result = solveModel();
  render(result);
}

function newProfile() {
  const name = window.prompt("New project profile name");
  if (!name?.trim()) return;
  const store = getStore();
  const clean = name.trim();
  if (!store.profiles.some((profile) => profile.name.toLowerCase() === clean.toLowerCase())) {
    store.profiles.push({ name: clean, experiments: [] });
  }
  store.activeProfile = clean;
  setStore(store);
  renderProfiles();
}

function deleteProfile() {
  const store = getStore();
  if (store.profiles.length <= 1) return;
  const profile = activeProfile(store);
  if (!window.confirm(`Delete profile "${profile.name}" and its saved experiments?`)) return;
  store.profiles = store.profiles.filter((item) => item.name !== profile.name);
  store.activeProfile = store.profiles[0].name;
  setStore(store);
  renderProfiles();
}

function clearExperiments() {
  const store = getStore();
  const profile = activeProfile(store);
  if (!window.confirm(`Clear saved experiments in "${profile.name}"?`)) return;
  profile.experiments = [];
  setStore(store);
  renderProfiles();
}

function init() {
  fillSelect(el.insidePreset, fluidPresets);
  fillSelect(el.pipePreset, pipePresets);
  updateOutsideMode(false);
  el.insidePreset.value = "water20";
  el.pipePreset.value = "stainless";
  el.outsidePreset.value = "air20";
  applyFluidPreset("inside", fluidPresets.water20);
  applyPipePreset();
  applyOutsidePreset();
  updateTempLabels();
  renderProfiles();

  el.insidePreset.addEventListener("change", () => {
    applyFluidPreset("inside", fluidPresets[el.insidePreset.value]);
    calculate();
  });
  el.pipePreset.addEventListener("change", () => {
    applyPipePreset();
    calculate();
  });
  el.outsidePreset.addEventListener("change", () => {
    applyOutsidePreset();
    calculate();
  });
  document.querySelectorAll("input[name='outsideType']").forEach((radio) => {
    radio.addEventListener("change", () => {
      updateOutsideMode(true);
      calculate();
    });
  });
  el.temperatureUnit.addEventListener("change", () => {
    convertTemperatureInputs(el.temperatureUnit.value);
    calculate();
  });
  document.getElementById("calculateBtn").addEventListener("click", calculate);
  document.getElementById("resetBtn").addEventListener("click", () => window.location.reload());
  document.getElementById("saveExperimentBtn").addEventListener("click", saveExperiment);
  document.getElementById("clearExperimentsBtn").addEventListener("click", clearExperiments);
  document.getElementById("newProfileBtn").addEventListener("click", newProfile);
  document.getElementById("deleteProfileBtn").addEventListener("click", deleteProfile);
  document.getElementById("projectProfile").addEventListener("change", (event) => {
    const store = getStore();
    store.activeProfile = event.target.value;
    setStore(store);
    renderExperiments();
  });
  document.querySelectorAll("input, select").forEach((node) => {
    if (["insidePreset", "pipePreset", "outsidePreset", "temperatureUnit", "projectProfile"].includes(node.id)) return;
    node.addEventListener("change", calculate);
  });

  calculate();
}

init();
