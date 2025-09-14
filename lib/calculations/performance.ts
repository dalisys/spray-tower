import { PollutantProperties, TowerParameters } from '@/types';
import { POLLUTANT_LIBRARY, NOZZLE_LIBRARY } from '@/lib/constants';

export interface PerformanceResults {
  requiredHeight: number; // m
  gasResidenceTime: number; // s
  outletConcentration: number; // mg/Nm³
  pressureDrop: number; // Pa
  molesRemoved: number; // mol/h
  naohConsumption: number; // mol/h
  numberOfTransferUnits: number; // NTU
  nozzleFlowPerNozzle?: number; // m³/h
  requiredNozzles?: number; // count
}

export function calculatePerformance(
  pollutant: PollutantProperties,
  tower: TowerParameters,
  gasFlowRate: number, // Nm³/h
  gasVelocity: number, // m/s
  towerDiameter: number, // m
  gasDensity: number, // kg/m³
  liquidRate: number, // m³/h
  overallKGa: number, // 1/s
  towerArea: number, // m²
  operatingGasFlow: number, // m³/s
  operatingTemp: number // K
): PerformanceResults {
  const pollutantData = POLLUTANT_LIBRARY[pollutant.type];
  
  // Calculate outlet concentration first
  const outletConcentration = pollutant.inletConcentration * (1 - pollutant.targetEfficiency);
  
  // Calculate Number of Transfer Units (NTU) using correct formula
  // N_G = ln(C_in / C_out) = ln(y_in / y_out)
  let numberOfTransferUnits = 0;
  if (outletConcentration > 0) {
    numberOfTransferUnits = Math.log(pollutant.inletConcentration / outletConcentration);
  }
  
  // Calculate molar gas flow rate G_m (kmol/s)
  // G_m = (P * Q_operating) / (R * T) where Q is in m³/s
  const molarGasFlow = (101325 * operatingGasFlow) / (8314.462618 * operatingTemp); // kmol/s
  
  // Calculate required spray zone volume using NTU method
  // V = (G_m * N_G) / K_G a
  let sprayZoneVolume = 0;
  if (overallKGa > 0 && numberOfTransferUnits > 0) {
    sprayZoneVolume = (molarGasFlow * numberOfTransferUnits) / overallKGa;
  }
  
  // Calculate required height: H = V / A
  let requiredHeight = 0;
  if (towerArea > 0 && sprayZoneVolume > 0) {
    requiredHeight = sprayZoneVolume / towerArea;
  }
  
  // Gas residence time: t = H / u_g
  const gasResidenceTime = gasVelocity > 0 ? requiredHeight / gasVelocity : 0;
  
  // Pressure drop calculation: ΔP = f * (H/D) * (ρ * u²/2)
  const pressureDrop = tower.frictionFactor * 
    (requiredHeight / towerDiameter) * 
    (gasDensity * Math.pow(gasVelocity, 2) / 2);
  
  // Calculate moles removed
  const concentrationDifference = pollutant.inletConcentration - outletConcentration; // mg/Nm³
  const molesRemoved = (gasFlowRate * concentrationDifference / 1000) / pollutantData.molarMass * 1000; // mol/h
  
  // NaOH consumption
  const naohConsumption = molesRemoved * tower.naohStoichiometry;
  
  // Nozzle calculations (if nozzle type is specified)
  let nozzleFlowPerNozzle: number | undefined;
  let requiredNozzles: number | undefined;
  
  if (tower.nozzleType && NOZZLE_LIBRARY[tower.nozzleType]) {
    const nozzleData = NOZZLE_LIBRARY[tower.nozzleType];
    nozzleFlowPerNozzle = nozzleData.k * Math.sqrt(tower.nozzlePressure);
    requiredNozzles = Math.ceil(liquidRate / nozzleFlowPerNozzle);
  }
  
  return {
    requiredHeight,
    gasResidenceTime,
    outletConcentration,
    pressureDrop,
    molesRemoved,
    naohConsumption,
    numberOfTransferUnits,
    nozzleFlowPerNozzle,
    requiredNozzles,
  };
}