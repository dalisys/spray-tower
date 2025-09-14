import { PhysicalConstants, ValidationRanges, PollutantData, NozzleData } from '@/types';

export const PHYSICAL_CONSTANTS: PhysicalConstants = {
  R_GAS: 8.314462618, // J/mol·K
  M_AIR: 0.02897, // kg/mol
  MU_GAS_DEFAULT: 0.0000185, // Pa·s
};

export const POLLUTANT_LIBRARY: Record<string, PollutantData> = {
  SO2: {
    henryConstant: 1230, // Pa·m³/mol
    diffusivity: 0.000012, // m²/s
    molarMass: 64.066, // g/mol
  },
  HCl: {
    henryConstant: 0.194, // Pa·m³/mol
    diffusivity: 0.000016, // m²/s
    molarMass: 36.461, // g/mol
  },
  NH3: {
    henryConstant: 6600, // Pa·m³/mol
    diffusivity: 0.000021, // m²/s
    molarMass: 17.031, // g/mol
  },
  H2S: {
    henryConstant: 930, // Pa·m³/mol
    diffusivity: 0.000014, // m²/s
    molarMass: 34.08, // g/mol
  },
};

export const NOZZLE_LIBRARY: Record<string, NozzleData> = {
  'FullCone-1/2-15': {
    type: 'FullCone-1/2-15',
    k: 1.5, // m³/h·bar^-0.5
    description: 'Medium flow',
  },
  'HollowCone-3/4-25': {
    type: 'HollowCone-3/4-25',
    k: 2.6, // m³/h·bar^-0.5
    description: 'Higher flow',
  },
  'Spiral-1/2-10': {
    type: 'Spiral-1/2-10',
    k: 1.2, // m³/h·bar^-0.5
    description: 'Fine droplets',
  },
};

export const VALIDATION_RANGES: ValidationRanges = {
  gasFlowRate: { min: 100, max: 1000000 }, // Nm³/h
  temperature: { min: 0, max: 200 }, // °C
  pressure: { min: 50, max: 500 }, // kPa
  targetEfficiency: { min: 0.1, max: 0.99 }, // 0-1
  lgRatio: { min: 0.001, max: 0.1 }, // m³/m³
  gasVelocity: { min: 1, max: 10 }, // m/s
  dropletSize: { min: 0.1, max: 5 }, // mm
};

// Application-specific recommendations
export const APPLICATION_RECOMMENDATIONS = {
  gas_absorption: {
    lgRatio: { min: 3.0, max: 20.0, recommended: 3.0 }, // L/m³
    gasVelocity: { min: 0.3, max: 1.2, recommended: 1.0 }, // m/s
    dropletSize: { min: 0.5, max: 1.0, recommended: 0.8 }, // mm
    description: 'Gas absorption (e.g., acidic gases)',
  },
  particulate_removal: {
    lgRatio: { min: 0.1, max: 1.0, recommended: 0.5 }, // L/m³
    gasVelocity: { min: 0.5, max: 2.0, recommended: 1.5 }, // m/s
    dropletSize: { min: 0.3, max: 0.8, recommended: 0.5 }, // mm
    description: 'Particulate matter removal',
  },
  cooling: {
    lgRatio: { min: 0.1, max: 0.5, recommended: 0.2 }, // L/m³
    gasVelocity: { min: 1.0, max: 2.3, recommended: 1.8 }, // m/s
    dropletSize: { min: 0.5, max: 2.0, recommended: 1.0 }, // mm
    description: 'Gas cooling',
  },
  odor_control: {
    lgRatio: { min: 0.1, max: 0.5, recommended: 0.3 }, // L/m³
    gasVelocity: { min: 0.5, max: 1.5, recommended: 1.0 }, // m/s
    dropletSize: { min: 0.5, max: 1.0, recommended: 0.7 }, // mm
    description: 'Odor control',
  },
};

// Regulatory frameworks
export const REGULATORY_FRAMEWORKS = {
  EU: {
    name: 'European Union',
    emissionUnits: 'mg/Nm³',
    pressureUnits: 'Pa',
    flowUnits: 'm³/h',
    temperatureRef: '0°C',
    oxygenRef: 'specified O₂',
    codes: {
      pressureVessel: 'EU PED (>0.5 bar)',
      emissions: 'Industrial Emissions Directive (2010/75/EU)',
      safety: 'ATEX (explosive atmospheres)',
      testing: 'EN standards',
    },
  },
  US: {
    name: 'United States',
    emissionUnits: 'ppmvd / gr/dscf',
    pressureUnits: 'in.H₂O',
    flowUnits: 'ACFM',
    temperatureRef: '32°F',
    oxygenRef: 'dry basis',
    codes: {
      pressureVessel: 'ASME BPVC Section VIII',
      emissions: 'Clean Air Act, NSPS, MACT',
      safety: 'OSHA/NFPA',
      testing: 'EPA reference methods',
    },
  },
};

// Default values for calculator
export const DEFAULT_VALUES = {
  gasStream: {
    gasFlowRate: 20000, // Nm³/h
    temperature: 40, // °C
    pressure: 101.325, // kPa
  },
  pollutant: {
    type: 'SO2' as const,
    inletConcentration: 1500, // mg/Nm³
    targetEfficiency: 0.9, // 90%
  },
  tower: {
    lgRatio: 0.015, // m³/m³
    liquidDensity: 1000, // kg/m³
    liquidViscosity: 0.001, // Pa·s
    gasVelocity: 3, // m/s
    dropletSize: 0.8, // mm
    nozzlePressure: 1.5, // bar
    frictionFactor: 0.02, // dimensionless
    pumpHead: 10, // m
    naohStoichiometry: 1, // mol/mol
  },
  settings: {
    unitSystem: 'metric' as const,
    regulatoryFramework: 'EU' as const,
    applicationType: 'gas_absorption' as const,
  },
};

// Comprehensive unit conversion factors
export const UNIT_CONVERSIONS = {
  PRESSURE: {
    kPa_to_Pa: 1000,
    Pa_to_kPa: 0.001,
    Pa_to_inH2O: 0.00401463, // Pa to inches of water
    inH2O_to_Pa: 249.0889, // inches of water to Pa
    Pa_to_cmH2O: 0.0101972, // Pa to cm of water  
    cmH2O_to_Pa: 98.0665, // cm of water to Pa
  },
  TEMPERATURE: {
    C_to_K: 273.15,
    K_to_C: -273.15,
    C_to_F: (c: number) => c * 9/5 + 32,
    F_to_C: (f: number) => (f - 32) * 5/9,
  },
  LENGTH: {
    mm_to_m: 0.001,
    m_to_mm: 1000,
    m_to_ft: 3.28084,
    ft_to_m: 0.3048,
    m_to_in: 39.3701,
    in_to_m: 0.0254,
  },
  AREA: {
    m2_to_ft2: 10.7639,
    ft2_to_m2: 0.092903,
  },
  VOLUME: {
    m3_to_ft3: 35.3147,
    ft3_to_m3: 0.0283168,
    L_to_gal: 0.264172, // Liters to US gallons
    gal_to_L: 3.78541, // US gallons to liters
  },
  FLOW_RATE: {
    m3h_to_acfm: 0.588578, // m³/h to actual ft³/min
    acfm_to_m3h: 1.69901, // actual ft³/min to m³/h
    m3h_to_gpm: 4.40287, // m³/h to US gallons per minute
    gpm_to_m3h: 0.227125, // US gallons per minute to m³/h
  },
  DENSITY: {
    kg_m3_to_lb_ft3: 0.062428, // kg/m³ to lb/ft³
    lb_ft3_to_kg_m3: 16.0185, // lb/ft³ to kg/m³
  },
  VELOCITY: {
    m_s_to_ft_s: 3.28084, // m/s to ft/s
    ft_s_to_m_s: 0.3048, // ft/s to m/s
    m_s_to_ft_min: 196.85, // m/s to ft/min
    ft_min_to_m_s: 0.00508, // ft/min to m/s
  },
  TIME: {
    h_to_s: 3600,
    s_to_h: 1/3600,
  },
  CONCENTRATION: {
    // Concentration conversions depend on molecular weight and conditions
    // These are utility functions that will be used with MW
    mg_Nm3_to_ppmv: (mgNm3: number, mw: number) => (mgNm3 * 22.4) / (mw * 1000), // at STP
    ppmv_to_mg_Nm3: (ppmv: number, mw: number) => (ppmv * mw * 1000) / 22.4, // at STP
  },
};

// Physical property correlations and constants
export const CORRELATIONS = {
  // Standard conditions
  STANDARD_TEMP: 273.15, // K
  STANDARD_PRESSURE: 101325, // Pa
  
  // Mass transfer correlation constants
  SHERWOOD_CONSTANT_A: 2,
  SHERWOOD_CONSTANT_B: 0.6,
  SHERWOOD_REYNOLDS_EXP: 0.5,
  SHERWOOD_SCHMIDT_EXP: 1/3,
};