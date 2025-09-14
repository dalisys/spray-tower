import { PollutantProperties, ValidationError, PollutantType } from '@/types';
import { POLLUTANT_LIBRARY } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PollutantInputProps {
  values: PollutantProperties;
  onChange: (values: PollutantProperties) => void;
  errors: ValidationError[];
}

export function PollutantInput({ values, onChange, errors }: PollutantInputProps) {
  const getError = (field: string) => errors.find(e => e.field === field);

  const handlePollutantChange = (type: PollutantType) => {
    onChange({ ...values, type });
  };

  const handleChange = (field: keyof PollutantProperties, value: string) => {
    if (field === 'type') return;
    const numValue = value === '' ? 0 : parseFloat(value);
    onChange({ ...values, [field]: numValue });
  };

  const pollutantData = POLLUTANT_LIBRARY[values.type];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pollutantType">
            Pollutant Type
          </Label>
          <Select value={values.type} onValueChange={handlePollutantChange}>
            <SelectTrigger 
              className={getError('pollutantType') ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select pollutant" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(POLLUTANT_LIBRARY).map((pollutant) => (
                <SelectItem key={pollutant} value={pollutant}>
                  {pollutant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getError('pollutantType') && (
            <p className="text-sm text-red-500">
              {getError('pollutantType')?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="inletConcentration">
            Inlet Concentration (mg/Nm³)
          </Label>
          <Input
            id="inletConcentration"
            type="number"
            step="0.1"
            value={values.inletConcentration || ''}
            onChange={(e) => handleChange('inletConcentration', e.target.value)}
            className={getError('inletConcentration') ? 'border-red-500' : ''}
          />
          {getError('inletConcentration') && (
            <p className={`text-sm ${
              getError('inletConcentration')?.type === 'error' ? 'text-red-500' : 'text-orange-500'
            }`}>
              {getError('inletConcentration')?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetEfficiency">
            Target Efficiency (%)
          </Label>
          <Input
            id="targetEfficiency"
            type="number"
            step="0.1"
            min="10"
            max="99"
            value={values.targetEfficiency ? (values.targetEfficiency * 100).toFixed(1) : ''}
            onChange={(e) => {
              const percentage = parseFloat(e.target.value) / 100;
              onChange({ ...values, targetEfficiency: percentage });
            }}
            className={getError('targetEfficiency') ? 'border-red-500' : ''}
          />
          {getError('targetEfficiency') && (
            <p className={`text-sm ${
              getError('targetEfficiency')?.type === 'error' ? 'text-red-500' : 'text-orange-500'
            }`}>
              {getError('targetEfficiency')?.message}
            </p>
          )}
        </div>
      </div>

      {pollutantData && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Pollutant Properties</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Henry Constant:</span>
              <br />
              {pollutantData.henryConstant.toExponential(2)} Pa·m³/mol
            </div>
            <div>
              <span className="font-medium">Diffusivity:</span>
              <br />
              {pollutantData.diffusivity.toExponential(2)} m²/s
            </div>
            <div>
              <span className="font-medium">Molar Mass:</span>
              <br />
              {pollutantData.molarMass.toFixed(3)} g/mol
            </div>
          </div>
        </div>
      )}
    </div>
  );
}