import { TowerParameters, ValidationError } from '@/types';
import { NOZZLE_LIBRARY } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TowerParametersInputProps {
  values: TowerParameters;
  onChange: (values: TowerParameters) => void;
  errors: ValidationError[];
}

export function TowerParametersInput({ values, onChange, errors }: TowerParametersInputProps) {
  const getError = (field: string) => errors.find(e => e.field === field);

  const handleNozzleChange = (nozzleType: string) => {
    onChange({ ...values, nozzleType: nozzleType === 'none' ? undefined : nozzleType });
  };

  const handleChange = (field: keyof TowerParameters, value: string) => {
    if (field === 'nozzleType') return;
    
    if (field === 'kgaOverride' && value === '') {
      onChange({ ...values, [field]: undefined });
    } else {
      const numValue = value === '' ? 0 : parseFloat(value);
      onChange({ ...values, [field]: numValue });
    }
  };

  const selectedNozzle = values.nozzleType ? NOZZLE_LIBRARY[values.nozzleType] : null;

  return (
    <div className="space-y-6">
      {/* Tower & Liquid Parameters */}
      <div>
        <h4 className="font-medium mb-3">Tower & Liquid Parameters</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lgRatio">
              L/G Ratio (m³/m³)
            </Label>
            <Input
              id="lgRatio"
              type="number"
              step="0.001"
              value={values.lgRatio || ''}
              onChange={(e) => handleChange('lgRatio', e.target.value)}
              className={getError('lgRatio') ? 'border-red-500' : ''}
            />
            {getError('lgRatio') && (
              <p className={`text-sm ${
                getError('lgRatio')?.type === 'error' ? 'text-red-500' : 'text-orange-500'
              }`}>
                {getError('lgRatio')?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="liquidDensity">
              Liquid Density (kg/m³)
            </Label>
            <Input
              id="liquidDensity"
              type="number"
              step="0.1"
              value={values.liquidDensity || ''}
              onChange={(e) => handleChange('liquidDensity', e.target.value)}
              className={getError('liquidDensity') ? 'border-red-500' : ''}
            />
            {getError('liquidDensity') && (
              <p className="text-sm text-red-500">
                {getError('liquidDensity')?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="liquidViscosity">
              Liquid Viscosity (Pa·s)
            </Label>
            <Input
              id="liquidViscosity"
              type="number"
              step="0.0001"
              value={values.liquidViscosity || ''}
              onChange={(e) => handleChange('liquidViscosity', e.target.value)}
              className={getError('liquidViscosity') ? 'border-red-500' : ''}
            />
            {getError('liquidViscosity') && (
              <p className="text-sm text-red-500">
                {getError('liquidViscosity')?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gasVelocity">
              Gas Velocity (m/s)
            </Label>
            <Input
              id="gasVelocity"
              type="number"
              step="0.1"
              value={values.gasVelocity || ''}
              onChange={(e) => handleChange('gasVelocity', e.target.value)}
              className={getError('gasVelocity') ? 'border-red-500' : ''}
            />
            {getError('gasVelocity') && (
              <p className={`text-sm ${
                getError('gasVelocity')?.type === 'error' ? 'text-red-500' : 'text-orange-500'
              }`}>
                {getError('gasVelocity')?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dropletSize">
              Droplet Size (mm)
            </Label>
            <Input
              id="dropletSize"
              type="number"
              step="0.01"
              value={values.dropletSize || ''}
              onChange={(e) => handleChange('dropletSize', e.target.value)}
              className={getError('dropletSize') ? 'border-red-500' : ''}
            />
            {getError('dropletSize') && (
              <p className={`text-sm ${
                getError('dropletSize')?.type === 'error' ? 'text-red-500' : 'text-orange-500'
              }`}>
                {getError('dropletSize')?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nozzlePressure">
              Nozzle Pressure (bar)
            </Label>
            <Input
              id="nozzlePressure"
              type="number"
              step="0.1"
              value={values.nozzlePressure || ''}
              onChange={(e) => handleChange('nozzlePressure', e.target.value)}
              className={getError('nozzlePressure') ? 'border-red-500' : ''}
            />
            {getError('nozzlePressure') && (
              <p className="text-sm text-red-500">
                {getError('nozzlePressure')?.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nozzle & Advanced Parameters */}
      <div>
        <h4 className="font-medium mb-3">Nozzle & Advanced Parameters</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nozzleType">
              Nozzle Type (Optional)
            </Label>
            <Select value={values.nozzleType || 'none'} onValueChange={handleNozzleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select nozzle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {Object.keys(NOZZLE_LIBRARY).map((nozzle) => (
                  <SelectItem key={nozzle} value={nozzle}>
                    {nozzle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kgaOverride">
              Override KG·a (1/s) - Optional
            </Label>
            <Input
              id="kgaOverride"
              type="number"
              step="0.001"
              placeholder="Leave blank for calculated value"
              value={values.kgaOverride || ''}
              onChange={(e) => handleChange('kgaOverride', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frictionFactor">
              Friction Factor (dimensionless)
            </Label>
            <Input
              id="frictionFactor"
              type="number"
              step="0.001"
              value={values.frictionFactor || ''}
              onChange={(e) => handleChange('frictionFactor', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pumpHead">
              Pump Head (m)
            </Label>
            <Input
              id="pumpHead"
              type="number"
              step="0.1"
              value={values.pumpHead || ''}
              onChange={(e) => handleChange('pumpHead', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="naohStoichiometry">
              NaOH Stoichiometry (mol/mol)
            </Label>
            <Input
              id="naohStoichiometry"
              type="number"
              step="0.1"
              value={values.naohStoichiometry || ''}
              onChange={(e) => handleChange('naohStoichiometry', e.target.value)}
            />
          </div>
        </div>

        {selectedNozzle && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Selected Nozzle Properties</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Flow Coefficient (k):</span>
                <br />
                {selectedNozzle.k} m³/h·bar⁻⁰·⁵
              </div>
              <div>
                <span className="font-medium">Description:</span>
                <br />
                {selectedNozzle.description}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}