// AI-Powered Report Generator
// File: lib/ai/report-generator.ts

import OpenAI from 'openai';
import { CalculatorInput, CalculationResults } from '@/types';
import { createOpenAIClient, DEFAULT_AI_CONFIG, AvailableModel } from './openai-config';
import { 
  generateDataContextPrompt, 
  REPORT_PROMPTS, 
  ReportSection, 
  PromptContext 
} from './engineering-prompts';
import { 
  validateInputData, 
  validateCalculationResults, 
  createDataIntegrityChecks,
  validateDataIntegrity,
  sanitizeAIResponse,
  ValidationResult,
  DataIntegrityCheck
} from './data-validator';

export interface AIReportRequest {
  input: CalculatorInput;
  results: CalculationResults;
  apiKey: string;
  companyName?: string;
  projectName?: string;
  engineerName?: string;
  model?: AvailableModel;
  sections?: ReportSection[];
}

export interface AIReportResponse {
  success: boolean;
  content?: string;
  sections?: Record<ReportSection, string>;
  errors?: string[];
  warnings?: string[];
  dataIntegrityChecks: DataIntegrityCheck[];
  validationResult: ValidationResult;
}

export class AIReportGenerator {
  private client: OpenAI;
  private model: string;
  private dataIntegrityChecks: DataIntegrityCheck[] = [];

  constructor(apiKey: string, model: AvailableModel = 'gpt-5') {
    this.client = createOpenAIClient(apiKey);
    this.model = model;
  }

  // Generate complete AI-enhanced report
  async generateReport(request: AIReportRequest): Promise<AIReportResponse> {
    try {
      // Validate input data first
      const inputValidation = validateInputData(request.input);
      const resultsValidation = validateCalculationResults(request.results);

      if (!inputValidation.isValid || !resultsValidation.isValid) {
        return {
          success: false,
          errors: [...inputValidation.errors, ...resultsValidation.errors],
          warnings: [...inputValidation.warnings, ...resultsValidation.warnings],
          dataIntegrityChecks: [],
          validationResult: {
            isValid: false,
            errors: [...inputValidation.errors, ...resultsValidation.errors],
            warnings: [...inputValidation.warnings, ...resultsValidation.warnings]
          }
        };
      }

      // Create data integrity checks
      this.dataIntegrityChecks = createDataIntegrityChecks(request.input, request.results);

      // Generate report sections
      const sections = request.sections || ['executive_summary', 'technical_analysis', 'compliance_review', 'recommendations'];
      const generatedSections: Record<string, string> = {};

      const promptContext: PromptContext = {
        input: request.input,
        results: request.results,
        companyName: request.companyName,
        projectName: request.projectName,
        engineerName: request.engineerName
      };

      const baseContext = generateDataContextPrompt(promptContext);

      // Generate each section
      for (const section of sections) {
        try {
          const sectionContent = await this.generateSection(baseContext, section);
          generatedSections[section] = sanitizeAIResponse(sectionContent);
        } catch (error) {
          console.error(`Error generating section ${section}:`, error);
          generatedSections[section] = `Error generating ${section}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }

      // Combine sections into full report
      const fullReport = this.combineReportSections(generatedSections as Record<ReportSection, string>);

      // Validate data integrity
      const integrityValidation = validateDataIntegrity(this.dataIntegrityChecks, fullReport);

      return {
        success: true,
        content: fullReport,
        sections: generatedSections as Record<ReportSection, string>,
        warnings: [...inputValidation.warnings, ...resultsValidation.warnings, ...integrityValidation.warnings],
        dataIntegrityChecks: this.dataIntegrityChecks,
        validationResult: integrityValidation
      };

    } catch (error) {
      console.error('Error generating AI report:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        dataIntegrityChecks: this.dataIntegrityChecks,
        validationResult: {
          isValid: false,
          errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
          warnings: []
        }
      };
    }
  }

  // Generate individual report section
  private async generateSection(baseContext: string, section: ReportSection): Promise<string> {
    const sectionPrompt = REPORT_PROMPTS[section];
    const isGPT5 = this.model.startsWith('gpt-5');
    
    // Create request parameters based on model version
    const requestParams: any = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: baseContext
        },
        {
          role: 'user',
          content: sectionPrompt
        }
      ]
    };
    
    // GPT-5 has different parameter support than GPT-4
    if (isGPT5) {
      // GPT-5 only supports default temperature (1) and specific parameters
      requestParams.max_completion_tokens = DEFAULT_AI_CONFIG.maxCompletionTokens;
      // Remove unsupported parameters for GPT-5: temperature, presence_penalty, frequency_penalty
    } else {
      // GPT-4 supports traditional parameters
      requestParams.max_tokens = DEFAULT_AI_CONFIG.maxCompletionTokens;
      requestParams.temperature = DEFAULT_AI_CONFIG.temperature;
      requestParams.presence_penalty = 0.1;
      requestParams.frequency_penalty = 0.1;
    }
    
    const response = await this.client.chat.completions.create(requestParams);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error(`No content generated for section: ${section}`);
    }

    return content.trim();
  }

  // Combine sections into formatted report
  private combineReportSections(sections: Record<ReportSection, string>): string {
    const sectionTitles = {
      executive_summary: 'EXECUTIVE SUMMARY',
      technical_analysis: 'TECHNICAL ANALYSIS',
      compliance_review: 'REGULATORY COMPLIANCE REVIEW',
      recommendations: 'ENGINEERING RECOMMENDATIONS'
    };

    let report = '';
    
    Object.entries(sections).forEach(([section, content]) => {
      const title = sectionTitles[section as ReportSection];
      report += `\n\n${title}\n${'='.repeat(title.length)}\n\n${content}`;
    });

    return report.trim();
  }
}

// Convenience function for generating reports
export async function generateAIEnhancedReport(request: AIReportRequest): Promise<AIReportResponse> {
  const generator = new AIReportGenerator(request.apiKey, request.model);
  return await generator.generateReport(request);
}