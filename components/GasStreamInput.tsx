import { GasStreamProperties, ValidationError } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface GasStreamInputProps {
  values: GasStreamProperties;
  onChange: (values: GasStreamProperties) => void;
  errors: ValidationError[];
}

export function GasStreamInput({ values, onChange, errors }: GasStreamInputProps) {
  const getError = (field: string) => errors.find(e => e.field === field);

  const handleChange = (field: keyof GasStreamProperties, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (field === 'gasViscosity' && value === '') {
      onChange({ ...values, [field]: undefined });
    } else {
      onChange({ ...values, [field]: numValue });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="gasFlowRate">
              Gas Flow Rate (Nm³/h)
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-64">
                <p className="font-semibold">Standard Industrial Units</p>
                <p className="text-xs mt-1">
                  Normal cubic meters per hour (Nm³/h) is the international standard for gas flow measurements at standard conditions (0°C, 1 atm). This unit is used globally, including in US industrial facilities, for environmental reporting and equipment specifications.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="gasFlowRate"
            type="number"
            step="0.1"
            value={values.gasFlowRate || ''}
            onChange={(e) => handleChange('gasFlowRate', e.target.value)}
            className={getError('gasFlowRate') ? 'border-red-500' : ''}
          />
          {getError('gasFlowRate') && (
            <p className={`text-sm ${
              getError('gasFlowRate')?.type === 'error' ? 'text-red-500' : 'text-orange-500'
            }`}>
              {getError('gasFlowRate')?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="temperature">
              Operating Temperature (°C)
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-64">
                <p className="font-semibold">Engineering Standard</p>
                <p className="text-xs mt-1">
                  Process temperatures are specified in Celsius (°C) as the international engineering standard. Even US industrial facilities typically use Celsius for process conditions and equipment specifications.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            value={values.temperature || ''}
            onChange={(e) => handleChange('temperature', e.target.value)}
            className={getError('temperature') ? 'border-red-500' : ''}
          />
          {getError('temperature') && (
            <p className={`text-sm ${
              getError('temperature')?.type === 'error' ? 'text-red-500' : 'text-orange-500'
            }`}>
              {getError('temperature')?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pressure">
            Operating Pressure (kPa)
          </Label>
          <Input
            id="pressure"
            type="number"
            step="0.001"
            value={values.pressure || ''}
            onChange={(e) => handleChange('pressure', e.target.value)}
            className={getError('pressure') ? 'border-red-500' : ''}
          />
          {getError('pressure') && (
            <p className={`text-sm ${
              getError('pressure')?.type === 'error' ? 'text-red-500' : 'text-orange-500'
            }`}>
              {getError('pressure')?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gasViscosity">
            Gas Viscosity (Pa·s) - Optional Override
          </Label>
          <Input
            id="gasViscosity"
            type="number"
            step="0.0000001"
            placeholder="Leave blank for default (1.85×10⁻⁵)"
            value={values.gasViscosity || ''}
            onChange={(e) => handleChange('gasViscosity', e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Default: 1.85×10⁻⁵ Pa·s (air at standard conditions)
          </p>
        </div>
      </div>
    </div>
  );
}