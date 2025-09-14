# Spray Tower Calculator - Technical Specification for Web App Development

## Executive Summary

This document provides a comprehensive technical specification for spray tower calculator into a web application. 
## File Structure Overview

The Excel workbook contains 6 worksheets:
- **README**: Documentation and usage instructions
- **Inputs**: User interface with input parameters (yellow cells)
- **Libraries**: Reference data tables for pollutants and equipment
- **Calcs**: Core calculation engine with 35+ formulas
- **Results**: Summary output display
- **Sensitivity**: Parameter analysis table

## Input Parameters (User Interface Requirements)

### Gas Stream Properties
- **Gas Flow Rate** (`Qg_Nm3h`): Standard flow rate in Nm³/h (Default: 20,000)
- **Operating Temperature** (`T_C`): Temperature in °C (Default: 40)
- **Operating Pressure** (`P_kPa`): Pressure in kPa (Default: 101.325)
- **Gas Viscosity** (`mu_g`): Override value in Pa·s (Optional, uses library default if blank)

### Pollutant & Performance
- **Pollutant Type** (`Pollutant`): Dropdown selection from ["SO2", "HCl", "NH3", "H2S"]
- **Inlet Concentration** (`C_in_mgNm3`): mg/Nm³ (Default: 1500)
- **Target Efficiency** (`Eff_target`): Removal efficiency 0-1 (Default: 0.9)

### Tower & Liquid Parameters
- **L/G Ratio** (`L_over_G`): Liquid to gas ratio m³/m³ (Default: 0.015)
- **Liquid Density** (`rho_l`): kg/m³ (Default: 1000)
- **Liquid Viscosity** (`mu_l`): Pa·s (Default: 0.001)
- **Gas Velocity** (`u_g`): Superficial velocity m/s (Default: 3)
- **Droplet Size** (`d32_mm`): Sauter mean diameter mm (Default: 0.8)
- **Nozzle Type** (`Nozzle`): Optional selection (affects flow calculations)
- **Nozzle Pressure** (`Nozzle_P_bar`): bar (Default: 1.5)
- **Override KG·a** (`KGa_override`): Optional override for mass transfer (1/s)
- **Friction Factor** (`f_fric`): Dimensionless (Default: 0.02)
- **Pump Head** (`pump_head_m`): m (Default: 10)
- **NaOH Stoichiometry** (`naoh_stoich`): mol/mol (Default: 1)

## Reference Data Tables (Libraries Sheet)

### Pollutant Properties
| Pollutant | Henry Constant (Pa·m³/mol) | Diffusivity (m²/s) | Molar Mass (g/mol) |
|-----------|---------------------------|-------------------|-------------------|
| SO2       | 1230                      | 0.000012          | 64.066            |
| HCl       | 0.194                     | 0.000016          | 36.461            |
| NH3       | 6600                      | 0.000021          | 17.031            |
| H2S       | 930                       | 0.000014          | 34.08             |

### Gas Properties (Constants)
- Dynamic viscosity μ_g: 0.0000185 Pa·s
- Universal gas constant R: 8.314462618 J/mol·K
- Mean molar mass of air: 0.02897 kg/mol

### Nozzle Specifications
| Nozzle Type          | k (m³/h·bar^-0.5) | Description   |
|---------------------|------------------|---------------|
| FullCone-1/2-15     | 1.5              | Medium flow   |
| HollowCone-3/4-25   | 2.6              | Higher flow   |
| Spiral-1/2-10       | 1.2              | Fine droplets |

## Core Calculation Engine

### Calculation Sequence

The calculations follow this logical sequence:

1. **Gas Properties Calculation**
2. **Tower Sizing**
3. **Mass Transfer Calculations**
4. **Height Determination**
5. **Results Summary**

### Key Formulas and Logic

#### 1. Gas Properties
```
Operating Temperature (K) = T_C + 273.15
Operating Pressure (Pa) = P_kPa * 1000
Gas Density (kg/m³) = (P * M_air) / (R_gas * T)
Operating Gas Flow (m³/s) = (Qg_Nm3h/3600) * (T/273.15) * (101325/P)
Effective Gas Viscosity = IF(mu_g="", Libraries_Default, mu_g)
```

#### 2. Tower Sizing
```
Tower Cross-sectional Area (m²) = Operating_Gas_Flow / Target_Gas_Velocity
Tower Diameter (m) = SQRT(4 * Area / PI())
```

#### 3. Mass Transfer Parameters
```
Droplet Diameter (m) = d32_mm / 1000
Relative Velocity (m/s) = Target_Gas_Velocity
Reynolds Number = (Gas_Density * Relative_Velocity * Droplet_Diameter) / Gas_Viscosity
Schmidt Number = Gas_Viscosity / (Gas_Density * Diffusivity)
Sherwood Number = 2 + 0.6 * SQRT(Reynolds) * POWER(Schmidt, 1/3)
Gas Film Coefficient (m/s) = (Sherwood * Diffusivity) / Droplet_Diameter
```

#### 4. Interfacial Area and Overall Mass Transfer
```
Liquid Flow Rate (m³/s) = L_over_G * Operating_Gas_Flow
Liquid Flux (m/s) = Liquid_Flow_Rate / Tower_Area
Interfacial Area (1/m) = IF(Relative_Velocity=0, 0, 6*Liquid_Flux/(Relative_Velocity*Droplet_Diameter))
Overall KG·a (1/s) = IF(KGa_override="", Gas_Film_Coefficient * Interfacial_Area, KGa_override)
```

#### 5. Tower Height and Performance
```
Required Height (m) = IF(AND(KGa>0, 1-Target_eff>0), -(u_g_eff/KGa)*LN(1-Target_eff), "")
Gas Residence Time (s) = IF(u_g_eff=0, "", Height/u_g_eff)
Outlet Concentration (mg/Nm³) = IF(C_in_mgNm3="", "", C_in_mgNm3*(1-Target_eff))
Pressure Drop (Pa) = f_fric*(Height/Diameter)*(Gas_Density*(u_g_eff^2)/2)
```

#### 6. Auxiliary Calculations
```
Liquid Rate (m³/h) = Liquid_Flow_Rate * 3600
Nozzle Flow per Nozzle (m³/h) = IF(Nozzle="", "", LOOKUP_Nozzle_k * SQRT(Nozzle_Pressure))
Required Nozzles (count) = IF(OR(Nozzle="",Nozzle_Flow=""), "", CEILING(Liquid_Rate/Nozzle_Flow, 1))
Moles Removed (mol/h) = IF(C_in_mgNm3="", "", (Qg_Nm3h*(C_in_mgNm3-C_out_mgNm3)/1000)/MW_pollutant_gpermol*1000)
NaOH Consumption (mol/h) = IF(Moles_removed="", "", Moles_removed*naoh_stoich)
```

## Output Parameters (Results)

### Primary Results
- **Tower Diameter** (m): Physical dimension for tower construction
- **Required Height** (m): Tower height needed to achieve target efficiency
- **Gas Residence Time** (s): Contact time for mass transfer
- **Pressure Drop** (Pa): Energy requirement for gas flow
- **Outlet Concentration** (mg/Nm³): Final pollutant level after treatment

### Secondary Results
- **Overall KG·a** (1/s): Mass transfer performance indicator
- **Interfacial Area** (1/m): Surface area available for mass transfer
- **Gas Density** (kg/m³): Operating condition parameter
- **Liquid Rate** (m³/h): Required liquid circulation rate
- **NaOH Consumption** (mol/h): Chemical consumption for neutralization

## Data Validation Requirements

### Input Validation Rules
1. **Gas Flow Rate**: Must be > 0
2. **Temperature**: Typically 0-200°C for industrial applications
3. **Pressure**: Must be > 0, typically 50-500 kPa
4. **Pollutant**: Must match library entries exactly
5. **Inlet Concentration**: Must be > 0
6. **Target Efficiency**: Must be between 0 and 1 (0-100%)
7. **L/G Ratio**: Must be > 0, typically 0.001-0.1
8. **Gas Velocity**: Must be > 0, typically 1-10 m/s
9. **Droplet Size**: Must be > 0, typically 0.1-5 mm

### Dropdown Dependencies
- **Pollutant Selection**: Links to Libraries sheet for automatic lookup of:
  - Henry's constant (H_Pa_m3_per_mol)
  - Diffusivity (D_AB)
  - Molar mass (MW_pollutant_gpermol)
- **Nozzle Selection**: Optional, links to nozzle capacity table

## Error Handling Logic

### Built-in Error Prevention
1. **Division by Zero Protection**:
   ```
   IF(denominator=0, "", calculation)
   ```

2. **Invalid Efficiency Handling**:
   ```
   IF(AND(KGa>0, 1-Target_eff>0), calculation, "")
   ```

3. **Missing Input Handling**:
   ```
   IF(input_value="", "", dependent_calculation)
   ```

4. **Library Lookup Protection**:
   ```
   IFERROR(INDEX(lookup_range, MATCH(key, key_range, 0)), "")
   ```

## Named Range Mapping

The Excel file uses 47 named ranges for calculation connectivity. Key mappings for web app variables:

| Variable Name | Excel Named Range | Cell Reference | Description |
|---------------|------------------|----------------|-------------|
| gasFlow | Qg_Nm3h | Inputs!$B$4 | Standard gas flow rate |
| temperature | T_C | Inputs!$B$5 | Operating temperature |
| pressure | P_kPa | Inputs!$B$6 | Operating pressure |
| pollutantType | Pollutant | Inputs!$B$11 | Selected pollutant |
| inletConc | C_in_mgNm3 | Inputs!$B$12 | Inlet concentration |
| targetEff | Eff_target | Inputs!$B$13 | Target efficiency |
| lgRatio | L_over_G | Inputs!$B$20 | Liquid to gas ratio |
| gasVelocity | u_g | Inputs!$B$23 | Target gas velocity |
| dropletSize | d32_mm | Inputs!$B$24 | Droplet diameter |
| towerDiameter | D | Calcs!$B$15 | Calculated diameter |
| towerHeight | H | Calcs!$B$27 | Required height |
| outletConc | C_out_mgNm3 | Calcs!$B$29 | Outlet concentration |
| pressureDrop | DeltaP_Pa | Calcs!$B$30 | Pressure drop |

## Implementation Recommendations

### Web App Architecture
1. **Frontend**: React/Vue.js for interactive interface
2. **Backend**: Node.js/Python for calculations
3. **Database**: Store reference data (pollutant properties, nozzle specs)
4. **Validation**: Client-side and server-side validation

### Calculation Engine Design
1. **Modular Functions**: Separate functions for each calculation group
2. **Error Handling**: Comprehensive validation and error messages
3. **Unit Consistency**: Maintain consistent units throughout calculations
4. **Performance**: Cache reference data for faster lookups

### User Interface Considerations
1. **Input Grouping**: Organize inputs by category (Gas Stream, Pollutant, Tower)
2. **Real-time Calculation**: Update results as inputs change
3. **Visual Feedback**: Highlight invalid inputs with clear error messages
4. **Units Display**: Always show units next to input fields and results
5. **Help Text**: Provide tooltips explaining each parameter

### Additional Features for Web App
1. **Save/Load Configurations**: Allow users to save calculation scenarios
2. **PDF Reports**: Generate printable calculation reports
3. **Parameter Studies**: Implement sensitivity analysis functionality
4. **Input Validation**: More sophisticated range checking than Excel
5. **Mobile Responsiveness**: Ensure app works on tablets and phones

## Testing Requirements

### Validation Test Cases
1. **Baseline Test**: Use default values, verify against Excel results
2. **Boundary Tests**: Test minimum/maximum reasonable values
3. **Error Cases**: Test with invalid inputs (negative values, zeros)
4. **Pollutant Switching**: Verify automatic property updates
5. **Edge Cases**: Very high/low L/G ratios, extreme temperatures

### Expected Results (Baseline Test)
Using default inputs:
- Tower Diameter: 1.644 m
- Required Height: 1.98e-8 m (Note: This seems incorrect - likely formula issue)
- Outlet Concentration: 150 mg/Nm³
- Pressure Drop: 1.22e-9 Pa (Note: This also seems too small)

**Important**: The extremely small height and pressure drop values suggest there may be unit conversion issues or formula errors in the original Excel that should be investigated and corrected during web app development.

## Critical Implementation Notes

1. **Formula Verification**: Some calculated values appear unrealistic (height ~2e-8 m). The mass transfer correlation and height calculation should be carefully reviewed.

2. **Unit Conversion**: Ensure all unit conversions are correct, particularly:
   - Standard to operating flow conditions
   - Pressure units (kPa to Pa)
   - Time units in mass transfer calculations

3. **Physical Validation**: Add sanity checks for results:
   - Tower height should typically be 3-20 meters
   - Pressure drop should be 100-5000 Pa
   - Gas velocity should be reasonable (1-10 m/s)

4. **Documentation**: The original Excel contains simplified correlations and is marked as "educational only" - consider adding disclaimers about industrial use.

This specification provides the complete foundation for developing a robust web application that replicates and improves upon the Excel calculator functionality.