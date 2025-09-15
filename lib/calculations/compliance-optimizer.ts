import { CalculatorInput, CalculationResults } from '@/types';
import { calculateSprayTower } from './calculator';
import { calculateComplianceStatus } from './advanced-calculations';

export interface OptimizationResult {
  results: CalculationResults;
  optimizedInput: CalculatorInput;
  iterations: number;
  convergenceReached: boolean;
  optimizationLog: string[];
}

export function optimizeForCompliance(input: CalculatorInput, maxIterations: number = 20): OptimizationResult {
  const log: string[] = [];
  let currentInput = { ...input };
  let bestResults: CalculationResults | null = null;
  let bestInput: CalculatorInput | null = null;
  let iterations = 0;
  let convergenceReached = false;

  log.push(`Starting compliance optimization for ${input.settings.regulatoryFramework} framework`);
  log.push(`Target pollutant: ${input.pollutant.type}, Target efficiency: ${(input.pollutant.targetEfficiency * 100).toFixed(1)}%`);

  // First, calculate with original parameters
  let results = calculateSprayTower(currentInput);
  log.push(`Initial calculation - Outlet: ${results.outletConcentration.toFixed(1)} mg/Nm³, Compliance: ${results.complianceStatus.emissionLimitsMet}`);

  // If already compliant, return original results
  if (results.complianceStatus.emissionLimitsMet) {
    log.push(`Initial design already meets regulatory requirements`);
    return {
      results,
      optimizedInput: currentInput,
      iterations: 0,
      convergenceReached: true,
      optimizationLog: log,
    };
  }

  // Get emission limits for the pollutant type
  const emissionLimits = getEmissionLimits(input.settings.regulatoryFramework, input.pollutant.type);
  const targetOutletConcentration = emissionLimits * 0.9; // Aim for 90% of limit for safety margin
  
  log.push(`Regulatory limit: ${emissionLimits} mg/Nm³, Target: ${targetOutletConcentration.toFixed(1)} mg/Nm³`);

  // Calculate required efficiency to meet target
  const requiredEfficiency = 1 - (targetOutletConcentration / input.pollutant.inletConcentration);
  log.push(`Required efficiency: ${(requiredEfficiency * 100).toFixed(1)}%`);

  // Optimization loop
  for (iterations = 1; iterations <= maxIterations; iterations++) {
    // Strategy 1: Increase L/G ratio to improve mass transfer
    if (iterations <= maxIterations * 0.4) {
      const lgIncreaseFactor = 1 + (iterations * 0.1);
      currentInput = {
        ...currentInput,
        tower: {
          ...currentInput.tower,
          lgRatio: input.tower.lgRatio * lgIncreaseFactor,
        },
        pollutant: {
          ...currentInput.pollutant,
          targetEfficiency: requiredEfficiency,
        }
      };
      log.push(`Iteration ${iterations}: Increasing L/G ratio to ${currentInput.tower.lgRatio.toFixed(2)}`);
    }
    
    // Strategy 2: Optimize gas velocity for better mass transfer
    else if (iterations <= maxIterations * 0.7) {
      const velocityFactor = Math.max(0.5, 1 - (iterations - maxIterations * 0.4) * 0.05);
      currentInput = {
        ...currentInput,
        tower: {
          ...currentInput.tower,
          gasVelocity: input.tower.gasVelocity * velocityFactor,
        }
      };
      log.push(`Iteration ${iterations}: Adjusting gas velocity to ${currentInput.tower.gasVelocity.toFixed(2)} m/s`);
    }
    
    // Strategy 3: Optimize droplet size for better interfacial area
    else {
      const dropletFactor = Math.max(0.5, 1 - (iterations - maxIterations * 0.7) * 0.1);
      currentInput = {
        ...currentInput,
        tower: {
          ...currentInput.tower,
          dropletSize: input.tower.dropletSize * dropletFactor,
        }
      };
      log.push(`Iteration ${iterations}: Reducing droplet size to ${currentInput.tower.dropletSize.toFixed(2)} mm`);
    }

    // Recalculate with updated parameters
    results = calculateSprayTower(currentInput);
    
    log.push(`  Result: Outlet ${results.outletConcentration.toFixed(1)} mg/Nm³, Height ${results.requiredHeight.toFixed(1)} m, Compliance: ${results.complianceStatus.emissionLimitsMet}`);

    // Check if we've achieved compliance
    if (results.complianceStatus.emissionLimitsMet) {
      convergenceReached = true;
      bestResults = results;
      bestInput = { ...currentInput };
      log.push(`✓ Compliance achieved in ${iterations} iterations`);
      break;
    }

    // Keep track of best result so far (closest to compliance)
    if (!bestResults || results.outletConcentration < bestResults.outletConcentration) {
      bestResults = results;
      bestInput = { ...currentInput };
    }

    // Early exit if we're getting worse
    if (iterations > 5 && results.outletConcentration > targetOutletConcentration * 2) {
      log.push(`Optimization diverging, using best result found`);
      break;
    }
  }

  // If we couldn't achieve compliance, use the best result found
  if (!convergenceReached && bestResults && bestInput) {
    results = bestResults;
    currentInput = bestInput;
    log.push(`⚠ Could not achieve full compliance in ${maxIterations} iterations`);
    log.push(`Using best result: ${results.outletConcentration.toFixed(1)} mg/Nm³ (vs limit ${emissionLimits} mg/Nm³)`);
  }

  return {
    results: results!,
    optimizedInput: currentInput,
    iterations,
    convergenceReached,
    optimizationLog: log,
  };
}

function getEmissionLimits(framework: 'EU' | 'US', pollutantType: string): number {
  if (framework === 'EU') {
    const euLimits: Record<string, number> = {
      SO2: 200, // mg/Nm³
      HCl: 10,  // mg/Nm³
      NH3: 50,  // mg/Nm³
      H2S: 5,   // mg/Nm³
    };
    return euLimits[pollutantType] || 100; // Default limit if not found
  } else {
    // US limits - typically more lenient, converted from ppmvd to mg/Nm³
    const usLimits: Record<string, number> = {
      SO2: 400, // mg/Nm³ (roughly 150 ppmvd)
      HCl: 25,  // mg/Nm³ (roughly 15 ppmvd)
      NH3: 100, // mg/Nm³ (roughly 125 ppmvd)
      H2S: 15,  // mg/Nm³ (roughly 10 ppmvd)
    };
    return usLimits[pollutantType] || 200; // Default limit if not found
  }
}

export function shouldOptimizeForCompliance(input: CalculatorInput): boolean {
  // Quick check to see if we need optimization
  const preliminaryResults = calculateSprayTower(input);
  return !preliminaryResults.complianceStatus.emissionLimitsMet;
}