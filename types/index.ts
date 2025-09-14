// Core types for Spray Tower Calculator

export interface GasStreamProperties {
  gasFlowRate: number; // Nm³/h
  temperature: number; // °C
  pressure: number; // kPa
  gasViscosity?: number; // Pa·s (optional override)
}

export interface PollutantProperties {
  type: PollutantType;
  inletConcentration: number; // mg/Nm³
  targetEfficiency: number; // 0-1
}

export interface TowerParameters {
  lgRatio: number; // m³/m³
  liquidDensity: number; // kg/m³
  liquidViscosity: number; // Pa·s
  gasVelocity: number; // m/s
  dropletSize: number; // mm
  nozzleType?: string;
  nozzlePressure: number; // bar
  kgaOverride?: number; // 1/s
  frictionFactor: number; // dimensionless
  pumpHead: number; // m
  naohStoichiometry: number; // mol/mol
}

export interface CalculationResults {
  // Primary Results
  towerDiameter: number; // m or ft
  requiredHeight: number; // m or ft
  gasResidenceTime: number; // s
  pressureDrop: number; // Pa or in.H2O
  outletConcentration: number; // mg/Nm³ or ppmvd
  
  // Secondary Results
  overallKGa: number; // 1/s
  interfacialArea: number; // 1/m
  gasDensity: number; // kg/m³ or lb/ft³
  liquidRate: number; // m³/h or GPM
  naohConsumption: number; // mol/h
  
  // Additional Results
  operatingGasFlow: number; // m³/s or ACFM
  towerArea: number; // m² or ft²
  liquidFlowRate: number; // m³/s or GPM
  nozzleFlowPerNozzle?: number; // m³/h or GPM
  requiredNozzles?: number; // count
  molesRemoved: number; // mol/h
  
  // Advanced Results
  numberOfTransferUnits: number; // NTU, dimensionless
  dropletTerminalVelocity: number; // m/s or ft/s
  relativeVelocity: number; // m/s or ft/s
  dropletContactTime: number; // s
  reynoldsNumber: number; // dimensionless
  schmidtNumber: number; // dimensionless
  sherwoodNumber: number; // dimensionless
  
  // Particulate Collection (if applicable)
  particulateEfficiency?: {
    coarse_10um: number; // >10 μm efficiency
    medium_2um: number; // ~2 μm efficiency  
    fine_1um: number; // <1 μm efficiency
  };
  
  // Regulatory Compliance
  complianceStatus: {
    framework: RegulatoryFramework;
    emissionLimitsMet: boolean;
    pressureVesselCode: string;
    safetyClassification?: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface PollutantData {
  henryConstant: number; // Pa·m³/mol
  diffusivity: number; // m²/s
  molarMass: number; // g/mol
}

export interface NozzleData {
  type: string;
  k: number; // m³/h·bar^-0.5
  description: string;
}

export interface PhysicalConstants {
  R_GAS: number; // J/mol·K
  M_AIR: number; // kg/mol
  MU_GAS_DEFAULT: number; // Pa·s
}

// Enums
export type PollutantType = 'SO2' | 'HCl' | 'NH3' | 'H2S';
export type RegulatoryFramework = 'EU' | 'US';
export type UnitSystem = 'metric' | 'imperial';
export type ApplicationType = 'gas_absorption' | 'particulate_removal' | 'cooling' | 'odor_control';

// Input validation ranges
export interface ValidationRanges {
  gasFlowRate: { min: number; max: number };
  temperature: { min: number; max: number };
  pressure: { min: number; max: number };
  targetEfficiency: { min: number; max: number };
  lgRatio: { min: number; max: number };
  gasVelocity: { min: number; max: number };
  dropletSize: { min: number; max: number };
}

// System settings interface
export interface SystemSettings {
  unitSystem: UnitSystem;
  regulatoryFramework: RegulatoryFramework;
  applicationType: ApplicationType;
}

// Complete calculator input interface
export interface CalculatorInput {
  gasStream: GasStreamProperties;
  pollutant: PollutantProperties;
  tower: TowerParameters;
  settings: SystemSettings;
}

// Calculator state interface
export interface CalculatorState {
  input: CalculatorInput;
  results?: CalculationResults;
  errors: ValidationError[];
  isCalculating: boolean;
}