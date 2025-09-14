'use client';

import { useState, useEffect } from 'react';
import { CalculatorInput, CalculationResults, ValidationError } from '@/types';
import { DEFAULT_VALUES } from '@/lib/constants';
import { calculateSprayTower } from '@/lib/calculations/calculator';
import { validateInput, hasErrors } from '@/lib/validation';
import { generateSprayTowerReport } from '@/lib/pdf-export';

import { GasStreamInput } from './GasStreamInput';
import { PollutantInput } from './PollutantInput';
import { TowerParametersInput } from './TowerParametersInput';
import { SystemSettingsComponent } from './SystemSettings';
import { ResultsDisplay } from './ResultsDisplay';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle, Settings, Zap, Cog, BarChart3, ChevronDown, ChevronUp, Info, FileDown, Loader2, LogOut } from 'lucide-react';
import AIExportButton from './AIExportButton';

export function SprayTowerCalculator() {
  const [input, setInput] = useState<CalculatorInput>({
    gasStream: DEFAULT_VALUES.gasStream,
    pollutant: DEFAULT_VALUES.pollutant,
    tower: DEFAULT_VALUES.tower,
    settings: DEFAULT_VALUES.settings,
  });

  const [results, setResults] = useState<CalculationResults | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [expandedSections, setExpandedSections] = useState({
    primary: true,
    secondary: false,
    advanced: false,
    particulate: false,
    compliance: false,
  });

  // Real-time calculation with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsCalculating(true);
      
      // Validate inputs
      const validationErrors = validateInput(input);
      setErrors(validationErrors);

      // Only calculate if no critical errors
      if (!hasErrors(validationErrors)) {
        try {
          const calculatedResults = calculateSprayTower(input);
          setResults(calculatedResults);
        } catch (error) {
          console.error('Calculation error:', error);
          setResults(null);
        }
      } else {
        setResults(null);
      }

      setIsCalculating(false);
      setIsInitialLoad(false);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [input]);

  const updateGasStream = (gasStream: typeof input.gasStream) => {
    setInput(prev => ({ ...prev, gasStream }));
  };

  const updatePollutant = (pollutant: typeof input.pollutant) => {
    setInput(prev => ({ ...prev, pollutant }));
  };

  const updateTower = (tower: typeof input.tower) => {
    setInput(prev => ({ ...prev, tower }));
  };

  const updateSettings = (settings: typeof input.settings) => {
    setInput(prev => ({ ...prev, settings }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExportPDF = async () => {
    if (!results) return;
    
    setIsExportingPDF(true);
    try {
      const blob = await generateSprayTowerReport({
        input,
        results,
        companyName: 'Your Company Name',
        projectName: 'Spray Tower Design Project',
        engineerName: 'Design Engineer',
        reportDate: new Date()
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spray-tower-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if API call fails
      window.location.href = '/login';
    }
  };

  const errorCount = errors.filter(e => e.type === 'error').length;
  const warningCount = errors.filter(e => e.type === 'warning').length;

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-3 md:px-4 py-2 md:py-4">
          {/* Main title and status row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-3xl font-bold text-foreground truncate">
                Spray Tower Calculator
              </h1>
              <p className="text-xs md:text-base text-muted-foreground mt-0.5 md:mt-2 line-clamp-1 md:line-clamp-none">
                Design gas scrubbing towers for pollution control systems
              </p>
            </div>
            
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              {isCalculating && (
                <Badge variant="secondary" className="animate-pulse text-xs px-1 py-0.5 h-5">
                  <span className="hidden sm:inline">Calculating...</span>
                  <span className="sm:hidden">Calc...</span>
                </Badge>
              )}
              
              {errorCount > 0 && (
                <Badge variant="destructive" className="text-xs px-1 py-0.5 h-5">
                  <span className="hidden sm:inline">{errorCount} Error{errorCount !== 1 ? 's' : ''}</span>
                  <span className="sm:hidden">{errorCount}E</span>
                </Badge>
              )}
              
              {warningCount > 0 && (
                <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs px-1 py-0.5 h-5">
                  <span className="hidden sm:inline">{warningCount} Warning{warningCount !== 1 ? 's' : ''}</span>
                  <span className="sm:hidden">{warningCount}W</span>
                </Badge>
              )}
              
              {results && errorCount === 0 && (
                <Badge variant="default" className="bg-green-600 text-xs px-1 py-0.5 h-5">
                  <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                  <span className="hidden sm:inline">Ready</span>
                  <span className="sm:hidden">✓</span>
                </Badge>
              )}

              {/* Export PDF Buttons - Desktop inline */}
              {results && errorCount === 0 && (
                <div className="hidden md:flex gap-1 md:gap-2">
                  <Button
                    onClick={handleExportPDF}
                    disabled={isExportingPDF}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-xs h-6 px-2 md:h-8 md:px-3 cursor-pointer"
                  >
                    {isExportingPDF ? (
                      <>
                        <Loader2 className="w-2.5 h-2.5 md:w-3 md:h-3 animate-spin" />
                        <span className="hidden sm:inline ml-1">Exporting...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        <span className="hidden sm:inline ml-1">Report</span>
                      </>
                    )}
                  </Button>
                  
                  <AIExportButton 
                    input={input}
                    results={results}
                    className="text-xs h-6 px-2 md:h-8 md:px-3"
                  />
                </div>
              )}

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2 md:h-8 md:px-3 text-muted-foreground hover:text-foreground"
                title="Logout"
              >
                <LogOut className="w-2.5 h-2.5 md:w-3 md:h-3" />
                <span className="hidden md:inline ml-1">Logout</span>
              </Button>
            </div>
          </div>

          {/* Export buttons row - Mobile only */}
          {results && errorCount === 0 && (
            <div className="flex md:hidden items-center gap-2 mt-3">
              <Button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-sm h-8 px-4 flex-1 cursor-pointer"
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    <span>Report</span>
                  </>
                )}
              </Button>
              
              <AIExportButton 
                input={input}
                results={results}
                className="text-sm h-8 px-4 flex-1"
              />
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-7xl mx-auto">
          
          {/* Left Panel - Input Controls */}
          <div className="space-y-6 lg:max-h-none">
            {/* Quick Status Card */}
            <Card className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isCalculating && (
                    <div className="animate-pulse">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {results ? 'Results Ready' : 'Configure Parameters'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {errorCount > 0 ? `${errorCount} error${errorCount !== 1 ? 's' : ''} to fix` :
                       warningCount > 0 ? `${warningCount} warning${warningCount !== 1 ? 's' : ''}` :
                       results ? 'All calculations completed' : 'Enter parameters to calculate'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {errorCount > 0 && (
                    <Badge variant="destructive">{errorCount}</Badge>
                  )}
                  {warningCount > 0 && (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      {warningCount}
                    </Badge>
                  )}
                  {results && errorCount === 0 && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Input Tabs */}
            <Card className="p-3 md:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 h-auto">
                  <TabsTrigger value="settings" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Settings className="w-4 h-4" />
                    <span className="text-xs">Settings</span>
                  </TabsTrigger>
                  <TabsTrigger value="gas" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs">Gas</span>
                  </TabsTrigger>
                  <TabsTrigger value="pollutant" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-xs">Pollutant</span>
                  </TabsTrigger>
                  <TabsTrigger value="tower" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Cog className="w-4 h-4" />
                    <span className="text-xs">Tower</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4 md:mt-6">
                  <TabsContent value="settings" className="space-y-4">
                    <SystemSettingsComponent
                      values={input.settings}
                      onChange={updateSettings}
                      errors={errors}
                    />
                  </TabsContent>

                  <TabsContent value="gas" className="space-y-4">
                    <GasStreamInput
                      values={input.gasStream}
                      onChange={updateGasStream}
                      errors={errors}
                    />
                  </TabsContent>

                  <TabsContent value="pollutant" className="space-y-4">
                    <PollutantInput
                      values={input.pollutant}
                      onChange={updatePollutant}
                      errors={errors}
                    />
                  </TabsContent>

                  <TabsContent value="tower" className="space-y-4">
                    <TowerParametersInput
                      values={input.tower}
                      onChange={updateTower}
                      errors={errors}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>

          </div>

          {/* Right Panel - Results */}
          <div className="space-y-4 md:space-y-6 lg:sticky lg:top-[7rem] lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-2">
            {/* Error/Warning Summary at Top */}
            {errors.length > 0 && (
              <Card className="p-3 md:p-4 border-orange-200 bg-orange-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-orange-900 text-sm">
                      {errors.filter(e => e.type === 'error').length > 0 ? 'Errors Found' : 'Warnings'}
                    </h4>
                    <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                      {errors.slice(0, 3).map((error, index) => (
                        <p
                          key={index}
                          className={`text-xs ${
                            error.type === 'error' ? 'text-red-700' : 'text-orange-700'
                          }`}
                        >
                          • {error.message}
                        </p>
                      ))}
                      {errors.length > 3 && (
                        <p className="text-xs text-orange-600">
                          ... and {errors.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {results ? (
              <>
                {/* Primary Results - With Tooltips */}
                <Card className="p-3">
                  <h4 className="font-medium mb-3 text-sm">Key Results</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    
                    {/* Tower Diameter */}
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-xs font-medium text-blue-800">Diameter</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3 h-3 text-blue-600 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-64">
                            <p className="font-semibold">Tower Diameter</p>
                            <p className="text-xs mt-1">
                              Calculated from gas velocity and flow rate: D = √(4×Q/(π×v))
                              <br />Gas velocity: {((results.operatingGasFlow || 0) / (results.towerArea || 1)).toFixed(1)} m/s
                              <br />Gas flow: {input.gasStream.gasFlowRate} Nm³/h
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="font-bold text-blue-600 text-lg">
                        {(results.towerDiameter || 0).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {input.settings.unitSystem === 'imperial' ? 'ft' : 'm'}
                      </div>
                    </div>

                    {/* Tower Height */}
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-xs font-medium text-green-800">Height</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3 h-3 text-green-600 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-64">
                            <p className="font-semibold">Tower Height</p>
                            <p className="text-xs mt-1">
                              Based on NTU method: H = (G_m × N_G) / K_G·a
                              <br />Number of Transfer Units: {((results as any)?.numberOfTransferUnits || 0).toFixed(2)}
                              <br />K_G·a: {(results.overallKGa || 0).toExponential(2)} 1/s
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="font-bold text-green-600 text-lg">
                        {(results.requiredHeight || 0).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {input.settings.unitSystem === 'imperial' ? 'ft' : 'm'}
                      </div>
                    </div>

                    {/* Pressure Drop */}
                    <div className="text-center p-2 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-xs font-medium text-orange-800">Pressure Drop</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3 h-3 text-orange-600 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-64">
                            <p className="font-semibold">Pressure Drop</p>
                            <p className="text-xs mt-1">
                              Total pressure loss through tower including gas flow resistance and liquid distributors
                              <br />Gas velocity: {((results.operatingGasFlow || 0) / (results.towerArea || 1)).toFixed(1)} m/s
                              <br />Tower height: {(results.requiredHeight || 0).toFixed(1)} m
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="font-bold text-orange-600 text-lg">
                        {(results.pressureDrop || 0).toFixed(0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {input.settings.unitSystem === 'imperial' ? 'in.H₂O' : 'Pa'}
                      </div>
                    </div>

                    {/* Outlet Concentration */}
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-xs font-medium text-red-800">Outlet Conc.</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3 h-3 text-red-600 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-64">
                            <p className="font-semibold">Outlet Concentration</p>
                            <p className="text-xs mt-1">
                              Final pollutant concentration after treatment
                              <br />Inlet: {input.pollutant.inletConcentration} mg/Nm³
                              <br />Efficiency: {((1 - (results.outletConcentration || 0) / input.pollutant.inletConcentration) * 100).toFixed(1)}%
                              <br />Calculated using NTU method and mass transfer
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="font-bold text-red-600 text-lg">
                        {(results.outletConcentration || 0).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {input.settings.regulatoryFramework === 'US' ? 'ppmvd' : 'mg/Nm³'}
                      </div>
                    </div>

                  </div>
                </Card>


                {/* Collapsible Advanced Results */}
                <div className="space-y-2 md:space-y-3">
                  {/* Secondary Results */}
                  <Collapsible open={expandedSections.secondary} onOpenChange={() => toggleSection('secondary')}>
                    <Card>
                      <CollapsibleTrigger className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <h4 className="font-medium">Secondary Results</h4>
                        {expandedSections.secondary ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-3 pb-3 md:px-4 md:pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">KG·a: {(results.overallKGa || 0).toExponential(2)} 1/s</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-72">
                                  <p className="font-semibold">Overall Mass Transfer Coefficient</p>
                                  <p className="text-xs mt-1">
                                    Key parameter for gas absorption efficiency. Calculated using correlation:
                                    <br />K_G·a = 0.1586 × G_m^0.8 × L^0.4
                                    <br />Higher values = better mass transfer performance
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Gas Density: {(results.gasDensity || 0).toFixed(3)} kg/m³</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-64">
                                  <p className="font-semibold">Gas Density</p>
                                  <p className="text-xs mt-1">
                                    Calculated from ideal gas law: ρ = PM/(RT)
                                    <br />Pressure: {input.gasStream.pressure} kPa
                                    <br />Temperature: {input.gasStream.temperature}°C
                                    <br />Used for sizing calculations and pressure drop
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Liquid Rate: {(results.liquidRate || 0).toFixed(1)} m³/h</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-64">
                                  <p className="font-semibold">Liquid Flow Rate</p>
                                  <p className="text-xs mt-1">
                                    Based on L/G ratio: {input.tower.lgRatio} m³/m³
                                    <br />Gas flow: {input.gasStream.gasFlowRate} Nm³/h
                                    <br />Critical for proper gas-liquid contact and absorption
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Residence Time: {(results.gasResidenceTime || 0).toFixed(2)} s</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-64">
                                  <p className="font-semibold">Gas Residence Time</p>
                                  <p className="text-xs mt-1">
                                    Time gas spends in contact with liquid: t = H/v
                                    <br />Tower height: {(results.requiredHeight || 0).toFixed(1)} m
                                    <br />Gas velocity: {((results.operatingGasFlow || 0) / (results.towerArea || 1)).toFixed(1)} m/s
                                    <br />Longer contact = better absorption
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-medium">NaOH Use: {(results.naohConsumption || 0).toFixed(2)} mol/h</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-64">
                                  <p className="font-semibold">Sodium Hydroxide Consumption</p>
                                  <p className="text-xs mt-1">
                                    Chemical consumption for acid gas neutralization
                                    <br />Stoichiometry: {input.tower.naohStoichiometry} mol NaOH/mol pollutant
                                    <br />Pollutant removal: {((input.pollutant.inletConcentration - (results.outletConcentration || 0)) * (input.gasStream.gasFlowRate || 0) / 22400).toFixed(2)} mol/h
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Interfacial Area: {(results.interfacialArea || 0).toFixed(2)} 1/m</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-64">
                                  <p className="font-semibold">Specific Interfacial Area</p>
                                  <p className="text-xs mt-1">
                                    Gas-liquid contact area per unit tower volume
                                    <br />Calculated from droplet size: a = 6/d_p
                                    <br />Droplet size: {input.tower.dropletSize} mm
                                    <br />Higher area = better mass transfer
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>

                  {/* Advanced Physics */}
                  <Collapsible open={expandedSections.advanced} onOpenChange={() => toggleSection('advanced')}>
                    <Card>
                      <CollapsibleTrigger className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <h4 className="font-medium">Advanced Physics</h4>
                        {expandedSections.advanced ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Reynolds: {(results.reynoldsNumber || 0).toFixed(0)}</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-64">
                                    <p className="font-semibold">Reynolds Number</p>
                                    <p className="text-xs mt-1">
                                      Dimensionless parameter for flow regime: Re = ρvd/μ
                                      <br />Re &lt; 2300: Laminar flow
                                      <br />Re &gt; 4000: Turbulent flow
                                      <br />Used in mass transfer correlations
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Schmidt: {(results.schmidtNumber || 0).toFixed(1)}</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-64">
                                    <p className="font-semibold">Schmidt Number</p>
                                    <p className="text-xs mt-1">
                                      Ratio of momentum to mass diffusivity: Sc = μ/(ρD)
                                      <br />Kinematic viscosity: {((input.gasStream.gasViscosity || 1.85e-5) / (results.gasDensity || 1.225)).toExponential(2)} m²/s
                                      <br />Diffusivity: {((results as any)?.pollutantDiffusivity || 0).toExponential(2)} m²/s
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Sherwood: {(results.sherwoodNumber || 0).toFixed(1)}</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-64">
                                    <p className="font-semibold">Sherwood Number</p>
                                    <p className="text-xs mt-1">
                                      Dimensionless mass transfer coefficient: Sh = k_L d/D
                                      <br />Calculated from correlation: Sh = 2 + 0.6 Re^0.5 Sc^0.33
                                      <br />Used to determine mass transfer coefficient
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Terminal Velocity: {(results.dropletTerminalVelocity || 0).toFixed(2)} m/s</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-64">
                                    <p className="font-semibold">Droplet Terminal Velocity</p>
                                    <p className="text-xs mt-1">
                                      Free-fall velocity using Schiller-Naumann correlation
                                      <br />Droplet diameter: {input.tower.dropletSize} mm
                                      <br />Liquid density: {input.tower.liquidDensity} kg/m³
                                      <br />Affects gas-liquid contact time
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Relative Velocity: {(results.relativeVelocity || 0).toFixed(2)} m/s</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-64">
                                    <p className="font-semibold">Gas-Droplet Relative Velocity</p>
                                    <p className="text-xs mt-1">
                                      Difference between gas and droplet velocities
                                      <br />Gas velocity: {((results.operatingGasFlow || 0) / (results.towerArea || 1)).toFixed(1)} m/s (upward)
                                      <br />Terminal velocity: {(results.dropletTerminalVelocity || 0).toFixed(2)} m/s (downward)
                                      <br />Critical for mass transfer calculations
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Contact Time: {(results.dropletContactTime || 0).toFixed(2)} s</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-64">
                                    <p className="font-semibold">Gas-Droplet Contact Time</p>
                                    <p className="text-xs mt-1">
                                      Time droplet spends falling through gas stream
                                      <br />Height: {(results.requiredHeight || 0).toFixed(1)} m
                                      <br />Terminal velocity: {(results.dropletTerminalVelocity || 0).toFixed(2)} m/s
                                      <br />Longer contact = better absorption
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>

                  {/* Particulate Efficiency */}
                  {results.particulateEfficiency && (
                    <Collapsible open={expandedSections.particulate} onOpenChange={() => toggleSection('particulate')}>
                      <Card>
                        <CollapsibleTrigger className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                          <h4 className="font-medium">Particulate Collection</h4>
                          {expandedSections.particulate ? 
                            <ChevronUp className="w-4 h-4" /> : 
                            <ChevronDown className="w-4 h-4" />
                          }
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="text-center p-4 bg-green-50 rounded-lg min-h-[140px] flex flex-col justify-between">
                                <div className="mb-3">
                                  <div className="flex items-center justify-center gap-2 mb-1">
                                    <span className="font-medium text-green-800 text-sm">Coarse Particles</span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-3 h-3 text-green-600 cursor-help flex-shrink-0" />
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-64">
                                        <p className="font-semibold">Coarse Particle Collection (&gt;10 μm)</p>
                                        <p className="text-xs mt-1">
                                          Excellent collection efficiency for large particles
                                          <br />Mechanism: Inertial impaction and interception
                                          <br />Gas velocity: {((results.operatingGasFlow || 0) / (results.towerArea || 1)).toFixed(1)} m/s
                                          <br />Droplet size: {input.tower.dropletSize} mm
                                          <br />Large particles easily captured by droplets
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <div className="text-xs text-muted-foreground">&gt;10 μm particles</div>
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                  {(results.particulateEfficiency.coarse_10um * 100).toFixed(1)}%
                                </div>
                              </div>
                              
                              <div className="text-center p-4 bg-orange-50 rounded-lg min-h-[140px] flex flex-col justify-between">
                                <div className="mb-3">
                                  <div className="flex items-center justify-center gap-2 mb-1">
                                    <span className="font-medium text-orange-800 text-sm">Medium Particles</span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-3 h-3 text-orange-600 cursor-help flex-shrink-0" />
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-64">
                                        <p className="font-semibold">Medium Particle Collection (~2 μm)</p>
                                        <p className="text-xs mt-1">
                                          Moderate collection efficiency for medium particles
                                          <br />Mechanism: Combination of inertial and diffusion
                                          <br />Relative velocity: {(results.relativeVelocity || 0).toFixed(2)} m/s
                                          <br />Contact time: {(results.dropletContactTime || 0).toFixed(2)} s
                                          <br />Challenging size range for wet scrubbers
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <div className="text-xs text-muted-foreground">~2 μm particles</div>
                                </div>
                                <div className="text-2xl font-bold text-orange-600">
                                  {(results.particulateEfficiency.medium_2um * 100).toFixed(1)}%
                                </div>
                              </div>
                              
                              <div className="text-center p-4 bg-red-50 rounded-lg min-h-[140px] flex flex-col justify-between">
                                <div className="mb-3">
                                  <div className="flex items-center justify-center gap-2 mb-1">
                                    <span className="font-medium text-red-800 text-sm">Fine Particles</span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-3 h-3 text-red-600 cursor-help flex-shrink-0" />
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-64">
                                        <p className="font-semibold">Fine Particle Collection (&lt;1 μm)</p>
                                        <p className="text-xs mt-1">
                                          Low collection efficiency for fine particles
                                          <br />Mechanism: Brownian diffusion (limited effectiveness)
                                          <br />Reynolds number: {(results.reynoldsNumber || 0).toFixed(0)}
                                          <br />Schmidt number: {(results.schmidtNumber || 0).toFixed(1)}
                                          <br />Consider electrostatic precipitator for fine particles
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <div className="text-xs text-muted-foreground">&lt;1 μm particles</div>
                                </div>
                                <div className="text-2xl font-bold text-red-600">
                                  {(results.particulateEfficiency.fine_1um * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                              <h5 className="font-medium text-blue-900 mb-2 text-sm">Collection Mechanisms</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-blue-800">
                                <div><strong>Inertial Impaction:</strong> Large particles can't follow gas streamlines</div>
                                <div><strong>Interception:</strong> Particles follow streamlines but contact droplet surface</div>
                                <div><strong>Diffusion:</strong> Random motion brings small particles to droplet surface</div>
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  )}

                  {/* Regulatory Compliance */}
                  <Collapsible open={expandedSections.compliance} onOpenChange={() => toggleSection('compliance')}>
                    <Card>
                      <CollapsibleTrigger className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <h4 className="font-medium">Regulatory Compliance</h4>
                        {expandedSections.compliance ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-4 text-sm">
                          
                          {/* Compliance Status Overview */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Regulatory Framework:</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-64">
                                    <p className="font-semibold">Regulatory Framework</p>
                                    <p className="text-xs mt-1">
                                      {results.complianceStatus.framework === 'EU' ? (
                                        <>EU regulations with emission limits in mg/Nm³, pressure vessel design per PED</>
                                      ) : (
                                        <>US regulations with emission limits in ppmvd, pressure vessel design per ASME</>
                                      )}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Badge variant="outline">{results.complianceStatus.framework}</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Emission Limits:</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-72">
                                    <p className="font-semibold">Emission Compliance Status</p>
                                    <p className="text-xs mt-1">
                                      <strong>Current outlet:</strong> {(results.outletConcentration || 0).toFixed(1)} {input.settings.regulatoryFramework === 'US' ? 'ppmvd' : 'mg/Nm³'}
                                      <br /><strong>Typical limits:</strong> 20-100 {input.settings.regulatoryFramework === 'US' ? 'ppmvd' : 'mg/Nm³'} (varies by pollutant)
                                      <br />Compliance based on pollutant type and local regulations
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Badge variant={results.complianceStatus.emissionLimitsMet ? "default" : "destructive"}>
                                {results.complianceStatus.emissionLimitsMet ? "Met" : "Not Met"}
                              </Badge>
                            </div>
                          </div>

                          {/* Non-Compliance Guidance */}
                          {!results.complianceStatus.emissionLimitsMet && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-start gap-2 mb-3">
                                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                                <h5 className="font-medium text-red-900">Compliance Issues & Recommendations</h5>
                              </div>
                              
                              <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <p className="font-medium text-red-800">To Meet Emission Limits:</p>
                                    <ul className="text-red-700 space-y-1 list-disc list-inside">
                                      <li>Increase tower height (currently {(results.requiredHeight || 0).toFixed(1)} m)</li>
                                      <li>Reduce gas velocity (currently {((results.operatingGasFlow || 0) / (results.towerArea || 1)).toFixed(1)} m/s)</li>
                                      <li>Increase L/G ratio (currently {input.tower.lgRatio} m³/m³)</li>
                                      <li>Consider smaller droplets (&lt;{input.tower.dropletSize} mm)</li>
                                      <li>Add second absorption stage</li>
                                    </ul>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <p className="font-medium text-red-800">Performance Improvements:</p>
                                    <ul className="text-red-700 space-y-1 list-disc list-inside">
                                      <li>Target efficiency: &gt;{(input.pollutant.targetEfficiency * 100).toFixed(0)}%</li>
                                      <li>Current: {((1 - (results.outletConcentration || 0) / input.pollutant.inletConcentration) * 100).toFixed(1)}%</li>
                                      <li>Increase KGa: {(results.overallKGa || 0).toExponential(2)} → &gt;{((results.overallKGa || 0) * 1.5).toExponential(2)} 1/s</li>
                                      <li>Optimize pH control (6-8 for acid gases)</li>
                                      <li>Consider chemical additives</li>
                                    </ul>
                                  </div>
                                </div>
                                
                                <div className="mt-3 p-2 bg-white rounded border">
                                  <p className="font-medium text-red-800 mb-1">Quick Fix Recommendations:</p>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-red-700">
                                    <div><strong>Height:</strong> +{Math.max(0, Math.ceil((results.requiredHeight || 0) * 0.3))}m</div>
                                    <div><strong>L/G:</strong> +{(input.tower.lgRatio * 0.2).toFixed(2)} m³/m³</div>
                                    <div><strong>Velocity:</strong> -{(((results.operatingGasFlow || 0) / (results.towerArea || 1)) * 0.2).toFixed(1)} m/s</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Design Codes and Standards */}
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-blue-900">Design Standards:</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3 text-blue-600 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-72">
                                  <p className="font-semibold">Engineering Design Standards</p>
                                  <p className="text-xs mt-1">
                                    Pressure vessel must comply with {results.complianceStatus.framework === 'EU' ? 'PED (Pressure Equipment Directive)' : 'ASME Boiler and Pressure Vessel Code'}
                                    <br />Operating pressure: {input.gasStream.pressure} kPa
                                    <br />Design pressure typically 1.1-1.3× operating pressure
                                    <br />Material selection based on corrosion resistance
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-xs text-blue-800">{results.complianceStatus.pressureVesselCode}</p>
                            
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800">
                              <div><strong>Testing:</strong> {results.complianceStatus.framework === 'EU' ? 'EN standards' : 'EPA Method testing'}</div>
                              <div><strong>Safety:</strong> {results.complianceStatus.framework === 'EU' ? 'ATEX compliance' : 'OSHA requirements'}</div>
                            </div>
                          </div>
                          
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </div>
              </>
            ) : (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">
                      {isCalculating ? 'Calculating...' : 'Ready to Calculate'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {errorCount > 0
                        ? 'Fix validation errors to see results'
                        : 'Configure parameters in the left panel'
                      }
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Spray Tower Calculator - Professional engineering tool for gas treatment system design
          </p>
          <p className="mt-2">
            Built with Next.js, TypeScript, and shadcn/ui
          </p>
        </div>
      </footer>
    </div>
    </TooltipProvider>
  );
}