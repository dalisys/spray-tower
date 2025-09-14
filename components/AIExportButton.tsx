// AI-Enhanced PDF Export Button Component
// File: components/AIExportButton.tsx

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, FileDown, Shield, AlertTriangle } from 'lucide-react';
import { CalculatorInput, CalculationResults } from '@/types';
// No client-side AI imports needed - all handled server-side

interface AIExportButtonProps {
  input: CalculatorInput;
  results: CalculationResults;
  className?: string;
}

interface ExportSettings {
  companyName: string;
  projectName: string;
  engineerName: string;
  model: 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano' | 'gpt-4' | 'gpt-4-turbo';
  includeAIAnalysis: boolean;
}

export default function AIExportButton({ input, results, className }: AIExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportWarnings, setExportWarnings] = useState<string[]>([]);
  const [settings, setSettings] = useState<ExportSettings>({
    companyName: '',
    projectName: 'Spray Tower Design',
    engineerName: '',
    model: 'gpt-5',
    includeAIAnalysis: true
  });

  const handleSettingChange = (key: keyof ExportSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setExportError(null); // Clear errors when settings change
  };

  const validateSettings = (): string[] => {
    // No validation needed - all handled server-side
    return [];
  };

  const handleExport = async () => {
    const validationErrors = validateSettings();
    if (validationErrors.length > 0) {
      setExportError(validationErrors[0]);
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportWarnings([]);

    try {
      const exportOptions = {
        input,
        results,
        companyName: settings.companyName || undefined,
        projectName: settings.projectName || undefined,
        engineerName: settings.engineerName || undefined,
        includeAIAnalysis: settings.includeAIAnalysis,
        model: settings.model
      };

      // Use server-side API route for secure API key handling
      const response = await fetch('/api/ai-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportOptions),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setExportError(errorData.error || 'Failed to generate report');
        if (errorData.warnings) {
          setExportWarnings(errorData.warnings);
        }
        return;
      }

      // Download the PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `spray-tower-ai-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Close dialog on success
      setIsOpen(false);
      
    } catch (error) {
      console.error('Export error:', error);
      setExportError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={className}
          disabled={!results}
        >
          <FileDown className="w-4 h-4 mr-2" />
          <span>AI Report</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI-Enhanced PDF Export
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Data Integrity Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-xs">
              AI analysis preserves all calculation data. Processing occurs server-side for security. No numerical values are modified.
            </AlertDescription>
          </Alert>

          {/* AI Analysis Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeAI"
              checked={settings.includeAIAnalysis}
              onCheckedChange={(checked) => handleSettingChange('includeAIAnalysis', checked)}
            />
            <Label htmlFor="includeAI" className="text-sm">
              Include AI-generated analysis and recommendations
            </Label>
          </div>

          {/* AI Settings */}
          {settings.includeAIAnalysis && (
            <div className="space-y-3 p-3 border rounded-md bg-blue-50">
              <div>
                <Label htmlFor="model" className="text-sm">
                  AI Model
                </Label>
                <Select value={settings.model} onValueChange={(value) => handleSettingChange('model', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-5">GPT-5 (Latest & Recommended)</SelectItem>
                    <SelectItem value="gpt-5-mini">GPT-5 Mini (Faster & Cost-effective)</SelectItem>
                    <SelectItem value="gpt-5-nano">GPT-5 Nano (Lightweight)</SelectItem>
                    <SelectItem value="gpt-4">GPT-4 (Previous Generation)</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Previous Generation)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Report Settings */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="companyName" className="text-sm">
                Company Name
              </Label>
              <Input
                id="companyName"
                placeholder="Your Company"
                value={settings.companyName}
                onChange={(e) => handleSettingChange('companyName', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="projectName" className="text-sm">
                Project Name
              </Label>
              <Input
                id="projectName"
                placeholder="Project Name"
                value={settings.projectName}
                onChange={(e) => handleSettingChange('projectName', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="engineerName" className="text-sm">
                Engineer Name
              </Label>
              <Input
                id="engineerName"
                placeholder="Your Name"
                value={settings.engineerName}
                onChange={(e) => handleSettingChange('engineerName', e.target.value)}
              />
            </div>
          </div>

          {/* Warnings */}
          {exportWarnings.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-xs">
                {exportWarnings.map((warning, index) => (
                  <div key={index}>• {warning}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {exportError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-xs text-red-700">
                {exportError}
              </AlertDescription>
            </Alert>
          )}

          {/* Export Button */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="min-w-32"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}