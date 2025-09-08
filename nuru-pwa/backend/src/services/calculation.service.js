// Calculation engine for all service types

function roundCurrency(value) {
  return Math.round(Number(value) * 100) / 100;
}

function calcOvertime(hours, overtimeHours, dailyRate, overtimeMultiplier) {
  const baseHours = Math.min(hours, 8);
  const base = (dailyRate / 8) * baseHours;
  const overtime = ((dailyRate / 8) * overtimeMultiplier) * Math.max(overtimeHours, Math.max(hours - 8, 0));
  return base + overtime;
}

function calcWarehouse(entry, workerType) {
  const { hours, overtimeHours, productionMetrics } = entry;
  const rate = Number(workerType.dailyRate);
  const multiplier = Number(workerType.overtimeMultiplier);
  const perWorker = calcOvertime(hours, overtimeHours, rate, multiplier);
  const countAmount = perWorker * entry.count;
  const bonus = Number(productionMetrics?.bonus || 0);
  return countAmount + bonus;
}

function calcCargo(entry, workerType) {
  const { hours, overtimeHours, productionMetrics } = entry;
  const rate = Number(workerType.dailyRate);
  const multiplier = Number(workerType.overtimeMultiplier);
  const tonnage = Number(productionMetrics?.tonnage || 0);
  const tonnageRate = Number(productionMetrics?.tonnageRate || 0);
  const timeComponent = calcOvertime(hours, overtimeHours, rate, multiplier) * entry.count;
  const tonnageComponent = tonnage * tonnageRate;
  return timeComponent + tonnageComponent;
}

function calcFertilizer(entry, workerType) {
  const { hours, overtimeHours, productionMetrics } = entry;
  const rate = Number(workerType.dailyRate);
  const multiplier = Number(workerType.overtimeMultiplier);
  const quota = Number(productionMetrics?.bags || 0);
  const quotaRate = Number(productionMetrics?.bagRate || 0);
  const qualityBonus = Number(productionMetrics?.qualityBonus || 0);
  const timeComponent = calcOvertime(hours, overtimeHours, rate, multiplier) * entry.count;
  return timeComponent + quota * quotaRate + qualityBonus;
}

function calcEquipment(entry, workerType) {
  const { hours, overtimeHours, productionMetrics } = entry;
  const rate = Number(workerType.dailyRate);
  const multiplier = Number(workerType.overtimeMultiplier);
  const rentalRate = Number(productionMetrics?.rentalRate || 0);
  const operatorComponent = calcOvertime(hours, overtimeHours, rate, multiplier) * entry.count;
  const rentalComponent = rentalRate * (hours + overtimeHours);
  return operatorComponent + rentalComponent;
}

function calcTransport(entry, workerType) {
  const { hours, overtimeHours, productionMetrics } = entry;
  const rate = Number(workerType.dailyRate);
  const multiplier = Number(workerType.overtimeMultiplier);
  const routeRate = Number(productionMetrics?.routeRate || 0);
  const routes = Number(productionMetrics?.routes || 0);
  const driverComponent = calcOvertime(hours, overtimeHours, rate, multiplier) * entry.count;
  const routeComponent = routeRate * routes;
  return driverComponent + routeComponent;
}

export function calculateEntryAmount(serviceType, entry, workerType) {
  switch (serviceType) {
    case 'WAREHOUSE':
      return roundCurrency(calcWarehouse(entry, workerType));
    case 'CARGO':
      return roundCurrency(calcCargo(entry, workerType));
    case 'FERTILIZER':
      return roundCurrency(calcFertilizer(entry, workerType));
    case 'EQUIPMENT':
      return roundCurrency(calcEquipment(entry, workerType));
    case 'TRANSPORT':
      return roundCurrency(calcTransport(entry, workerType));
    default:
      return 0;
  }
}

export function calculateReportTotal(serviceType, entriesWithTypes) {
  let total = 0;
  for (const { entry, workerType } of entriesWithTypes) {
    total += calculateEntryAmount(serviceType, entry, workerType);
  }
  return roundCurrency(total);
}

