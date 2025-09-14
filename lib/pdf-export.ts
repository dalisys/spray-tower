import jsPDF from 'jspdf';
import { CalculatorInput, CalculationResults } from '@/types';
import { POLLUTANT_LIBRARY, APPLICATION_RECOMMENDATIONS, REGULATORY_FRAMEWORKS } from '@/lib/constants';

export interface PDFReportOptions {
  input: CalculatorInput;
  results: CalculationResults;
  companyName?: string;
  projectName?: string;
  engineerName?: string;
  reportDate?: Date;
}

export class SprayTowerPDFReport {
  protected doc: jsPDF;
  protected pageWidth: number;
  protected pageHeight: number;
  protected margin: number;
  protected currentY: number;
  protected pageNumber: number;
  
  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
    this.pageNumber = 1;
    
    // Add fonts and styles
    this.setupStyles();
  }
  
  private setupStyles() {
    // Set default font
    this.doc.setFont('helvetica');
    
    // Add custom colors (RGB values)
    // Define our color palette
    this.addCustomColors();
  }
  
  protected addCustomColors() {
    // Professional engineering color scheme with blue and green accents
    return {
      primary: [30, 58, 138] as [number, number, number], // Professional blue
      secondary: [75, 85, 99] as [number, number, number], // Slate gray
      accent: [59, 130, 246] as [number, number, number], // Bright blue for highlights
      success: [34, 197, 94] as [number, number, number], // Professional green
      warning: [245, 158, 11] as [number, number, number], // Amber warning color
      error: [220, 38, 127] as [number, number, number], // Professional red/pink
      info: [59, 130, 246] as [number, number, number], // Blue for info
      light: [248, 250, 252] as [number, number, number], // Very light blue-gray
      dark: [15, 23, 42] as [number, number, number], // Dark slate
      white: [255, 255, 255] as [number, number, number], // Pure white
      border: [148, 163, 184] as [number, number, number], // Light slate for borders
      headerBg: [239, 246, 255] as [number, number, number], // Light blue background
      resultsBg: [240, 253, 244] as [number, number, number] // Light green background
    };
  }
  
  protected addHeader(options: PDFReportOptions) {
    const colors = this.addCustomColors();
    
    // Header background
    this.doc.setFillColor(...colors.headerBg);
    this.doc.rect(0, 0, this.pageWidth, 50, 'F');
    
    // Top border line with gradient effect using multiple lines
    this.doc.setDrawColor(...colors.primary);
    this.doc.setLineWidth(3);
    this.doc.line(this.margin, 15, this.pageWidth - this.margin, 15);
    this.doc.setDrawColor(...colors.accent);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, 16, this.pageWidth - this.margin, 16);
    
    // Company logo area with blue accent
    this.doc.setFillColor(...colors.accent);
    this.doc.setDrawColor(...colors.primary);
    this.doc.setLineWidth(1);
    this.doc.rect(this.margin, 20, 35, 20, 'FD');
    this.doc.setTextColor(...colors.white);
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('COMPANY', this.margin + 17.5, 28, { align: 'center' });
    this.doc.text('LOGO', this.margin + 17.5, 34, { align: 'center' });
    
    // Main title with blue color
    this.doc.setTextColor(...colors.primary);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('SPRAY TOWER DESIGN REPORT', this.pageWidth - this.margin, 25, { align: 'right' });
    
    // Subtitle with accent color
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...colors.accent);
    this.doc.text('Gas Scrubbing System - Engineering Calculation Report', this.pageWidth - this.margin, 32, { align: 'right' });
    
    // Report type indicator with success color
    this.doc.setFontSize(8);
    this.doc.setTextColor(...colors.success);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TECHNICAL REPORT', this.pageWidth - this.margin, 37, { align: 'right' });
    
    // Bottom border with gradient
    this.doc.setDrawColor(...colors.primary);
    this.doc.setLineWidth(2);
    this.doc.line(this.margin, 45, this.pageWidth - this.margin, 45);
    this.doc.setDrawColor(...colors.accent);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, 46, this.pageWidth - this.margin, 46);
    
    this.currentY = 55;
  }
  
  protected addFooter() {
    const colors = this.addCustomColors();
    const y = this.pageHeight - 15;
    
    // Footer line
    this.doc.setDrawColor(...colors.border);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, y - 5, this.pageWidth - this.margin, y - 5);
    
    // Footer text
    this.doc.setTextColor(...colors.secondary);
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'normal');
    
    const footerText = `Generated by Spray Tower Calculator Professional v1.0`;
    this.doc.text(footerText, this.margin, y);
    
    // Page number
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${this.pageNumber}`, this.pageWidth - this.margin, y, { align: 'right' });
    
    // Date
    this.doc.setFont('helvetica', 'normal');
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    this.doc.text(`${date}`, this.pageWidth / 2, y, { align: 'center' });
  }
  
  protected checkPageBreak(requiredHeight: number) {
    if (this.currentY + requiredHeight > this.pageHeight - 30) {
      this.addFooter();
      this.doc.addPage();
      this.pageNumber++;
      this.currentY = this.margin;
    }
  }
  
  protected addSectionTitle(title: string, isMainSection: boolean = false) {
    this.checkPageBreak(20);
    const colors = this.addCustomColors();
    
    if (isMainSection) {
      // Main section with blue gradient background
      this.doc.setFillColor(...colors.headerBg);
      this.doc.setDrawColor(...colors.primary);
      this.doc.setLineWidth(1);
      this.doc.rect(this.margin, this.currentY - 1, this.pageWidth - 2 * this.margin, 10, 'FD');
      
      // Add accent stripe
      this.doc.setFillColor(...colors.accent);
      this.doc.rect(this.margin, this.currentY - 1, 4, 10, 'F');
      
      this.doc.setTextColor(...colors.primary);
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(title.toUpperCase(), this.margin + 8, this.currentY + 6);
      
      this.currentY += 15;
    } else {
      // Subsection with colored underline
      this.doc.setTextColor(...colors.accent);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(title, this.margin, this.currentY + 4);
      
      // Colored underline
      const textWidth = this.doc.getTextWidth(title);
      this.doc.setDrawColor(...colors.success);
      this.doc.setLineWidth(1.5);
      this.doc.line(this.margin, this.currentY + 6, this.margin + textWidth, this.currentY + 6);
      
      this.currentY += 12;
    }
  }
  
  protected addProjectInfo(options: PDFReportOptions) {
    const colors = this.addCustomColors();
    this.addSectionTitle('PROJECT INFORMATION', true);
    
    const info = [
      ['Company:', options.companyName || 'Not Specified'],
      ['Project:', options.projectName || 'Spray Tower Design'],
      ['Engineer:', options.engineerName || 'Not Specified'],
      ['Calculation Date:', (options.reportDate || new Date()).toLocaleDateString()],
      ['Software:', 'Spray Tower Calculator v1.0'],
      ['Regulatory Framework:', `${options.input.settings.regulatoryFramework} (${REGULATORY_FRAMEWORKS[options.input.settings.regulatoryFramework].name})`],
      ['Unit System:', options.input.settings.unitSystem === 'metric' ? 'Metric (SI)' : 'Imperial (US)'],
      ['Application Type:', APPLICATION_RECOMMENDATIONS[options.input.settings.applicationType].description]
    ];
    
    this.addInfoTable(info);
    this.currentY += 10;
  }
  
  private addInfoTable(data: string[][]) {
    const colors = this.addCustomColors();
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    
    data.forEach((row, index) => {
      this.checkPageBreak(6);
      
      // Minimal alternating rows - very subtle
      if (index % 2 === 0) {
        this.doc.setFillColor(...colors.light);
        this.doc.rect(this.margin, this.currentY - 1, this.pageWidth - 2 * this.margin, 5, 'F');
      }
      
      // Thin border lines for professional table look
      this.doc.setDrawColor(...colors.border);
      this.doc.setLineWidth(0.1);
      this.doc.line(this.margin, this.currentY + 4, this.pageWidth - this.margin, this.currentY + 4);
      
      // Label
      this.doc.setTextColor(...colors.secondary);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(row[0], this.margin + 2, this.currentY + 2);
      
      // Value
      this.doc.setTextColor(...colors.dark);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(row[1], this.margin + 55, this.currentY + 2);
      
      this.currentY += 5;
    });
    
    // Final border
    this.doc.setDrawColor(...colors.border);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 3;
  }

  private addParticulateEfficiencyTable(data: string[][]) {
    const colors = this.addCustomColors();
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    
    data.forEach((row, index) => {
      // Calculate available space properly
      const availableWidth = this.pageWidth - 2 * this.margin;
      const labelMaxWidth = 70; // Space for label column
      const valueMaxWidth = availableWidth - labelMaxWidth - 10; // Remaining space minus padding
      const valueStartX = this.margin + labelMaxWidth + 5; // Start position for value column
      
      // Pre-calculate how many lines we need for both label and value
      const labelLines = this.doc.splitTextToSize(row[0], labelMaxWidth);
      const valueLines = this.doc.splitTextToSize(row[1], valueMaxWidth);
      
      const labelLineCount = Array.isArray(labelLines) ? labelLines.length : 1;
      const valueLineCount = Array.isArray(valueLines) ? valueLines.length : 1;
      const maxLineCount = Math.max(labelLineCount, valueLineCount);
      const rowHeight = Math.max(7, maxLineCount * 4 + 3); // Dynamic row height based on content
      
      this.checkPageBreak(rowHeight + 2);
      
      // Background for alternating rows with dynamic height
      if (index % 2 === 0) {
        this.doc.setFillColor(...colors.light);
        this.doc.rect(this.margin, this.currentY - 1, availableWidth, rowHeight, 'F');
      }
      
      // Label - with proper text wrapping
      this.doc.setTextColor(...colors.secondary);
      this.doc.setFont('helvetica', 'normal');
      
      if (Array.isArray(labelLines)) {
        labelLines.forEach((line: string, lineIndex: number) => {
          this.doc.text(line, this.margin + 2, this.currentY + 3 + (lineIndex * 4));
        });
      } else {
        this.doc.text(labelLines, this.margin + 2, this.currentY + 3);
      }
      
      // Value - with proper text wrapping and correct width limits
      this.doc.setTextColor(...colors.dark);
      this.doc.setFont('helvetica', 'bold');
      
      if (Array.isArray(valueLines)) {
        valueLines.forEach((line: string, lineIndex: number) => {
          this.doc.text(line, valueStartX, this.currentY + 3 + (lineIndex * 4));
        });
      } else {
        this.doc.text(valueLines, valueStartX, this.currentY + 3);
      }
      
      this.currentY += rowHeight;
      
      // Bottom border line for each row
      this.doc.setDrawColor(...colors.border);
      this.doc.setLineWidth(0.1);
      this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    });
    
    // Final border
    this.doc.setDrawColor(...colors.border);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 3;
  }
  
  protected addInputParameters(input: CalculatorInput) {
    const colors = this.addCustomColors();
    
    // Gas Stream Properties
    this.addSectionTitle('INPUT PARAMETERS', true);
    this.addSectionTitle('Gas Stream Properties');
    const gasData = [
      ['Gas Flow Rate:', `${input.gasStream.gasFlowRate} ${input.settings.unitSystem === 'metric' ? 'Nm³/h' : 'ACFM'}`],
      ['Operating Temperature:', `${input.gasStream.temperature} ${input.settings.unitSystem === 'metric' ? '°C' : '°F'}`],
      ['Operating Pressure:', `${input.gasStream.pressure} ${input.settings.unitSystem === 'metric' ? 'kPa' : 'psi'}`],
      ['Gas Viscosity:', `${input.gasStream.gasViscosity ? input.gasStream.gasViscosity.toExponential(2) : '1.85×10⁻⁵'} Pa·s`]
    ];
    this.addInfoTable(gasData);
    
    // Pollutant Properties
    this.addSectionTitle('Pollutant Properties');
    const pollutantData = POLLUTANT_LIBRARY[input.pollutant.type];
    const pollutantInfo = [
      ['Pollutant Type:', input.pollutant.type],
      ['Inlet Concentration:', `${input.pollutant.inletConcentration} ${input.settings.regulatoryFramework === 'US' ? 'ppmvd' : 'mg/Nm³'}`],
      ['Target Efficiency:', `${(input.pollutant.targetEfficiency * 100).toFixed(1)}%`],
      ['Henry Constant:', `${pollutantData.henryConstant.toExponential(2)} Pa·m³/mol`],
      ['Diffusivity:', `${pollutantData.diffusivity.toExponential(2)} m²/s`],
      ['Molar Mass:', `${pollutantData.molarMass.toFixed(3)} g/mol`]
    ];
    this.addInfoTable(pollutantInfo);
    
    // Tower Parameters
    this.addSectionTitle('Tower Design Parameters');
    const towerData = [
      ['L/G Ratio:', `${input.tower.lgRatio} m³/m³`],
      ['Liquid Density:', `${input.tower.liquidDensity} kg/m³`],
      ['Liquid Viscosity:', `${input.tower.liquidViscosity} Pa·s`],
      ['Droplet Size:', `${input.tower.dropletSize} mm`],
      ['Nozzle Pressure:', `${input.tower.nozzlePressure} bar`],
      ['Nozzle Type:', input.tower.nozzleType || 'Not specified'],
      ['NaOH Stoichiometry:', `${input.tower.naohStoichiometry} mol/mol`],
      ['KG·a Override:', input.tower.kgaOverride ? `${input.tower.kgaOverride.toExponential(2)} 1/s` : 'Calculated'],
      ['Friction Factor:', `${input.tower.frictionFactor}` || 'Default'],
      ['Pump Head:', `${input.tower.pumpHead} m` || 'Not specified']
    ];
    this.addInfoTable(towerData);
    
    this.currentY += 10;
  }
  
  protected addCalculationResults(results: CalculationResults, input: CalculatorInput) {
    const colors = this.addCustomColors();
    
    // Primary Results
    this.addSectionTitle('CALCULATION RESULTS', true);
    
    // Key results in a professional bordered box with green background
    this.checkPageBreak(40);
    this.doc.setFillColor(...colors.resultsBg);
    this.doc.setDrawColor(...colors.success);
    this.doc.setLineWidth(2);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 30, 'FD');
    
    // Add success accent stripe
    this.doc.setFillColor(...colors.success);
    this.doc.rect(this.margin, this.currentY, 4, 30, 'F');
    
    this.doc.setTextColor(...colors.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(11);
    this.doc.text('DESIGN SPECIFICATIONS', this.margin + 8, this.currentY + 8);
    
    // Primary results grid
    const primaryResults = [
      ['Tower Diameter:', `${results.towerDiameter.toFixed(2)} ${input.settings.unitSystem === 'metric' ? 'm' : 'ft'}`],
      ['Tower Height:', `${results.requiredHeight.toFixed(2)} ${input.settings.unitSystem === 'metric' ? 'm' : 'ft'}`],
      ['Pressure Drop:', `${results.pressureDrop.toFixed(1)} ${input.settings.unitSystem === 'metric' ? 'Pa' : 'in.H₂O'}`],
      ['Outlet Concentration:', `${results.outletConcentration.toFixed(2)} ${input.settings.regulatoryFramework === 'US' ? 'ppmvd' : 'mg/Nm³'}`]
    ];
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(...colors.dark);
    primaryResults.forEach((result, index) => {
      const x = this.margin + 5 + (index % 2) * 85;
      const y = this.currentY + 16 + Math.floor(index / 2) * 6;
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(result[0], x, y);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(result[1], x + 35, y);
    });
    
    this.currentY += 40;
    
    // Secondary Results
    this.addSectionTitle('Secondary Parameters');
    const secondaryData = [
      ['Overall KG·a:', `${results.overallKGa.toExponential(2)} 1/s`],
      ['Gas Density:', `${results.gasDensity.toFixed(3)} kg/m³`],
      ['Liquid Rate:', `${results.liquidRate.toFixed(1)} m³/h`],
      ['Gas Residence Time:', `${results.gasResidenceTime.toFixed(2)} s`],
      ['NaOH Consumption:', `${results.naohConsumption.toFixed(2)} mol/h`],
      ['Interfacial Area:', `${results.interfacialArea.toFixed(2)} 1/m`],
      ['Tower Cross-sectional Area:', `${results.towerArea.toFixed(2)} m²`],
      ['Operating Gas Flow:', `${results.operatingGasFlow.toFixed(2)} m³/s`],
      ['Number of Transfer Units:', `${results.numberOfTransferUnits.toFixed(2)}`]
    ];
    this.addInfoTable(secondaryData);
    
    // Advanced Physics Results
    this.addSectionTitle('Advanced Physics Parameters');
    const advancedData = [
      ['Reynolds Number:', `${results.reynoldsNumber.toFixed(0)} (${results.reynoldsNumber < 2300 ? 'Laminar' : results.reynoldsNumber > 4000 ? 'Turbulent' : 'Transitional'})`],
      ['Schmidt Number:', `${results.schmidtNumber.toFixed(2)}`],
      ['Sherwood Number:', `${results.sherwoodNumber.toFixed(2)}`],
      ['Droplet Terminal Velocity:', `${results.dropletTerminalVelocity.toFixed(3)} m/s`],
      ['Gas-Droplet Relative Velocity:', `${results.relativeVelocity.toFixed(3)} m/s`],
      ['Droplet Contact Time:', `${results.dropletContactTime.toFixed(3)} s`]
    ];
    this.addInfoTable(advancedData);
    
    this.currentY += 10;
  }
  
  protected addPerformanceAnalysis(results: CalculationResults, input: CalculatorInput) {
    const colors = this.addCustomColors();
    
    this.addSectionTitle('PERFORMANCE ANALYSIS', true);
    
    // Efficiency calculation
    const efficiency = ((input.pollutant.inletConcentration - results.outletConcentration) / input.pollutant.inletConcentration * 100);
    const targetEfficiency = input.pollutant.targetEfficiency * 100;
    
    this.checkPageBreak(30);
    
    // Performance summary
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...colors.dark);
    this.doc.text('REMOVAL EFFICIENCY ANALYSIS', this.margin, this.currentY);
    this.currentY += 10;
    
    const performanceData = [
      ['Target Removal Efficiency:', `${targetEfficiency.toFixed(1)}%`],
      ['Calculated Efficiency:', `${efficiency.toFixed(2)}%`],
      ['Performance Status:', efficiency >= targetEfficiency ? 'MEETS REQUIREMENTS' : 'BELOW TARGET'],
      ['Inlet Concentration:', `${input.pollutant.inletConcentration} ${input.settings.regulatoryFramework === 'US' ? 'ppmvd' : 'mg/Nm³'}`],
      ['Outlet Concentration:', `${results.outletConcentration.toFixed(2)} ${input.settings.regulatoryFramework === 'US' ? 'ppmvd' : 'mg/Nm³'}`],
      ['Mass Removal Rate:', `${((input.pollutant.inletConcentration - results.outletConcentration) * input.gasStream.gasFlowRate / 1000).toFixed(2)} kg/h`]
    ];
    
    this.addInfoTable(performanceData);
    
    // Particulate efficiency if applicable
    if (results.particulateEfficiency) {
      this.addSectionTitle('Particulate Collection Efficiency');
      
      // Custom layout for particulate efficiency to avoid text overlap
      this.addParticulateEfficiencyTable([
        ['Coarse Particles (>10 μm):', `${(results.particulateEfficiency.coarse_10um * 100).toFixed(1)}%`],
        ['Medium Particles (~2 μm):', `${(results.particulateEfficiency.medium_2um * 100).toFixed(1)}%`],
        ['Fine Particles (<1 μm):', `${(results.particulateEfficiency.fine_1um * 100).toFixed(1)}%`],
        ['Collection Mechanism:', 'Inertial impaction, interception, and diffusion'],
        ['Recommendation:', 'Consider pre-filtration for fine particles (<1 μm)']
      ]);
    }
    
    this.currentY += 10;
  }
  
  protected addComplianceSection(results: CalculationResults, input: CalculatorInput) {
    const colors = this.addCustomColors();
    const isCompliant = results.complianceStatus.emissionLimitsMet;
    
    this.addSectionTitle('REGULATORY COMPLIANCE', true);
    
    // Compliance status box with conditional colors
    this.checkPageBreak(25);
    
    if (isCompliant) {
      this.doc.setFillColor(...colors.resultsBg);
      this.doc.setDrawColor(...colors.success);
      this.doc.setLineWidth(2);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 12, 'FD');
      
      // Success stripe
      this.doc.setFillColor(...colors.success);
      this.doc.rect(this.margin, this.currentY, 4, 12, 'F');
      
      this.doc.setTextColor(...colors.success);
    } else {
      // Warning background for non-compliant
      this.doc.setFillColor(255, 248, 220); // Light orange background
      this.doc.setDrawColor(...colors.warning);
      this.doc.setLineWidth(2);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 12, 'FD');
      
      // Warning stripe
      this.doc.setFillColor(...colors.warning);
      this.doc.rect(this.margin, this.currentY, 4, 12, 'F');
      
      this.doc.setTextColor(...colors.warning);
    }
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(11);
    this.doc.text(`COMPLIANCE STATUS: ${isCompliant ? 'COMPLIANT' : 'REQUIRES REVIEW'}`, 
      this.pageWidth / 2, this.currentY + 7, { align: 'center' });
    
    this.currentY += 20;
    
    // Regulatory details
    const framework = REGULATORY_FRAMEWORKS[input.settings.regulatoryFramework];
    const complianceData = [
      ['Regulatory Framework:', `${results.complianceStatus.framework} - ${framework.name}`],
      ['Emission Units:', framework.emissionUnits],
      ['Pressure Vessel Code:', framework.codes.pressureVessel],
      ['Testing Standards:', framework.codes.testing],
      ['Safety Requirements:', framework.codes.safety],
      ['Emission Limits Status:', isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'],
      ['Design Pressure Rating:', 'Per applicable pressure vessel code'],
      ['Material Specification:', 'Corrosion-resistant materials required']
    ];
    
    this.addInfoTable(complianceData);
    
    // Non-compliance recommendations
    if (!isCompliant) {
      this.addSectionTitle('Compliance Recommendations');
      
      this.doc.setTextColor(...colors.dark);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(10);
      this.doc.text('REQUIRED MODIFICATIONS:', this.margin, this.currentY);
      this.currentY += 8;
      
      const recommendations = [
        `• Increase tower height by ${Math.ceil(results.requiredHeight * 0.3)}m (current: ${results.requiredHeight.toFixed(1)}m)`,
        `• Increase L/G ratio by ${(input.tower.lgRatio * 0.2).toFixed(2)} m³/m³ (current: ${input.tower.lgRatio})`,
        `• Reduce gas velocity by ${(((results.operatingGasFlow / results.towerArea) * 0.2)).toFixed(1)} m/s`,
        `• Consider smaller droplet size (<${input.tower.dropletSize}mm)`,
        `• Add chemical enhancement or second absorption stage`,
        `• Optimize pH control (6-8 for acid gases)`,
        `• Consider pre-scrubber for high inlet concentrations`
      ];
      
      this.doc.setTextColor(...colors.secondary);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9);
      
      recommendations.forEach(rec => {
        this.checkPageBreak(6);
        this.doc.text(rec, this.margin + 5, this.currentY);
        this.currentY += 6;
      });
    }
    
    this.currentY += 10;
  }
  
  protected addEngineeringNotes() {
    const colors = this.addCustomColors();
    
    this.addSectionTitle('ENGINEERING NOTES & ASSUMPTIONS', true);
    
    const notes = [
      'DESIGN BASIS:',
      '• Calculations based on steady-state operation',
      '• Standard atmospheric conditions (0°C, 101.325 kPa) for normal volumes',
      '• Ideal gas behavior assumed for gas phase',
      '• Plug flow model for gas phase',
      '• Well-mixed liquid phase assumed',
      '',
      'CORRELATIONS USED:',
      '• KG·a correlation: KG·a = 0.1586 × Gm^0.8 × L^0.4',
      '• Sherwood number: Sh = 2 + 0.6 × Re^0.5 × Sc^0.33',
      '• Terminal velocity: Schiller-Naumann correlation',
      '• Number of Transfer Units (NTU) method for height calculation',
      '',
      'DESIGN CONSIDERATIONS:',
      '• Design pressure should be 1.1-1.3× operating pressure',
      '• Materials must be compatible with process fluids',
      '• Liquid distributor design critical for performance',
      '• Mist eliminator recommended to prevent liquid carryover',
      '• Regular maintenance required for optimal performance',
      '',
      'LIMITATIONS:',
      '• Valid for counter-current spray towers',
      '• Assumes uniform liquid distribution',
      '• Does not account for wall effects',
      '• Temperature and concentration variations not considered'
    ];
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(...colors.dark);
    
    notes.forEach(note => {
      this.checkPageBreak(5);
      if (note === '') {
        this.currentY += 3;
      } else if (note.endsWith(':')) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(note, this.margin, this.currentY);
        this.doc.setFont('helvetica', 'normal');
        this.currentY += 6;
      } else {
        this.doc.text(note, this.margin, this.currentY);
        this.currentY += 5;
      }
    });
  }
  
  public generateReport(options: PDFReportOptions): jsPDF {
    // Page 1 - Header and Project Info
    this.addHeader(options);
    this.addProjectInfo(options);
    this.addInputParameters(options.input);
    
    // Add new page for results
    this.addFooter();
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;
    
    // Page 2+ - Results and Analysis
    this.addCalculationResults(options.results, options.input);
    this.addPerformanceAnalysis(options.results, options.input);
    this.addComplianceSection(options.results, options.input);
    this.addEngineeringNotes();
    
    // Final footer
    this.addFooter();
    
    return this.doc;
  }
}

export async function generateSprayTowerReport(options: PDFReportOptions): Promise<Blob> {
  const reportGenerator = new SprayTowerPDFReport();
  const pdf = reportGenerator.generateReport(options);
  
  return new Promise((resolve) => {
    const blob = pdf.output('blob');
    resolve(blob);
  });
}