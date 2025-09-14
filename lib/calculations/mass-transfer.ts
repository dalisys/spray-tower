import { PollutantProperties, TowerParameters } from '@/types';
import { POLLUTANT_LIBRARY, UNIT_CONVERSIONS, CORRELATIONS } from '@/lib/constants';

export interface MassTransferResults {
  dropletDiameter: number; // m
  relativeVelocity: number; // m/s
  reynoldsNumber: number; // dimensionless
  schmidtNumber: number; // dimensionless
  sherwoodNumber: number; // dimensionless
  gasFilmCoefficient: number; // m/s
  interfacialArea: number; // 1/m
  overallKGa: number; // 1/s
}

export function calculateMassTransfer(
  pollutant: PollutantProperties,
  tower: TowerParameters,
  gasDensity: number, // kg/m³
  gasViscosity: number, // Pa·s
  gasVelocity: number, // m/s
  liquidFlux: number // m/s
): MassTransferResults {
  const pollutantData = POLLUTANT_LIBRARY[pollutant.type];
  
  // Convert droplet size from mm to m
  const dropletDiameter = tower.dropletSize * UNIT_CONVERSIONS.LENGTH.mm_to_m;
  
  // Relative velocity (assuming counter-current flow)
  const relativeVelocity = gasVelocity;
  
  // Reynolds number: Re = (ρ * v * d) / μ
  const reynoldsNumber = (gasDensity * relativeVelocity * dropletDiameter) / gasViscosity;
  
  // Schmidt number: Sc = μ / (ρ * D)
  const schmidtNumber = gasViscosity / (gasDensity * pollutantData.diffusivity);
  
  // Sherwood number: Sh = 2 + 0.6 * Re^0.5 * Sc^(1/3)
  const sherwoodNumber = CORRELATIONS.SHERWOOD_CONSTANT_A + 
    CORRELATIONS.SHERWOOD_CONSTANT_B * 
    Math.pow(reynoldsNumber, CORRELATIONS.SHERWOOD_REYNOLDS_EXP) * 
    Math.pow(schmidtNumber, CORRELATIONS.SHERWOOD_SCHMIDT_EXP);
  
  // Gas film coefficient: kg = (Sh * D) / d
  const gasFilmCoefficient = (sherwoodNumber * pollutantData.diffusivity) / dropletDiameter;
  
  // Interfacial area per unit volume: a = 6 * L_flux / (v_rel * d)
  // If relative velocity is zero, set interfacial area to zero to avoid division by zero
  const interfacialArea = relativeVelocity > 0 ? 
    (6 * liquidFlux) / (relativeVelocity * dropletDiameter) : 0;
  
  // Overall KGa: use override if provided, otherwise use empirical correlation
  // Documentation correlation: K_G a = 0.1586 * G_m^0.8 * L^0.4
  // where G_m in kmol/s, L in L/(s·m²)
  let calculatedKGa = 0;
  if (liquidFlux > 0) {
    // Convert molar gas flow to kmol/s (approximate for air at operating conditions)
    const approximateGasMolarFlow = (gasDensity * gasVelocity * 1) / 29; // rough estimate, kmol/(s·m²)
    // Convert liquid flux to L/(s·m²)
    const liquidFluxLiterPerSm2 = liquidFlux * 1000; // m/s to L/(s·m²) × m² = L/s per m²
    
    calculatedKGa = 0.1586 * Math.pow(approximateGasMolarFlow, 0.8) * Math.pow(liquidFluxLiterPerSm2, 0.4);
  }
  
  const overallKGa = tower.kgaOverride || calculatedKGa;
  
  return {
    dropletDiameter,
    relativeVelocity,
    reynoldsNumber,
    schmidtNumber,
    sherwoodNumber,
    gasFilmCoefficient,
    interfacialArea,
    overallKGa,
  };
}