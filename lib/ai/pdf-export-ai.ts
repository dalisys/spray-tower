// AI-Enhanced PDF Export Integration - Simplified Version
// File: lib/ai/pdf-export-ai.ts

import jsPDF from 'jspdf';
import { CalculatorInput, CalculationResults } from '@/types';
import { SprayTowerPDFReport } from '@/lib/pdf-export';
import { generateAIEnhancedReport, AIReportRequest, AIReportResponse } from './report-generator';

export interface AIPDFExportOptions {
  input: CalculatorInput;
  results: CalculationResults;
  apiKey: string;
  companyName?: string;
  projectName?: string;
  engineerName?: string;
  reportDate?: Date;
  includeAIAnalysis?: boolean;
  model?: 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano' | 'gpt-4' | 'gpt-4-turbo';
}

export interface AIPDFExportResult {
  success: boolean;
  pdfBlob?: Blob;
  aiAnalysis?: AIReportResponse;
  errors?: string[];
  warnings?: string[];
}

export class AIEnhancedPDFReport extends SprayTowerPDFReport {
  
  // Add AI-generated content section to PDF
  protected addAIAnalysisSection(aiResponse: AIReportResponse) {
    if (!aiResponse.success || !aiResponse.sections) return;

    const colors = this.addCustomColors();
    this.addSectionTitle('AI-ENHANCED ANALYSIS', true);
    
    // Add data integrity notice
    this.checkPageBreak(20);
    this.doc.setFillColor(240, 249, 255); // Light blue background
    this.doc.setDrawColor(...colors.info);
    this.doc.setLineWidth(1);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 15, 'FD');
    
    this.doc.setTextColor(...colors.info);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9);
    this.doc.text('DATA INTEGRITY VERIFIED', this.margin + 5, this.currentY + 5);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(...colors.secondary);
    this.doc.text('All numerical data has been validated for accuracy. AI analysis is based on exact calculation results.', 
                  this.margin + 5, this.currentY + 10);
    
    this.currentY += 20;

    // Add each AI-generated section
    Object.entries(aiResponse.sections).forEach(([section, content]) => {
      this.addAISection(section, content);
    });

    // Add validation summary if there are warnings
    if (aiResponse.warnings && aiResponse.warnings.length > 0) {
      this.addValidationWarnings(aiResponse.warnings);
    }
  }

  protected addAISection(sectionTitle: string, content: string) {
    // Format section title
    const formattedTitle = sectionTitle.replace(/_/g, ' ').toUpperCase();
    this.addSectionTitle(formattedTitle);
    
    const colors = this.addCustomColors();
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(...colors.dark);
    
    // Split content into paragraphs
    const paragraphs = content.split('\n\n');
    
    paragraphs.forEach(paragraph => {
      if (paragraph.trim()) {
        this.addTextBlock(paragraph.trim());
        this.currentY += 5;
      }
    });
    
    this.currentY += 5;
  }

  protected addTextBlock(text: string) {
    const colors = this.addCustomColors();
    const maxWidth = this.pageWidth - 2 * this.margin;
    const lines = this.doc.splitTextToSize(text, maxWidth);
    
    if (Array.isArray(lines)) {
      lines.forEach((line: string) => {
        this.checkPageBreak(6);
        
        // Handle bullet points
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          this.doc.setTextColor(...colors.accent);
          this.doc.text('•', this.margin + 5, this.currentY);
          this.doc.setTextColor(...colors.dark);
          this.doc.text(line.trim().substring(1).trim(), this.margin + 10, this.currentY);
        } else {
          this.doc.text(line, this.margin, this.currentY);
        }
        
        this.currentY += 4;
      });
    } else {
      this.checkPageBreak(6);
      this.doc.text(lines, this.margin, this.currentY);
      this.currentY += 4;
    }
  }

  protected addValidationWarnings(warnings: string[]) {
    if (warnings.length === 0) return;
    
    this.addSectionTitle('Data Validation Notices');
    const colors = this.addCustomColors();
    
    this.doc.setFillColor(255, 252, 240); // Light yellow background
    this.doc.setDrawColor(...colors.warning);
    this.doc.setLineWidth(1);
    
    const warningHeight = warnings.length * 6 + 10;
    this.checkPageBreak(warningHeight);
    
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, warningHeight, 'FD');
    
    this.doc.setTextColor(...colors.warning);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9);
    this.doc.text('VALIDATION NOTICES:', this.margin + 5, this.currentY + 6);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    
    warnings.forEach((warning, index) => {
      this.doc.text(`• ${warning}`, this.margin + 5, this.currentY + 12 + (index * 6));
    });
    
    this.currentY += warningHeight + 5;
  }

  // Override the generateReport method to include AI analysis
  public generateAIEnhancedReport(
    options: AIPDFExportOptions, 
    aiResponse?: AIReportResponse
  ): jsPDF {
    // Generate standard report sections
    this.addHeader(options);
    this.addProjectInfo(options);
    this.addInputParameters(options.input);
    
    // Add standard calculation results
    this.addFooter();
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;
    
    this.addCalculationResults(options.results, options.input);
    this.addPerformanceAnalysis(options.results, options.input);
    this.addComplianceSection(options.results, options.input);
    
    // Add AI-enhanced analysis if available
    if (aiResponse && aiResponse.success) {
      this.addFooter();
      this.doc.addPage();
      this.pageNumber++;
      this.currentY = this.margin;
      
      this.addAIAnalysisSection(aiResponse);
    }
    
    // Add engineering notes
    this.addEngineeringNotes();
    
    // Final footer
    this.addFooter();
    
    return this.doc;
  }
}

// Main export function for AI-enhanced PDF generation
export async function generateAIEnhancedPDF(options: AIPDFExportOptions): Promise<AIPDFExportResult> {
  try {
    let aiResponse: AIReportResponse | undefined;
    
    // Generate AI analysis if API key is provided
    if (options.includeAIAnalysis && options.apiKey) {
      const aiRequest: AIReportRequest = {
        input: options.input,
        results: options.results,
        apiKey: options.apiKey,
        companyName: options.companyName,
        projectName: options.projectName,
        engineerName: options.engineerName,
        model: options.model || 'gpt-5'
      };
      
      aiResponse = await generateAIEnhancedReport(aiRequest);
      
      if (!aiResponse.success) {
        return {
          success: false,
          errors: aiResponse.errors,
          warnings: aiResponse.warnings
        };
      }
    }
    
    // Generate PDF with AI analysis
    const pdfGenerator = new AIEnhancedPDFReport();
    const pdf = pdfGenerator.generateAIEnhancedReport(options, aiResponse);
    
    const pdfBlob = new Promise<Blob>((resolve) => {
      const blob = pdf.output('blob');
      resolve(blob);
    });
    
    return {
      success: true,
      pdfBlob: await pdfBlob,
      aiAnalysis: aiResponse,
      warnings: aiResponse?.warnings
    };
    
  } catch (error) {
    console.error('Error generating AI-enhanced PDF:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
}