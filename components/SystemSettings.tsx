import { SystemSettings, ValidationError, ApplicationType, RegulatoryFramework, UnitSystem } from '@/types';
import { APPLICATION_RECOMMENDATIONS, REGULATORY_FRAMEWORKS } from '@/lib/constants';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface SystemSettingsProps {
  values: SystemSettings;
  onChange: (values: SystemSettings) => void;
  errors: ValidationError[];
}

export function SystemSettingsComponent({ values, onChange, errors }: SystemSettingsProps) {
  const getError = (field: string) => errors.find(e => e.field === field);

  const handleUnitSystemChange = (unitSystem: UnitSystem) => {
    onChange({ ...values, unitSystem });
  };

  const handleRegulatoryFrameworkChange = (regulatoryFramework: RegulatoryFramework) => {
    onChange({ ...values, regulatoryFramework });
  };

  const handleApplicationTypeChange = (applicationType: ApplicationType) => {
    onChange({ ...values, applicationType });
  };

  const selectedApplication = APPLICATION_RECOMMENDATIONS[values.applicationType];
  const selectedRegulatory = REGULATORY_FRAMEWORKS[values.regulatoryFramework];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">System Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unitSystem">
            Unit System
          </Label>
          <Select value={values.unitSystem} onValueChange={handleUnitSystemChange}>
            <SelectTrigger 
              className={getError('unitSystem') ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select unit system" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">
                Metric (SI Units)
              </SelectItem>
              <SelectItem value="imperial">
                Imperial (US Units)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {values.unitSystem === 'metric' 
              ? 'Equipment sizing: m, m², m/s, GPM' 
              : 'Equipment sizing: ft, ft², ft/s, GPM'}
          </p>
          <p className="text-xs text-muted-foreground italic">
            Process inputs remain in standard units (Nm³/h, mg/Nm³, °C) regardless of system
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="regulatoryFramework">
            Regulatory Framework
          </Label>
          <Select value={values.regulatoryFramework} onValueChange={handleRegulatoryFrameworkChange}>
            <SelectTrigger 
              className={getError('regulatoryFramework') ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EU">
                European Union
              </SelectItem>
              <SelectItem value="US">
                United States
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {selectedRegulatory.emissionUnits}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="applicationType">
            Application Type
          </Label>
          <Select value={values.applicationType} onValueChange={handleApplicationTypeChange}>
            <SelectTrigger 
              className={getError('applicationType') ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select application" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gas_absorption">
                Gas Absorption
              </SelectItem>
              <SelectItem value="particulate_removal">
                Particulate Removal
              </SelectItem>
              <SelectItem value="cooling">
                Gas Cooling
              </SelectItem>
              <SelectItem value="odor_control">
                Odor Control
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {selectedApplication.description}
          </p>
        </div>
      </div>

      {/* Application-specific recommendations */}
      <div className="mt-6 space-y-4">
        {/* Regulatory Information */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">
                Regulatory Framework: {selectedRegulatory.name}
              </h4>
              <div className="mt-2 space-y-1 text-sm text-blue-800">
                <p><strong>Emission Units:</strong> {selectedRegulatory.emissionUnits}</p>
                <p><strong>Pressure Vessel Code:</strong> {selectedRegulatory.codes.pressureVessel}</p>
                <p><strong>Testing Standards:</strong> {selectedRegulatory.codes.testing}</p>
                <p><strong>Safety Requirements:</strong> {selectedRegulatory.codes.safety}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Recommendations */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-3">
            Recommended Design Parameters for {selectedApplication.description}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-800">L/G Ratio</span>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {selectedApplication.lgRatio.recommended} L/m³
                </Badge>
              </div>
              <p className="text-green-700 mt-1">
                Range: {selectedApplication.lgRatio.min} - {selectedApplication.lgRatio.max} L/m³
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-800">Gas Velocity</span>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {selectedApplication.gasVelocity.recommended} m/s
                </Badge>
              </div>
              <p className="text-green-700 mt-1">
                Range: {selectedApplication.gasVelocity.min} - {selectedApplication.gasVelocity.max} m/s
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-800">Droplet Size</span>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {selectedApplication.dropletSize.recommended} mm
                </Badge>
              </div>
              <p className="text-green-700 mt-1">
                Range: {selectedApplication.dropletSize.min} - {selectedApplication.dropletSize.max} mm
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}