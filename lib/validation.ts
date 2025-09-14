import { CalculatorInput, ValidationError } from '@/types';
import { VALIDATION_RANGES, POLLUTANT_LIBRARY } from '@/lib/constants';

export function validateInput(input: CalculatorInput): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Gas Stream Validation
  const { gasFlowRate, temperature, pressure } = input.gasStream;
  
  if (gasFlowRate <= 0) {
    errors.push({
      field: 'gasFlowRate',
      message: 'Gas flow rate must be greater than 0',
      type: 'error',
    });
  } else if (gasFlowRate < VALIDATION_RANGES.gasFlowRate.min || gasFlowRate > VALIDATION_RANGES.gasFlowRate.max) {
    errors.push({
      field: 'gasFlowRate',
      message: `Gas flow rate should be between ${VALIDATION_RANGES.gasFlowRate.min} and ${VALIDATION_RANGES.gasFlowRate.max} Nm³/h`,
      type: 'warning',
    });
  }
  
  if (temperature < VALIDATION_RANGES.temperature.min || temperature > VALIDATION_RANGES.temperature.max) {
    errors.push({
      field: 'temperature',
      message: `Temperature should be between ${VALIDATION_RANGES.temperature.min} and ${VALIDATION_RANGES.temperature.max} °C`,
      type: 'warning',
    });
  }
  
  if (pressure <= 0) {
    errors.push({
      field: 'pressure',
      message: 'Pressure must be greater than 0',
      type: 'error',
    });
  } else if (pressure < VALIDATION_RANGES.pressure.min || pressure > VALIDATION_RANGES.pressure.max) {
    errors.push({
      field: 'pressure',
      message: `Pressure should be between ${VALIDATION_RANGES.pressure.min} and ${VALIDATION_RANGES.pressure.max} kPa`,
      type: 'warning',
    });
  }
  
  // Pollutant Validation
  const { type, inletConcentration, targetEfficiency } = input.pollutant;
  
  if (!POLLUTANT_LIBRARY[type]) {
    errors.push({
      field: 'pollutantType',
      message: 'Invalid pollutant type selected',
      type: 'error',
    });
  }
  
  if (inletConcentration <= 0) {
    errors.push({
      field: 'inletConcentration',
      message: 'Inlet concentration must be greater than 0',
      type: 'error',
    });
  }
  
  if (targetEfficiency < VALIDATION_RANGES.targetEfficiency.min || targetEfficiency > VALIDATION_RANGES.targetEfficiency.max) {
    errors.push({
      field: 'targetEfficiency',
      message: `Target efficiency should be between ${VALIDATION_RANGES.targetEfficiency.min * 100}% and ${VALIDATION_RANGES.targetEfficiency.max * 100}%`,
      type: 'error',
    });
  }
  
  // Tower Parameters Validation
  const { lgRatio, gasVelocity, dropletSize, liquidDensity, liquidViscosity, nozzlePressure } = input.tower;
  
  if (lgRatio <= 0) {
    errors.push({
      field: 'lgRatio',
      message: 'L/G ratio must be greater than 0',
      type: 'error',
    });
  } else if (lgRatio < VALIDATION_RANGES.lgRatio.min || lgRatio > VALIDATION_RANGES.lgRatio.max) {
    errors.push({
      field: 'lgRatio',
      message: `L/G ratio should be between ${VALIDATION_RANGES.lgRatio.min} and ${VALIDATION_RANGES.lgRatio.max} m³/m³`,
      type: 'warning',
    });
  }
  
  if (gasVelocity <= 0) {
    errors.push({
      field: 'gasVelocity',
      message: 'Gas velocity must be greater than 0',
      type: 'error',
    });
  } else if (gasVelocity < VALIDATION_RANGES.gasVelocity.min || gasVelocity > VALIDATION_RANGES.gasVelocity.max) {
    errors.push({
      field: 'gasVelocity',
      message: `Gas velocity should be between ${VALIDATION_RANGES.gasVelocity.min} and ${VALIDATION_RANGES.gasVelocity.max} m/s`,
      type: 'warning',
    });
  }
  
  if (gasVelocity > 2.3) {
    errors.push({
      field: 'gasVelocity',
      message: 'Gas velocity above 2.3 m/s may cause droplet entrainment',
      type: 'warning',
    });
  }
  
  if (dropletSize <= 0) {
    errors.push({
      field: 'dropletSize',
      message: 'Droplet size must be greater than 0',
      type: 'error',
    });
  } else if (dropletSize < VALIDATION_RANGES.dropletSize.min || dropletSize > VALIDATION_RANGES.dropletSize.max) {
    errors.push({
      field: 'dropletSize',
      message: `Droplet size should be between ${VALIDATION_RANGES.dropletSize.min} and ${VALIDATION_RANGES.dropletSize.max} mm`,
      type: 'warning',
    });
  }
  
  if (liquidDensity <= 0) {
    errors.push({
      field: 'liquidDensity',
      message: 'Liquid density must be greater than 0',
      type: 'error',
    });
  }
  
  if (liquidViscosity <= 0) {
    errors.push({
      field: 'liquidViscosity',
      message: 'Liquid viscosity must be greater than 0',
      type: 'error',
    });
  }
  
  if (nozzlePressure <= 0) {
    errors.push({
      field: 'nozzlePressure',
      message: 'Nozzle pressure must be greater than 0',
      type: 'error',
    });
  }
  
  return errors;
}

export function hasErrors(errors: ValidationError[]): boolean {
  return errors.some(error => error.type === 'error');
}

export function hasWarnings(errors: ValidationError[]): boolean {
  return errors.some(error => error.type === 'warning');
}