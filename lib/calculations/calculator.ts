import { CalculatorInput, CalculationResults } from '@/types';
import { calculateGasProperties } from './gas-properties';
import { calculateTowerSizing } from './tower-sizing';
import { calculateMassTransfer } from './mass-transfer';
import { calculatePerformance } from './performance';
import { 
  calculateDropletPhysics, 
  calculateParticulateEfficiency, 
  calculateComplianceStatus 
} from './advanced-calculations';
import { UNIT_CONVERSIONS } from '@/lib/constants';
import { optimizeForCompliance, shouldOptimizeForCompliance, OptimizationResult } from './compliance-optimizer';

export function calculateSprayTower(input: CalculatorInput): CalculationResults {
  // Step 1: Calculate gas properties
  const gasProps = calculateGasProperties(input.gasStream);
  
  // Step 2: Calculate tower sizing
  const towerSizing = calculateTowerSizing(
    gasProps.operatingGasFlow,
    input.tower.gasVelocity,
    input.tower.lgRatio
  );
  
  // Step 3: Calculate mass transfer parameters
  const massTransfer = calculateMassTransfer(
    input.pollutant,
    input.tower,
    gasProps.gasDensity,
    gasProps.effectiveGasViscosity,
    input.tower.gasVelocity,
    towerSizing.liquidFlux
  );
  
  // Step 4: Calculate advanced droplet physics
  const dropletPhysics = calculateDropletPhysics(
    input.tower.dropletSize,
    input.tower.gasVelocity,
    gasProps.gasDensity,
    gasProps.effectiveGasViscosity,
    input.tower.liquidDensity,
    5.0 // Assume 5m spray height for physics calculations
  );
  
  // Step 5: Calculate performance and results
  const performance = calculatePerformance(
    input.pollutant,
    input.tower,
    input.gasStream.gasFlowRate,
    input.tower.gasVelocity,
    towerSizing.towerDiameter,
    gasProps.gasDensity,
    towerSizing.liquidRate,
    massTransfer.overallKGa,
    towerSizing.towerArea,
    gasProps.operatingGasFlow,
    gasProps.operatingTemp
  );
  
  // Step 6: Calculate particulate collection efficiency (if applicable)
  const particulateEff = calculateParticulateEfficiency(
    input.tower.dropletSize,
    input.tower.gasVelocity,
    towerSizing.liquidFlux,
    performance.requiredHeight,
    dropletPhysics.relativeVelocity
  );
  
  // Step 7: Calculate regulatory compliance
  const compliance = calculateComplianceStatus(
    input.settings.regulatoryFramework,
    performance.outletConcentration,
    gasProps.operatingPressure,
    input.pollutant.type
  );
  
  // Apply unit conversions based on selected unit system
  const isImperial = input.settings.unitSystem === 'imperial';
  
  // Helper function to apply unit conversions
  const convertLength = (value: number) => isImperial ? value * UNIT_CONVERSIONS.LENGTH.m_to_ft : value;
  const convertArea = (value: number) => isImperial ? value * UNIT_CONVERSIONS.AREA.m2_to_ft2 : value;
  const convertPressure = (value: number) => isImperial ? value * UNIT_CONVERSIONS.PRESSURE.Pa_to_inH2O : value;
  const convertDensity = (value: number) => isImperial ? value * UNIT_CONVERSIONS.DENSITY.kg_m3_to_lb_ft3 : value;
  const convertVelocity = (value: number) => isImperial ? value * UNIT_CONVERSIONS.VELOCITY.m_s_to_ft_s : value;
  const convertFlowRate = (value: number) => isImperial ? value * UNIT_CONVERSIONS.FLOW_RATE.m3h_to_acfm : value;
  const convertLiquidRate = (value: number) => isImperial ? value * UNIT_CONVERSIONS.FLOW_RATE.m3h_to_gpm : value;
  
  // Combine all results with proper unit conversions
  const results: CalculationResults = {
    // Primary Results
    towerDiameter: convertLength(towerSizing.towerDiameter),
    requiredHeight: convertLength(performance.requiredHeight),
    gasResidenceTime: performance.gasResidenceTime,
    pressureDrop: convertPressure(performance.pressureDrop),
    outletConcentration: performance.outletConcentration, // Will handle regulatory units separately
    
    // Secondary Results
    overallKGa: massTransfer.overallKGa,
    interfacialArea: massTransfer.interfacialArea,
    gasDensity: convertDensity(gasProps.gasDensity),
    liquidRate: convertLiquidRate(towerSizing.liquidRate),
    naohConsumption: performance.naohConsumption,
    
    // Additional Results
    operatingGasFlow: isImperial ? gasProps.operatingGasFlow * 127133 : gasProps.operatingGasFlow, // m³/s to ACFM conversion
    towerArea: convertArea(towerSizing.towerArea),
    liquidFlowRate: isImperial ? towerSizing.liquidFlowRate * UNIT_CONVERSIONS.FLOW_RATE.m3h_to_gpm / 60 : towerSizing.liquidFlowRate,
    nozzleFlowPerNozzle: performance.nozzleFlowPerNozzle ? convertLiquidRate(performance.nozzleFlowPerNozzle) : undefined,
    requiredNozzles: performance.requiredNozzles,
    molesRemoved: performance.molesRemoved,
    
    // Advanced Results
    numberOfTransferUnits: performance.numberOfTransferUnits,
    dropletTerminalVelocity: convertVelocity(dropletPhysics.terminalVelocity),
    relativeVelocity: convertVelocity(dropletPhysics.relativeVelocity),
    dropletContactTime: dropletPhysics.contactTime,
    reynoldsNumber: massTransfer.reynoldsNumber,
    schmidtNumber: massTransfer.schmidtNumber,
    sherwoodNumber: massTransfer.sherwoodNumber,
    
    // Particulate Collection
    particulateEfficiency: particulateEff,
    
    // Regulatory Compliance
    complianceStatus: compliance,
  };
  
  return results;
}

// Enhanced calculation function that includes compliance optimization
export interface EnhancedCalculationResults extends CalculationResults {
  optimizationInfo?: {
    wasOptimized: boolean;
    iterations: number;
    convergenceReached: boolean;
    optimizationLog: string[];
    originalInput: CalculatorInput;
    optimizedInput: CalculatorInput;
  };
}

export function calculateSprayTowerWithCompliance(input: CalculatorInput): EnhancedCalculationResults {
  // First, check if we need optimization for compliance
  const needsOptimization = shouldOptimizeForCompliance(input);
  
  if (!needsOptimization) {
    // Already compliant - return standard calculation
    const results = calculateSprayTower(input);
    return {
      ...results,
      optimizationInfo: {
        wasOptimized: false,
        iterations: 0,
        convergenceReached: true,
        optimizationLog: ['Design meets regulatory requirements without optimization'],
        originalInput: input,
        optimizedInput: input,
      }
    };
  }
  
  // Perform optimization
  const optimizationResult: OptimizationResult = optimizeForCompliance(input);
  
  return {
    ...optimizationResult.results,
    optimizationInfo: {
      wasOptimized: true,
      iterations: optimizationResult.iterations,
      convergenceReached: optimizationResult.convergenceReached,
      optimizationLog: optimizationResult.optimizationLog,
      originalInput: input,
      optimizedInput: optimizationResult.optimizedInput,
    }
  };
}