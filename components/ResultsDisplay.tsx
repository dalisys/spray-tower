import { CalculationResults, UnitSystem, RegulatoryFramework } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ResultsDisplayProps {
  results: CalculationResults;
  unitSystem: UnitSystem;
  regulatoryFramework: RegulatoryFramework;
}

export function ResultsDisplay({ results, unitSystem, regulatoryFramework }: ResultsDisplayProps) {
  // Unit strings based on selected unit system
  const units = {
    length: unitSystem === 'imperial' ? 'ft' : 'm',
    area: unitSystem === 'imperial' ? 'ft²' : 'm²',
    pressure: unitSystem === 'imperial' ? 'in.H₂O' : 'Pa',
    density: unitSystem === 'imperial' ? 'lb/ft³' : 'kg/m³',
    velocity: unitSystem === 'imperial' ? 'ft/s' : 'm/s',
    flowRate: unitSystem === 'imperial' ? 'ACFM' : 'm³/s',
    liquidRate: unitSystem === 'imperial' ? 'GPM' : 'm³/h',
    concentration: regulatoryFramework === 'US' ? 'ppmvd' : 'mg/Nm³',
  };

  const formatNumber = (value: number, decimals: number = 2, unit: string = ''): string => {
    if (value === 0) return `0${unit ? ` ${unit}` : ''}`;
    
    // For very small or very large numbers, use scientific notation
    if (Math.abs(value) < 0.001 || Math.abs(value) > 10000) {
      return `${value.toExponential(decimals)}${unit ? ` ${unit}` : ''}`;
    }
    
    return `${value.toFixed(decimals)}${unit ? ` ${unit}` : ''}`;
  };

  const getHeightStatus = (height: number) => {
    if (height < 1) return { color: 'destructive', text: 'Very Low - Check calculations' };
    if (height < 3) return { color: 'secondary', text: 'Low' };
    if (height <= 20) return { color: 'default', text: 'Normal' };
    return { color: 'secondary', text: 'High' };
  };

  const getPressureDropStatus = (pressureDrop: number) => {
    if (pressureDrop < 100) return { color: 'secondary', text: 'Very Low' };
    if (pressureDrop <= 5000) return { color: 'default', text: 'Normal' };
    return { color: 'destructive', text: 'High' };
  };

  const heightStatus = getHeightStatus(results.requiredHeight);
  const pressureStatus = getPressureDropStatus(results.pressureDrop);

  return (
    <div className="space-y-6">
      {/* Primary Results */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Primary Results</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Tower Diameter</h4>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(results.towerDiameter, 3, units.length)}
            </p>
            <p className="text-sm text-muted-foreground">
              Physical dimension for construction
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Required Height</h4>
              <Badge variant={heightStatus.color as any}>{heightStatus.text}</Badge>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(results.requiredHeight, 3, units.length)}
            </p>
            <p className="text-sm text-muted-foreground">
              Tower height to achieve target efficiency
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Gas Residence Time</h4>
            <p className="text-2xl font-bold text-purple-600">
              {formatNumber(results.gasResidenceTime, 2, 's')}
            </p>
            <p className="text-sm text-muted-foreground">
              Contact time for mass transfer
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Pressure Drop</h4>
              <Badge variant={pressureStatus.color as any}>{pressureStatus.text}</Badge>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {formatNumber(results.pressureDrop, 2, units.pressure)}
            </p>
            <p className="text-sm text-muted-foreground">
              Energy requirement for gas flow
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Outlet Concentration</h4>
            <p className="text-2xl font-bold text-red-600">
              {formatNumber(results.outletConcentration, 1, units.concentration)}
            </p>
            <p className="text-sm text-muted-foreground">
              Final pollutant level after treatment
            </p>
          </div>
        </div>
      </Card>

      {/* Secondary Results */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Secondary Results</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium">Overall KG·a</h4>
            <p className="text-xl font-semibold">
              {formatNumber(results.overallKGa, 4, '1/s')}
            </p>
            <p className="text-sm text-muted-foreground">
              Mass transfer performance indicator
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Interfacial Area</h4>
            <p className="text-xl font-semibold">
              {formatNumber(results.interfacialArea, 2, '1/m')}
            </p>
            <p className="text-sm text-muted-foreground">
              Surface area for mass transfer
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Gas Density</h4>
            <p className="text-xl font-semibold">
              {formatNumber(results.gasDensity, 3, units.density)}
            </p>
            <p className="text-sm text-muted-foreground">
              Operating condition parameter
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Liquid Rate</h4>
            <p className="text-xl font-semibold">
              {formatNumber(results.liquidRate, 1, units.liquidRate)}
            </p>
            <p className="text-sm text-muted-foreground">
              Required liquid circulation rate
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">NaOH Consumption</h4>
            <p className="text-xl font-semibold">
              {formatNumber(results.naohConsumption, 2, 'mol/h')}
            </p>
            <p className="text-sm text-muted-foreground">
              Chemical consumption for neutralization
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Moles Removed</h4>
            <p className="text-xl font-semibold">
              {formatNumber(results.molesRemoved, 2, 'mol/h')}
            </p>
            <p className="text-sm text-muted-foreground">
              Pollutant removal rate
            </p>
          </div>
        </div>
      </Card>

      {/* Process Conditions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Process Conditions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium">Tower Area</h4>
            <p className="text-lg font-semibold">
              {formatNumber(results.towerArea, 2, 'm²')}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Operating Gas Flow</h4>
            <p className="text-lg font-semibold">
              {formatNumber(results.operatingGasFlow, 2, 'm³/s')}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Liquid Flow Rate</h4>
            <p className="text-lg font-semibold">
              {formatNumber(results.liquidFlowRate, 4, 'm³/s')}
            </p>
          </div>

          {results.nozzleFlowPerNozzle && (
            <div className="space-y-2">
              <h4 className="font-medium">Nozzle Flow Rate</h4>
              <p className="text-lg font-semibold">
                {formatNumber(results.nozzleFlowPerNozzle, 2, 'm³/h')}
              </p>
            </div>
          )}
        </div>

        {results.requiredNozzles && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Required Nozzles</h4>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {results.requiredNozzles} nozzles
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Total number of nozzles needed for liquid distribution
            </p>
          </div>
        )}
      </Card>

      {/* Advanced Mass Transfer Results */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Advanced Mass Transfer</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium">Number of Transfer Units</h4>
            <p className="text-lg font-semibold">
              {formatNumber(results.numberOfTransferUnits, 2, 'NTU')}
            </p>
            <p className="text-sm text-muted-foreground">
              Mass transfer requirement
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Reynolds Number</h4>
            <p className="text-lg font-semibold">
              {formatNumber(results.reynoldsNumber, 1, '')}
            </p>
            <p className="text-sm text-muted-foreground">
              Flow regime indicator
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Schmidt Number</h4>
            <p className="text-lg font-semibold">
              {formatNumber(results.schmidtNumber, 1, '')}
            </p>
            <p className="text-sm text-muted-foreground">
              Mass transfer parameter
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Sherwood Number</h4>
            <p className="text-lg font-semibold">
              {formatNumber(results.sherwoodNumber, 1, '')}
            </p>
            <p className="text-sm text-muted-foreground">
              Mass transfer correlation
            </p>
          </div>
        </div>
      </Card>

      {/* Droplet Physics Results */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Droplet Physics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium">Terminal Velocity</h4>
            <p className="text-lg font-semibold">
              {formatNumber(results.dropletTerminalVelocity, 2, units.velocity)}
            </p>
            <p className="text-sm text-muted-foreground">
              Droplet settling speed in still gas
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Relative Velocity</h4>
            <p className="text-lg font-semibold">
              {formatNumber(results.relativeVelocity, 2, units.velocity)}
            </p>
            <p className="text-sm text-muted-foreground">
              Net droplet-gas velocity
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Contact Time</h4>
            <p className="text-lg font-semibold">
              {formatNumber(results.dropletContactTime, 2, 's')}
            </p>
            <p className="text-sm text-muted-foreground">
              Droplet residence time
            </p>
          </div>
        </div>
      </Card>

      {/* Particulate Collection Efficiency */}
      {results.particulateEfficiency && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Particulate Collection Efficiency</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Coarse Particles (&gt;10 μm)</h4>
              <p className="text-2xl font-bold text-green-600">
                {(results.particulateEfficiency.coarse_10um * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">
                High efficiency expected
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Medium Particles (~2 μm)</h4>
              <p className="text-2xl font-bold text-orange-600">
                {(results.particulateEfficiency.medium_2um * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Moderate efficiency
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Fine Particles (&lt;1 μm)</h4>
              <p className="text-2xl font-bold text-red-600">
                {(results.particulateEfficiency.fine_1um * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Limited efficiency
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Note:</strong> For fine particle control, consider high-energy scrubbers (venturi) or downstream filtration.
            </p>
          </div>
        </Card>
      )}

      {/* Regulatory Compliance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Regulatory Compliance</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Framework:</span>
            <Badge variant="outline">{results.complianceStatus.framework}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Emission Limits:</span>
            <Badge variant={results.complianceStatus.emissionLimitsMet ? "default" : "destructive"}>
              {results.complianceStatus.emissionLimitsMet ? "Met" : "Not Met"}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <span className="font-medium">Pressure Vessel Code:</span>
            <p className="text-sm text-muted-foreground">
              {results.complianceStatus.pressureVesselCode}
            </p>
          </div>
          
          {results.complianceStatus.safetyClassification && (
            <div className="space-y-2">
              <span className="font-medium">Safety Classification:</span>
              <p className="text-sm text-muted-foreground">
                {results.complianceStatus.safetyClassification}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Design Guidelines */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">Design Guidelines</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800">Height Guidelines</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Typical: 3-20 meters</li>
              <li>• Very low heights may indicate calculation errors</li>
              <li>• Consider multiple spray tiers for tall towers</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800">Pressure Drop Guidelines</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Typical: 100-5000 Pa</li>
              <li>• Low values are normal for spray towers</li>
              <li>• High values may indicate design issues</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}