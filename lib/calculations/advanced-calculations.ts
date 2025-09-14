import { TowerParameters } from '@/types';

export interface DropletPhysics {
  terminalVelocity: number; // m/s
  relativeVelocity: number; // m/s
  contactTime: number; // s
  reynoldsNumber: number; // dimensionless
}

export interface ParticulateEfficiency {
  coarse_10um: number; // >10 μm efficiency
  medium_2um: number; // ~2 μm efficiency
  fine_1um: number; // <1 μm efficiency
}

// Calculate droplet terminal velocity using Schiller-Naumann correlation
export function calculateDropletPhysics(
  dropletSize: number, // mm
  gasVelocity: number, // m/s
  gasDensity: number, // kg/m³
  gasViscosity: number, // Pa·s
  liquidDensity: number, // kg/m³
  sprayHeight: number // m
): DropletPhysics {
  const dropletDiameter = dropletSize * 0.001; // Convert mm to m
  
  // Calculate terminal velocity using iterative solution for Schiller-Naumann
  let terminalVelocity = 1.0; // Initial guess (m/s)
  
  for (let i = 0; i < 10; i++) { // Iterative solution
    const reynolds = (gasDensity * terminalVelocity * dropletDiameter) / gasViscosity;
    
    // Schiller-Naumann drag coefficient: Cd = 24/Re * (1 + 0.15*Re^0.687)
    let dragCoeff = 24 / reynolds * (1 + 0.15 * Math.pow(reynolds, 0.687));
    
    // For high Reynolds numbers, limit drag coefficient
    if (reynolds > 1000) {
      dragCoeff = 0.44;
    }
    
    // Terminal velocity: vt = sqrt((4*g*dp*(ρl-ρg))/(3*Cd*ρg))
    const gravity = 9.80665; // m/s²
    const newVelocity = Math.sqrt(
      (4 * gravity * dropletDiameter * (liquidDensity - gasDensity)) /
      (3 * dragCoeff * gasDensity)
    );
    
    if (Math.abs(newVelocity - terminalVelocity) < 0.001) {
      terminalVelocity = newVelocity;
      break;
    }
    terminalVelocity = newVelocity;
  }
  
  // Relative velocity for counter-current flow
  const relativeVelocity = Math.max(0, terminalVelocity - gasVelocity);
  
  // Contact time based on spray height and relative velocity
  const contactTime = relativeVelocity > 0 ? sprayHeight / relativeVelocity : 0;
  
  // Reynolds number for the terminal velocity
  const reynoldsNumber = (gasDensity * terminalVelocity * dropletDiameter) / gasViscosity;
  
  return {
    terminalVelocity,
    relativeVelocity,
    contactTime,
    reynoldsNumber,
  };
}

// Calculate particulate collection efficiency by size
export function calculateParticulateEfficiency(
  dropletSize: number, // mm
  gasVelocity: number, // m/s
  liquidFlux: number, // m/s
  sprayHeight: number, // m
  relativeVelocity: number // m/s
): ParticulateEfficiency {
  // Based on empirical data from spray tower performance
  // η = 1 - exp(-Nt) where Nt depends on particle size and operating conditions
  
  // Calculate collection intensity factor
  const contactingPower = liquidFlux * relativeVelocity; // Approximation of energy input
  const residenceTime = sprayHeight / Math.max(gasVelocity, 0.1);
  
  // Particle size-specific collection units (Nt)
  // These are empirical correlations based on typical spray tower performance
  
  // Coarse particles (>10 μm): High efficiency due to inertial impaction
  const nt_coarse = Math.min(10, contactingPower * residenceTime * 50 / dropletSize);
  const coarse_10um = Math.min(0.99, 1 - Math.exp(-nt_coarse));
  
  // Medium particles (~2 μm): Moderate efficiency
  const nt_medium = Math.min(5, contactingPower * residenceTime * 10 / dropletSize);
  const medium_2um = Math.min(0.80, 1 - Math.exp(-nt_medium));
  
  // Fine particles (<1 μm): Poor efficiency unless very fine sprays
  const nt_fine = Math.min(2, contactingPower * residenceTime * 2 / dropletSize);
  const fine_1um = Math.min(0.20, 1 - Math.exp(-nt_fine));
  
  return {
    coarse_10um,
    medium_2um,
    fine_1um,
  };
}

// Calculate compliance status based on regulatory framework
export function calculateComplianceStatus(
  framework: 'EU' | 'US',
  outletConcentration: number, // mg/Nm³ or ppmv
  pressure: number, // Pa
  pollutantType: string
): {
  framework: 'EU' | 'US';
  emissionLimitsMet: boolean;
  pressureVesselCode: string;
  safetyClassification?: string;
} {
  let emissionLimitsMet = true;
  let pressureVesselCode = '';
  let safetyClassification = '';
  
  if (framework === 'EU') {
    pressureVesselCode = pressure > 50000 ? 'EU PED (>0.5 bar)' : 'Atmospheric vessel';
    safetyClassification = 'ATEX assessment required for flammable gases';
    
    // Example emission limits (would be application-specific in practice)
    const euLimits: Record<string, number> = {
      SO2: 200, // mg/Nm³
      HCl: 10,  // mg/Nm³
      NH3: 50,  // mg/Nm³
      H2S: 5,   // mg/Nm³
    };
    
    const limit = euLimits[pollutantType];
    if (limit && outletConcentration > limit) {
      emissionLimitsMet = false;
    }
  } else {
    pressureVesselCode = pressure > 103421 ? 'ASME BPVC Section VIII' : 'Atmospheric vessel';
    safetyClassification = 'OSHA/NFPA compliance required';
    
    // US limits would typically be in ppmvd - this is simplified
    emissionLimitsMet = true; // Would need specific plant limits
  }
  
  return {
    framework,
    emissionLimitsMet,
    pressureVesselCode,
    safetyClassification,
  };
}