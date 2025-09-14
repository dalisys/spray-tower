# Spray Tower Calculator

A modern, modular web application for designing spray tower gas scrubbers used in pollution control systems. This Next.js application converts complex Excel-based engineering calculations into an intuitive, real-time web interface.

## 🏗️ Features

- **Real-time Calculations**: Results update automatically as you modify inputs
- **Comprehensive Validation**: Input validation with helpful error messages and warnings
- **Modular Design**: Clean separation between calculation engine, UI components, and data management
- **Professional UI**: Built with shadcn/ui components and Tailwind CSS for a clean, professional interface
- **Engineering Accuracy**: Implements proper spray tower design equations and correlations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
pnpm build
pnpm start
```

## 🔧 Technical Architecture

### Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (New York style)
- **Package Manager**: pnpm
- **Build Tool**: Turbopack

### Project Structure

```
├── app/                    # Next.js app router pages
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── GasStreamInput.tsx
│   ├── PollutantInput.tsx
│   ├── TowerParametersInput.tsx
│   ├── ResultsDisplay.tsx
│   └── SprayTowerCalculator.tsx
├── lib/
│   ├── calculations/     # Calculation engine modules
│   │   ├── calculator.ts
│   │   ├── gas-properties.ts
│   │   ├── mass-transfer.ts
│   │   ├── performance.ts
│   │   └── tower-sizing.ts
│   ├── constants.ts      # Physical constants and data
│   ├── validation.ts     # Input validation logic
│   └── utils.ts          # Utilities
├── types/
│   └── index.ts          # TypeScript type definitions
└── docs/                 # Engineering documentation
```

### Calculation Modules

1. **Gas Properties**: Calculates operating conditions, density, and flow rates
2. **Tower Sizing**: Determines tower diameter and area based on gas velocity
3. **Mass Transfer**: Computes Reynolds, Schmidt, and Sherwood numbers for mass transfer coefficients
4. **Performance**: Calculates tower height, residence time, pressure drop, and efficiency

## 📋 Engineering Specifications

### Supported Pollutants
- **SO₂** (Sulfur Dioxide)
- **HCl** (Hydrogen Chloride)  
- **NH₃** (Ammonia)
- **H₂S** (Hydrogen Sulfide)

### Input Parameters

#### Gas Stream Properties
- Gas Flow Rate (Nm³/h)
- Operating Temperature (°C)
- Operating Pressure (kPa)
- Gas Viscosity (Pa·s) - Optional override

#### Pollutant & Performance
- Pollutant Type (dropdown selection)
- Inlet Concentration (mg/Nm³)
- Target Efficiency (%)

#### Tower Parameters
- L/G Ratio (m³/m³)
- Liquid Density (kg/m³)
- Liquid Viscosity (Pa·s)
- Gas Velocity (m/s)
- Droplet Size (mm)
- Nozzle specifications (optional)
- Advanced parameters (friction factor, pump head, etc.)

### Output Results

#### Primary Results
- Tower Diameter (m)
- Required Height (m)
- Gas Residence Time (s)
- Pressure Drop (Pa)
- Outlet Concentration (mg/Nm³)

#### Secondary Results
- Overall KG·a coefficient (1/s)
- Interfacial Area (1/m)
- Gas Density (kg/m³)
- Liquid Rate (m³/h)
- NaOH Consumption (mol/h)
- Nozzle requirements (if specified)

## 🧪 Validation & Testing

### Input Validation
- Range checking for all parameters
- Physical feasibility checks
- Warning system for values outside typical ranges
- Real-time error feedback

### Design Guidelines
- Tower heights: typically 3-20 meters
- Gas velocities: 1-10 m/s (warning above 2.3 m/s for entrainment)
- Pressure drops: typically 100-5000 Pa
- L/G ratios: 0.001-0.1 m³/m³

## 🔬 Engineering Background

This calculator is based on established spray tower design principles:

- **Mass Transfer Theory**: Uses correlations for Reynolds, Schmidt, and Sherwood numbers
- **Tower Sizing**: Based on gas velocity limitations to prevent droplet entrainment  
- **Performance Prediction**: Implements Number of Transfer Units (NTU) method
- **Physical Properties**: Includes database of pollutant properties (Henry's constants, diffusivities, molecular weights)

### Key Equations

- Tower diameter: `D = √(4Q/(πu_g))`
- Required height: `H = -(u_g/KGa) × ln(1-η)`
- Sherwood number: `Sh = 2 + 0.6 × Re^0.5 × Sc^(1/3)`
- Mass transfer: `KGa = kg × a`

## 📖 Usage Guidelines

1. **Start with Gas Stream**: Enter your gas flow rate, temperature, and pressure
2. **Select Pollutant**: Choose the contaminant and set inlet concentration and target removal efficiency
3. **Configure Tower**: Set L/G ratio, gas velocity, droplet size, and other parameters
4. **Review Results**: Check the calculated tower dimensions and performance
5. **Validate Design**: Ensure results fall within reasonable engineering ranges

### Best Practices

- Keep gas velocity below 2.3 m/s to avoid droplet entrainment
- Use L/G ratios ≥ 3 L/m³ for gas absorption applications  
- Target droplet sizes of 0.5-1.0 mm for optimal performance
- Consider multiple spray levels for towers >10m height
- Always validate results against pilot test data when available

## 🔧 Development

### Adding New Pollutants

1. Update `POLLUTANT_LIBRARY` in `lib/constants.ts`
2. Add pollutant type to `PollutantType` enum in `types/index.ts`

### Modifying Calculations

The calculation engine is modular:
- Each calculation step is in its own module
- All equations are documented with sources
- Easy to modify correlations or add new calculation methods

### Extending UI

- All components use shadcn/ui for consistency
- Form components include validation display
- Results display includes status indicators and guidelines

## 📄 License

This project is designed for educational and professional engineering use. Please ensure compliance with local engineering standards and regulations.

## 🤝 Contributing

1. Follow the established code structure
2. Add TypeScript types for new features  
3. Include validation for new input parameters
4. Update documentation for new calculations
5. Test calculations against known reference cases

## 📞 Support

For questions about the engineering calculations or application usage, please refer to the documentation in the `docs/` directory.

---

**Disclaimer**: This calculator is intended for preliminary design purposes. All designs should be validated with pilot testing and reviewed by qualified engineers before implementation.
