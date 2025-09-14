import { GasStreamProperties } from '@/types';
import { PHYSICAL_CONSTANTS, UNIT_CONVERSIONS, CORRELATIONS } from '@/lib/constants';

export interface GasPropertiesResults {
  operatingTemp: number; // K
  operatingPressure: number; // Pa
  gasDensity: number; // kg/m³
  operatingGasFlow: number; // m³/s
  effectiveGasViscosity: number; // Pa·s
}

export function calculateGasProperties(
  gasStream: GasStreamProperties
): GasPropertiesResults {
  const { gasFlowRate, temperature, pressure, gasViscosity } = gasStream;

  // Convert temperature to Kelvin
  const operatingTemp = temperature + UNIT_CONVERSIONS.TEMPERATURE.C_to_K;
  
  // Convert pressure to Pa
  const operatingPressure = pressure * UNIT_CONVERSIONS.PRESSURE.kPa_to_Pa;
  
  // Calculate gas density using ideal gas law: ρ = (P * M) / (R * T)
  const gasDensity = (operatingPressure * PHYSICAL_CONSTANTS.M_AIR) / 
    (PHYSICAL_CONSTANTS.R_GAS * operatingTemp);
  
  // Convert standard flow to operating conditions
  // Q_operating = Q_standard * (T_operating / T_standard) * (P_standard / P_operating)
  const standardFlow_m3s = gasFlowRate / UNIT_CONVERSIONS.TIME.h_to_s; // Convert Nm³/h to Nm³/s
  const operatingGasFlow = standardFlow_m3s * 
    (operatingTemp / CORRELATIONS.STANDARD_TEMP) * 
    (CORRELATIONS.STANDARD_PRESSURE / operatingPressure);
  
  // Use provided gas viscosity or default
  const effectiveGasViscosity = gasViscosity || PHYSICAL_CONSTANTS.MU_GAS_DEFAULT;
  
  return {
    operatingTemp,
    operatingPressure,
    gasDensity,
    operatingGasFlow,
    effectiveGasViscosity,
  };
}