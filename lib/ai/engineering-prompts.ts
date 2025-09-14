// Engineering Report Prompts with Regulatory Context
// File: lib/ai/engineering-prompts.ts

import { CalculatorInput, CalculationResults, RegulatoryFramework } from '@/types';
import { REGULATORY_FRAMEWORKS } from '@/lib/constants';

export interface PromptContext {
  input: CalculatorInput;
  results: CalculationResults;
  companyName?: string;
  projectName?: string;
  engineerName?: string;
}

// Base system prompt with strict data integrity requirements - Optimized for GPT-5
export const SYSTEM_PROMPT = `You are an expert chemical engineering AI assistant with advanced capabilities in air pollution control systems and spray tower design. As GPT-5, you have superior analytical capabilities and deep technical knowledge. Your role is to create comprehensive, accurate engineering reports based on provided calculation data.

CRITICAL REQUIREMENTS:
1. NEVER modify, alter, or recalculate any numerical data provided
2. Use ONLY the exact values given in the input data
3. All numerical results must be preserved exactly as provided
4. Focus on professional technical writing and analysis interpretation
5. Follow applicable regulatory frameworks and engineering standards
6. Provide context, explanations, and recommendations based on the data
7. Maintain strict adherence to engineering ethics and accuracy

REGULATORY KNOWLEDGE:
- US EPA regulations for air pollution control
- EU Industrial Emissions Directive requirements  
- ASME pressure vessel codes
- NFPA safety standards
- Local air quality management requirements

ENGINEERING PRINCIPLES:
- Mass transfer fundamentals
- Gas-liquid contacting systems
- Spray tower hydraulics and design
- Pollutant removal mechanisms
- Process safety considerations`;

// Generate regulatory context based on framework
export function getRegulatoryContext(framework: RegulatoryFramework): string {
  const reg = REGULATORY_FRAMEWORKS[framework];
  
  return `
REGULATORY FRAMEWORK: ${framework} - ${reg.name}

Key Requirements:
- Emission Units: ${reg.emissionUnits}
- Pressure Vessel Code: ${reg.codes.pressureVessel}
- Testing Standards: ${reg.codes.testing}  
- Safety Requirements: ${reg.codes.safety}
- Documentation Standards: Standard engineering documentation

Design Considerations:
- Compliance monitoring requirements
- Operational reporting obligations
- Material compatibility standards
- Safety factor requirements
- Environmental impact assessments`;
}

// Generate comprehensive data context prompt
export function generateDataContextPrompt(context: PromptContext): string {
  const { input, results } = context;
  const regulatoryContext = getRegulatoryContext(input.settings.regulatoryFramework);
  
  return `${SYSTEM_PROMPT}

${regulatoryContext}

PROJECT DATA (DO NOT MODIFY THESE VALUES):

INPUT PARAMETERS:
Gas Stream Properties:
- Flow Rate: ${input.gasStream.gasFlowRate} ${input.settings.unitSystem === 'metric' ? 'Nm³/h' : 'ACFM'}
- Temperature: ${input.gasStream.temperature} ${input.settings.unitSystem === 'metric' ? '°C' : '°F'}
- Pressure: ${input.gasStream.pressure} ${input.settings.unitSystem === 'metric' ? 'kPa' : 'psi'}
- Gas Viscosity: ${input.gasStream.gasViscosity || '1.85×10⁻⁵'} Pa·s

Pollutant Properties:
- Type: ${input.pollutant.type}
- Inlet Concentration: ${input.pollutant.inletConcentration} ${input.settings.regulatoryFramework === 'US' ? 'ppmvd' : 'mg/Nm³'}
- Target Efficiency: ${(input.pollutant.targetEfficiency * 100).toFixed(1)}%

Tower Parameters:
- L/G Ratio: ${input.tower.lgRatio} m³/m³
- Liquid Density: ${input.tower.liquidDensity} kg/m³
- Liquid Viscosity: ${input.tower.liquidViscosity} Pa·s
- Gas Velocity: ${input.tower.gasVelocity} m/s
- Droplet Size: ${input.tower.dropletSize} mm
- Nozzle Pressure: ${input.tower.nozzlePressure} bar
- Friction Factor: ${input.tower.frictionFactor}
- Pump Head: ${input.tower.pumpHead} m
- NaOH Stoichiometry: ${input.tower.naohStoichiometry} mol/mol

CALCULATION RESULTS (DO NOT MODIFY THESE VALUES):

Primary Results:
- Tower Diameter: ${results.towerDiameter.toFixed(3)} ${input.settings.unitSystem === 'metric' ? 'm' : 'ft'}
- Required Height: ${results.requiredHeight.toFixed(3)} ${input.settings.unitSystem === 'metric' ? 'm' : 'ft'}
- Pressure Drop: ${results.pressureDrop.toFixed(2)} ${input.settings.unitSystem === 'metric' ? 'Pa' : 'in.H₂O'}
- Outlet Concentration: ${results.outletConcentration.toFixed(3)} ${input.settings.regulatoryFramework === 'US' ? 'ppmvd' : 'mg/Nm³'}

Secondary Results:
- Overall KG·a: ${results.overallKGa.toExponential(3)} 1/s
- Gas Density: ${results.gasDensity.toFixed(4)} kg/m³
- Liquid Rate: ${results.liquidRate.toFixed(2)} m³/h
- Gas Residence Time: ${results.gasResidenceTime.toFixed(3)} s
- NaOH Consumption: ${results.naohConsumption.toFixed(2)} mol/h

Advanced Physics:
- Reynolds Number: ${results.reynoldsNumber.toFixed(0)}
- Schmidt Number: ${results.schmidtNumber.toFixed(3)}
- Sherwood Number: ${results.sherwoodNumber.toFixed(3)}
- Droplet Terminal Velocity: ${results.dropletTerminalVelocity.toFixed(4)} m/s

Compliance Status:
- Framework: ${results.complianceStatus.framework}
- Emission Limits Met: ${results.complianceStatus.emissionLimitsMet ? 'YES' : 'NO'}
- Pressure Vessel Code: ${results.complianceStatus.pressureVesselCode}

PROJECT INFORMATION:
- Company: ${context.companyName || 'Not Specified'}
- Project: ${context.projectName || 'Spray Tower Design'}
- Engineer: ${context.engineerName || 'Not Specified'}
- Date: ${new Date().toLocaleDateString()}`;
}

// Specific report section prompts
export const REPORT_PROMPTS = {
  executive_summary: `Write a professional executive summary (200-300 words) for this spray tower design report. Include:
- Project purpose and scope
- Key design parameters and results
- Regulatory compliance status
- Major recommendations
- Overall feasibility assessment

Use the exact numerical values provided. Do not recalculate anything.`,

  technical_analysis: `Provide a detailed technical analysis (400-500 words) covering:
- Mass transfer performance evaluation
- Hydraulic design adequacy
- Process efficiency assessment
- Equipment sizing rationale
- Operating parameter optimization
- Potential performance limitations

Base your analysis on the provided calculation results without modifying any values.`,

  compliance_review: `Create a comprehensive regulatory compliance review (300-400 words) including:
- Applicable regulations and standards
- Emission limit compliance assessment
- Design code requirements
- Safety considerations
- Monitoring and reporting obligations
- Permit considerations

Reference the specific regulatory framework and compliance status provided.`,

  recommendations: `Develop professional engineering recommendations (250-350 words) covering:
- Design optimization opportunities
- Operational considerations
- Maintenance requirements
- Process monitoring needs
- Future expansion considerations
- Risk mitigation strategies

Base recommendations on the actual performance results provided.`
} as const;

export type ReportSection = keyof typeof REPORT_PROMPTS;