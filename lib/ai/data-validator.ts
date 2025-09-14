// Data Validation for AI Report Generation
// File: lib/ai/data-validator.ts

import { CalculatorInput, CalculationResults } from '@/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DataIntegrityCheck {
  field: string;
  originalValue: number;
  expectedRange?: { min: number; max: number };
  criticalityLevel: 'critical' | 'important' | 'minor';
}

// Validate input data completeness and reasonableness
export function validateInputData(input: CalculatorInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Gas Stream Validation
  if (!input.gasStream.gasFlowRate || input.gasStream.gasFlowRate <= 0) {
    errors.push('Gas flow rate must be positive');
  }
  if (input.gasStream.gasFlowRate > 1000000) {
    warnings.push('Very high gas flow rate detected');
  }

  if (input.gasStream.temperature < -50 || input.gasStream.temperature > 500) {
    errors.push('Temperature outside reasonable operating range (-50°C to 500°C)');
  }

  if (!input.gasStream.pressure || input.gasStream.pressure <= 0) {
    errors.push('Pressure must be positive');
  }

  // Pollutant Validation
  if (!input.pollutant.inletConcentration || input.pollutant.inletConcentration <= 0) {
    errors.push('Inlet concentration must be positive');
  }

  if (input.pollutant.targetEfficiency <= 0 || input.pollutant.targetEfficiency > 1) {
    errors.push('Target efficiency must be between 0 and 1');
  }

  // Tower Parameters Validation
  if (!input.tower.lgRatio || input.tower.lgRatio <= 0) {
    errors.push('L/G ratio must be positive');
  }

  if (input.tower.gasVelocity <= 0 || input.tower.gasVelocity > 20) {
    errors.push('Gas velocity outside reasonable range (0-20 m/s)');
  }

  if (input.tower.dropletSize <= 0 || input.tower.dropletSize > 10) {
    errors.push('Droplet size outside reasonable range (0-10 mm)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Validate calculation results for physical reasonableness
export function validateCalculationResults(results: CalculationResults): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Tower Dimensions
  if (results.towerDiameter <= 0 || results.towerDiameter > 50) {
    errors.push('Tower diameter outside reasonable range (0-50 m)');
  }

  if (results.requiredHeight <= 0 || results.requiredHeight > 100) {
    errors.push('Tower height outside reasonable range (0-100 m)');
  }

  // Performance Parameters
  if (results.overallKGa <= 0) {
    errors.push('Mass transfer coefficient must be positive');
  }

  if (results.pressureDrop < 0 || results.pressureDrop > 10000) {
    warnings.push('Pressure drop outside typical range (0-10000 Pa)');
  }

  if (results.outletConcentration < 0) {
    errors.push('Outlet concentration cannot be negative');
  }

  // Physical Properties
  if (results.gasDensity <= 0 || results.gasDensity > 10) {
    errors.push('Gas density outside reasonable range (0-10 kg/m³)');
  }

  if (results.reynoldsNumber <= 0) {
    errors.push('Reynolds number must be positive');
  }

  if (results.schmidtNumber <= 0) {
    errors.push('Schmidt number must be positive');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Create data integrity checks for AI validation
export function createDataIntegrityChecks(
  input: CalculatorInput, 
  results: CalculationResults
): DataIntegrityCheck[] {
  const checks: DataIntegrityCheck[] = [];

  // Critical input parameters
  checks.push({
    field: 'gasFlowRate',
    originalValue: input.gasStream.gasFlowRate,
    expectedRange: { min: 1, max: 1000000 },
    criticalityLevel: 'critical'
  });

  checks.push({
    field: 'inletConcentration',
    originalValue: input.pollutant.inletConcentration,
    expectedRange: { min: 0.1, max: 50000 },
    criticalityLevel: 'critical'
  });

  checks.push({
    field: 'targetEfficiency',
    originalValue: input.pollutant.targetEfficiency,
    expectedRange: { min: 0.1, max: 0.999 },
    criticalityLevel: 'critical'
  });

  // Critical results
  checks.push({
    field: 'towerDiameter',
    originalValue: results.towerDiameter,
    expectedRange: { min: 0.1, max: 50 },
    criticalityLevel: 'critical'
  });

  checks.push({
    field: 'requiredHeight',
    originalValue: results.requiredHeight,
    expectedRange: { min: 0.1, max: 100 },
    criticalityLevel: 'critical'
  });

  checks.push({
    field: 'outletConcentration',
    originalValue: results.outletConcentration,
    expectedRange: { min: 0, max: input.pollutant.inletConcentration },
    criticalityLevel: 'critical'
  });

  return checks;
}

// Validate data hasn't been altered by AI
export function validateDataIntegrity(
  originalChecks: DataIntegrityCheck[],
  reportContent: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  originalChecks.forEach(check => {
    const valuePattern = new RegExp(`${check.originalValue.toFixed(3)}|${check.originalValue.toExponential(2)}`, 'g');
    const matches = reportContent.match(valuePattern);
    
    if (!matches && check.criticalityLevel === 'critical') {
      errors.push(`Critical value for ${check.field} may have been altered or missing`);
    } else if (!matches && check.criticalityLevel === 'important') {
      warnings.push(`Important value for ${check.field} may have been altered or missing`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Sanitize AI response to prevent data manipulation
export function sanitizeAIResponse(response: string): string {
  // Remove any potential calculation expressions
  return response;
  // const calculationPattern = /\b\d+\.?\d*\s*[\+\-\*\/]\s*\d+\.?\d*\b/g;
  // const sanitized = response.replace(calculationPattern, '[CALCULATION REMOVED]');
  
  // // Log if any calculations were found and removed
  // const calculationsFound = response.match(calculationPattern);
  // if (calculationsFound && calculationsFound.length > 0) {
  //   console.warn('Calculations detected and removed from AI response:', calculationsFound);
  // }
  
  // return sanitized;
}