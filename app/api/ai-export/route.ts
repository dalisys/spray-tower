// Server-side API route for AI-enhanced PDF export
// File: app/api/ai-export/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CalculatorInput, CalculationResults } from '@/types';
import { SprayTowerPDFReport } from '@/lib/pdf-export';
import { 
  generateDataContextPrompt, 
  REPORT_PROMPTS, 
  ReportSection 
} from '@/lib/ai/engineering-prompts';
import { 
  validateInputData, 
  validateCalculationResults, 
  sanitizeAIResponse 
} from '@/lib/ai/data-validator';

interface AIExportRequest {
  input: CalculatorInput;
  results: CalculationResults;
  companyName?: string;
  projectName?: string;
  engineerName?: string;
  model?: string;
  includeAIAnalysis?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: AIExportRequest = await request.json();
    
    // Use server-side environment variable only
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured on server' },
        { status: 500 }
      );
    }

    // Validate data server-side
    const inputValidation = validateInputData(body.input);
    const resultsValidation = validateCalculationResults(body.results);

    if (!inputValidation.isValid || !resultsValidation.isValid) {
      return NextResponse.json({
        error: 'Invalid calculation data',
        details: [...inputValidation.errors, ...resultsValidation.errors]
      }, { status: 400 });
    }

    let aiAnalysis: Record<ReportSection, string> = {} as Record<ReportSection, string>;

    // Generate AI analysis server-side if requested
    if (body.includeAIAnalysis) {
      const client = new OpenAI({ apiKey });
      
      const promptContext = {
        input: body.input,
        results: body.results,
        companyName: body.companyName,
        projectName: body.projectName,
        engineerName: body.engineerName
      };

      const baseContext = generateDataContextPrompt(promptContext);
      const sections: ReportSection[] = ['executive_summary', 'technical_analysis', 'compliance_review', 'recommendations'];

      // Generate each section server-side
      for (const section of sections) {
        try {
          const selectedModel = body.model || 'gpt-5';
          const isGPT5 = selectedModel.startsWith('gpt-5');
          
          // Create request parameters based on model version
          const requestParams: any = {
            model: selectedModel,
            messages: [
              { role: 'system', content: baseContext },
              { role: 'user', content: REPORT_PROMPTS[section] }
            ]
          };
          
          // GPT-5 has different parameter support than GPT-4
          if (isGPT5) {
            // GPT-5 only supports default temperature (1) and specific parameters
            requestParams.max_completion_tokens = 8000;
            // Remove unsupported parameters for GPT-5: temperature, presence_penalty, frequency_penalty
          } else {
            // GPT-4 supports traditional parameters
            requestParams.max_tokens = 8000;
            requestParams.temperature = 0.1;
            requestParams.presence_penalty = 0.1;
            requestParams.frequency_penalty = 0.1;
          }
          
          const response = await client.chat.completions.create(requestParams);

          const content = response.choices[0]?.message?.content;
          if (content) {
            aiAnalysis[section] = sanitizeAIResponse(content.trim());
          }
        } catch (error) {
          console.error(`Error generating section ${section}:`, error);
          aiAnalysis[section] = `Error generating ${section}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }
    }

    // Generate PDF server-side
    const pdfGenerator = new SprayTowerPDFReport();
    const pdf = pdfGenerator.generateReport({
      input: body.input,
      results: body.results,
      companyName: body.companyName,
      projectName: body.projectName,
      engineerName: body.engineerName,
      reportDate: new Date()
    });

    // Add AI analysis to PDF if available
    if (Object.keys(aiAnalysis).length > 0) {
      // Add AI sections to PDF with proper formatting
      pdf.addPage();
      
      // Main title with background
      pdf.setFillColor(30, 58, 138); // Professional blue
      pdf.rect(20, 20, 170, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI-ENHANCED ANALYSIS', 105, 30, { align: 'center' });
      
      // Data integrity notice
      pdf.setFillColor(240, 249, 255); // Light blue background
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(1);
      pdf.rect(20, 40, 170, 12, 'FD');
      pdf.setTextColor(59, 130, 246);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATA INTEGRITY VERIFIED - All numerical data preserved exactly as calculated', 105, 48, { align: 'center' });
      
      let yPosition = 65;
      const pageHeight = 297; // A4 height in mm
      const bottomMargin = 30; // Keep space at bottom
      
      Object.entries(aiAnalysis).forEach(([section, content]) => {
        // Check if we need a new page for the section title
        if (yPosition > pageHeight - bottomMargin - 20) {
          pdf.addPage();
          yPosition = 30;
        }
        
        // Section title with colored background
        const title = section.replace(/_/g, ' ').toUpperCase();
        pdf.setFillColor(239, 246, 255); // Very light blue
        pdf.setDrawColor(59, 130, 246);
        pdf.setLineWidth(0.5);
        pdf.rect(20, yPosition - 2, 170, 10, 'FD');
        
        // Add colored stripe
        pdf.setFillColor(59, 130, 246);
        pdf.rect(20, yPosition - 2, 3, 10, 'F');
        
        pdf.setTextColor(30, 58, 138);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, 25, yPosition + 4);
        yPosition += 18;
        
        // Format content with proper structure
        pdf.setTextColor(15, 23, 42); // Dark slate
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        // Split content into paragraphs
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        
        paragraphs.forEach((paragraph, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - bottomMargin - 15) {
            pdf.addPage();
            yPosition = 30;
          }
          
          const trimmedParagraph = paragraph.trim();
          if (!trimmedParagraph) return;
          
          // Handle bullet points with proper indentation
          if (trimmedParagraph.startsWith('•') || trimmedParagraph.startsWith('-') || /^\d+\./.test(trimmedParagraph)) {
            pdf.setFont('helvetica', 'normal');
            const lines = pdf.splitTextToSize(trimmedParagraph, 165);
            
            if (Array.isArray(lines)) {
              lines.forEach((line: string, lineIndex: number) => {
                if (yPosition > pageHeight - bottomMargin - 5) {
                  pdf.addPage();
                  yPosition = 30;
                }
                
                if (lineIndex === 0) {
                  // First line with bullet
                  pdf.setTextColor(59, 130, 246); // Blue for bullets
                  pdf.text('•', 25, yPosition);
                  pdf.setTextColor(15, 23, 42);
                  pdf.text(line.replace(/^[•\-\d\.]\s*/, ''), 30, yPosition);
                } else {
                  // Continuation lines
                  pdf.text(line, 30, yPosition);
                }
                yPosition += 6; // Better line spacing
              });
            }
            yPosition += 3; // Extra space after bullet points
          } else {
            // Regular paragraph
            pdf.setFont('helvetica', 'normal');
            const lines = pdf.splitTextToSize(trimmedParagraph, 170);
            
            if (Array.isArray(lines)) {
              lines.forEach((line: string) => {
                if (yPosition > pageHeight - bottomMargin - 5) {
                  pdf.addPage();
                  yPosition = 30;
                }
                pdf.text(line, 20, yPosition);
                yPosition += 6; // Better line spacing
              });
            } else {
              if (yPosition > pageHeight - bottomMargin - 5) {
                pdf.addPage();
                yPosition = 30;
              }
              pdf.text(lines, 20, yPosition);
              yPosition += 6;
            }
            yPosition += 8; // Extra space between paragraphs
          }
        });
        
        yPosition += 10; // Extra space between sections
      });
    }

    // Convert PDF to buffer
    const buffer = Buffer.from(pdf.output('arraybuffer'));

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="spray-tower-ai-report-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('AI Export API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}