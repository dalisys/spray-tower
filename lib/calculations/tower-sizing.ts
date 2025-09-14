// Tower sizing calculations

export interface TowerSizingResults {
  towerArea: number; // m²
  towerDiameter: number; // m
  liquidFlowRate: number; // m³/s
  liquidRate: number; // m³/h
  liquidFlux: number; // m/s
}

export function calculateTowerSizing(
  operatingGasFlow: number, // m³/s
  gasVelocity: number, // m/s
  lgRatio: number // m³/m³
): TowerSizingResults {
  // Tower cross-sectional area from gas flow and velocity
  const towerArea = operatingGasFlow / gasVelocity;
  
  // Tower diameter from area
  const towerDiameter = Math.sqrt((4 * towerArea) / Math.PI);
  
  // Liquid flow rate from L/G ratio
  const liquidFlowRate = lgRatio * operatingGasFlow;
  
  // Liquid rate in m³/h
  const liquidRate = liquidFlowRate * 3600;
  
  // Liquid flux (superficial velocity)
  const liquidFlux = liquidFlowRate / towerArea;
  
  return {
    towerArea,
    towerDiameter,
    liquidFlowRate,
    liquidRate,
    liquidFlux,
  };
}