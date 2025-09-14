# Designing and Calculating Spray Tower Properties for Gas Cleaning

Spray tower scrubbers (also called spray chambers) are simple yet effective gas treatment devices widely used in industries to remove pollutants or cool gas streams. In a spray tower, contaminated gas is brought into contact with a scrubbing liquid by spraying the liquid into the gas stream in the form of fine droplets. This report outlines the key design principles and formulas required to determine spray tower properties for various use cases. All calculations adhere to common engineering practices and consider both EU and US norms (with metric and imperial units where appropriate). The goal is to provide a comprehensive basis for sizing and selecting a spray tower for any industrial gas application, forming a foundation for software design tools.

## Key Design Parameters and Considerations

Designing a spray tower involves many interrelated parameters. Below are the primary factors that must be evaluated, along with their significance:

- **Gas Flow Rate (Q):** The volumetric flow of gas (e.g. in m³/s or acfm) to be treated. This determines the required tower size (diameter) to keep gas velocity within acceptable limits. Large gas flows necessitate larger tower diameters to maintain efficient gas–liquid contact.
- **Gas Velocity in Tower:** The upward gas velocity inside the tower must be optimized for good contact but kept low enough to prevent droplet carryover (entrainment) out of the tower. Typically, **0.3–1.2 m/s (about 1–4 ft/s)** is used in countercurrent spray towers. Exceeding about **2.3 m/s (≈7.5 ft/s)** risks entraining liquid droplets in the outlet gas. (For co-current designs, higher velocities can be tolerated since gas and liquid move in the same direction.)
- **Pollutant Type & Concentration:** The nature of contaminants (soluble gases, particulate matter, odors, etc.) and their inlet concentration influence the required removal efficiency and choice of scrubbing liquid. Highly soluble gases (e.g. HCl, HF) are easily absorbed and can achieve high removal rates in a spray tower. Particulate collection is efficient for coarse particles but drops off for fine particles, as discussed later.
- **Liquid (Scrubbing) Properties:** The type of scrubbing fluid (water or reagent solution) and its flow rate are critical. The **liquid-to-gas ratio (L/G)** is a key design parameter indicating how many liters of liquid are sprayed per unit gas volume. Typical L/G values range from **0.07 to 2.7 L per m³** of gas (which corresponds to ~**0.5 to 20 gal per 1,000 ft³** in US units) depending on the application. Gas absorption applications generally require the higher end of this range; for example, **≈3 L/m³** is a recommended minimum for flue gas SO₂ absorption. Lower L/G (closer to 0.1 L/m³) may suffice for simple cooling or coarse dust removal.  The scrubbing liquid flow must be sufficient to absorb or capture pollutants and is determined via mass balance on the pollutant.
- **Droplet Characteristics:** Spray nozzles atomize the liquid into droplets. Droplet size has a major impact on performance. Smaller droplets provide more surface area for gas–liquid contact and pollutant absorption, but if droplets are too fine, they can be carried upward by the gas flow, reducing relative velocity between droplets and particles
epa.gov
. There is an optimal droplet size range of roughly 500–1000 µm (0.5–1 mm) in diameter for counter-current spray towers. Droplets in this range are large enough to settle against the upflowing gas (avoiding excessive carryover) yet small enough to offer ample surface area. Nozzle design and liquid pressure control the droplet size: higher nozzle pressure can produce finer droplets (improving gas absorption and fine particle capture), but this increases power consumption. In practice, droplet mean diameters of ~0.6–1.0 mm (0.025–0.04 in) are common.
- **Droplet/Particle Relative Velocity:** The mechanism for particle capture in a spray tower is largely inertial impaction – particles in the gas collide with droplets. For effective impaction, droplets must have sufficient relative velocity to the particles. Larger droplets (or higher droplet fall speed) and higher gas velocity increase this relative velocity. However, gas velocity is limited by entrainment as noted. Thus, achieving good particulate collection involves a balance: using moderate droplet size and possibly multiple spray levels or auxiliary techniques (like cyclonic flow or a venturi stage) to increase relative speed. Droplet settling velocity under gravity (in still gas) can be estimated by fluid drag laws. For instance, a 0.5 mm water droplet in air has a terminal settling velocity on the order of 3–4 m/s. In an upward gas flow of 1 m/s, its net downward speed is ~2–3 m/s, giving a residence time in the tower based on the spray zone height. By contrast, a very fine droplet (e.g. 50 µm) might have a settling velocity <0.3 m/s and would be easily carried upward and out of the tower. In summary, droplet terminal velocity should exceed the gas velocity to ensure droplets fall through and exit, providing sufficient contact time.
- **Spray Zone Height (Contact Time):** The vertical distance (height) over which gas and liquid are in contact (from the highest spray nozzle down to where droplets are collected) determines the residence time for mass transfer. A taller spray chamber (or multiple spray tiers) increases contact time, allowing more pollutant removal. The required height can be calculated from kinetics or transfer unit models (described in the next section) or approximated by ensuring the gas has enough time to contact droplets before they fall out. Residence time for gas in the tower is roughly the height divided by gas velocity. For example, a 5 m tall spray zone with 1 m/s gas velocity gives ~5 s contact time. Droplet fall time should be comparable (a droplet falling 5 m at ~2 m/s takes ~2.5 s). Sufficient contact time must be provided to meet the desired cleaning efficiency
- **Pressure Drop and Energy Usage:** Spray towers are low-pressure-drop devices. The gas flows through an open chamber with minimal obstructions (aside from droplets), so typical pressure drops are only on the order of 1–10 cm H₂O (≈0.5–4 in. H₂O). A simple countercurrent spray tower often has ΔP < 2.5 cm H₂O (∼1 inch). This low resistance is advantageous for fan power, but it also indicates relatively low energy imparted for pollutant collection – which is why very fine particulate collection efficiency is lower compared to high-energy scrubbers like venturi scrubbers. If higher collection efficiency for sub-micron particles is needed, designers may increase liquid injection pressure (creating finer droplets) or opt for more energetic designs (e.g. venturi or a cyclonic spray tower). Keep in mind that higher liquid flow rates and higher nozzle pressures will increase pumping energy even if gas-side pressure drop remains low
- **Mist Elimination:** Although not a direct design calculation parameter, it’s worth noting that spray towers usually include a mist eliminator (droplet separator) at the outlet to catch any entrained droplets. Designs range from chevron louvers to centrifugal droplet separators. Ensuring the selected gas velocity and droplet size minimize load on the mist eliminator is important (per the velocity limits above). Modern designs may use a centrifugal separator that can handle higher velocities (e.g. outlet sectional velocities of 30–60 ft/s) by spinning out droplets
torch-air.com
. This can reduce maintenance issues with deposits.

## Tower Sizing: Gas Flow, Velocity and Diameter

The **tower diameter (D)** is calculated from gas flow rate and superficial velocity:

\[ D = \sqrt{\frac{4Q}{\pi u_g}} \]

Where Q is gas flow (m³/s) and u_g is superficial gas velocity (m/s). Example: Q=9 m³/s, u_g=1.5 m/s → D≈3.0 m.

If a preliminary diameter is set, one can calculate the **actual gas velocity** and check: \(u_g = \frac{4Q}{\pi D^2}\). If this exceeds the safe limit (~2.3 m/s), the diameter must be increased.

## Liquid Spray Rate and Droplet Considerations

- **Liquid Flow Rate (L):** Once a desired L/G is chosen, \(L_{vol} = L/G \times Q\). E.g. for 1 L/m³ and gas flow = 30,000 m³/h, liquid = 30,000 L/h.
- **Droplet Size:** Aim for 500–1000 µm. High-pressure nozzles (2–3 MPa) can produce <100 µm, but mist load increases.
- **Coverage:** Arrange nozzles for uniform irrigation. Use multiple tiers for tall towers.
- **Contact Time:** droplet fall time vs gas residence time must allow pollutant transfer.

## Pollutant Removal Calculations

### Gas Absorption

For dilute solute and abundant liquid:

\[ N_G = \frac{y_{in} - y_{out}}{y_{out}} \]

Number of transfer units required.

Spray zone volume:

\[ V = \frac{N_G G_m}{K_G a} \]

Correlation for KGa:

\[ K_G a = 0.1586 G_m^{0.8} L^{0.4} \]

where G_m in kmol/s, L in L/(s·m²).

Example: Removing SO₂ 4000→200 ppm required ~19 NTU, volume ~25.5 m³, height ~5 m.

### Particulate Collection

- Coarse PM (>10 µm): >90% removal.
- 2 µm: ~50% removal.
- <1 µm: negligible.

Empirical efficiency: \( \eta = 1 - e^{-N_t} \), with N_t linked to contacting power.

Spray towers are not suited for fine PM removal. Use venturi or filters for submicron control.

## Compliance with EU and US Norms

- **EU:** Industrial Emissions Directive, BREF BAT. Emission limits mg/Nm³. Pressure equipment under PED if >0.5 bar. ATEX for explosive atmospheres.
- **US:** Clean Air Act, EPA NSPS, MACT. Units: ppmvd, gr/dscf. Pressure vessels under ASME BPVC Section VIII. OSHA/NFPA codes apply.
- Both require documented design and emissions compliance. Testing under EN or EPA methods.

## Summary

Spray towers are simple low-pressure-drop scrubbers, effective for soluble gases and coarse PM. Design requires balancing gas velocity, L/G, droplet size, and residence time. Key equations: diameter sizing, NTU for absorption, droplet dynamics. Efficiency is high for gases and coarse dust, limited for fine particles. Compliance with EU/US norms is essential. This report provides formulas and guidelines suitable for integration into design software.
