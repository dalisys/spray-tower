# Designing and Calculating Spray Tower Properties for Gas Cleaning

 Units are given in SI (primary) with common US equivalents in parentheses.

---

## Overview

Spray tower scrubbers (spray chambers) are simple, robust gas‑cleaning devices that contact a contaminated gas with a scrubbing liquid dispersed as droplets. This guide summarizes design principles, practical ranges, and the governing equations needed to size a spray tower and estimate performance for real industrial use. It is written to be directly translatable into software.

---

## Symbols and Units

- \( Q \) — gas volumetric flow rate, **m³/s** (or ACFM)  
- \( u_g \) — superficial gas velocity in tower, **m/s** (ft/s)  
- \( D \) — tower internal diameter, **m** (ft)  
- \( A \) — tower cross‑sectional area, \(A=\tfrac{\pi D^2}{4}\), **m²**  
- \( L \) — total scrubbing liquid flow rate, **m³/s** (or L/s; GPM)  
- \( L/G \) — liquid‑to‑gas ratio (e.g., **L per m³ gas**; or **gal per 1000 ft³**)  
- \( d_d \) — characteristic droplet diameter, **m** (μm)  
- \( v_d \) — droplet terminal fall velocity relative to still gas, **m/s**  
- \( v_{\text{rel}} \) — droplet–gas relative velocity in counter‑current flow, **m/s**  
- \( H \) — effective spray (contact) height, **m**  
- \( \Delta P \) — gas‑side pressure drop, **Pa** (in. H₂O)  
- \( y_1, y_2 \) — inlet/outlet pollutant mole fraction in gas phase, **–**  
- \( N_G \) — number of gas‑phase transfer units (absorption), **–**  
- \( G_m \) — molar gas flow rate (at operating conditions), **kmol/s**  
- \( K_G a \) — overall gas‑phase volumetric mass‑transfer coefficient, **s⁻¹**  
- \( \eta \) — particulate collection efficiency, **–**

---

## 1) Key design choices & typical ranges

- **Gas velocity \(u_g\):** Choose low enough to avoid liquid carryover while maintaining reasonable size.  
  Typical for counter‑current spray towers: **0.3–1.2 m/s** (~1–4 ft/s). Values above ~**2.3 m/s** (~7.5 ft/s) risk entrainment.

- **L/G ratio:** Depends on duty. As rough guides:  
  - Cooling / odor control / coarse dust: **0.1–0.5 L per m³** gas (≈ **0.7–3.5 gal per 1000 ft³**)  
  - Gas absorption (e.g., acidic gases): **≥ 3 L per m³** gas (≈ **22–25 gal per 1000 ft³**)

- **Droplet size \(d_d\):** Balance surface area vs. carryover. Practical optimum for counter‑current towers: **0.5–1.0 mm** mean droplet size. Very fine sprays (<100 μm) raise energy, mist load, and eliminator burden.

- **Pressure drop \( \Delta P \):** Low compared to high‑energy scrubbers. Often **1–10 cm H₂O** (~**0.4–4 in. H₂O**); many simple towers operate near **~1 in. H₂O**.

- **Mist elimination:** Required (chevrons or centrifugal). Keep \(u_g\) within limits to avoid overloading the eliminator.

---

## 2) Tower sizing from gas flow

Choose a design superficial gas velocity \(u_g\) and compute diameter:
\[
A \;=\; \frac{Q}{u_g},\qquad
D \;=\; \sqrt{\frac{4A}{\pi}} \;=\; \sqrt{\frac{4Q}{\pi\,u_g}}\;.
\]

**Check:** With candidate \(D\), verify
\[
u_g \;=\; \frac{4Q}{\pi D^2}
\]
is safely below entrainment limits. For large \(Q\), the diameter can be substantial—this is a known trade‑off with the low‑energy nature of spray towers.

> **Example (diameter):** \(Q=9 \text{ m³/s}\), choose \(u_g=1.5 \text{ m/s}\).  
> \(D=\sqrt{4\cdot9 / (\pi\cdot1.5)}\approx 3.0 \text{ m}\).

---

## 3) Liquid rate and droplet considerations

### 3.1 Liquid flow from L/G
\[
L \;=\; (L/G)\,\times\,Q
\]
Convert units consistently (e.g., L/m³ with \(Q\) in m³/h → \(L\) in L/h).

### 3.2 Droplet sizing (nozzles)
Select nozzle type/pressure to target **0.5–1.0 mm** Sauter mean droplet diameter for counter‑current towers. Finer sprays can improve mass transfer and small‑particle capture but increase pumping power and mist load.

### 3.3 Relative velocity and contact time
For counter‑current flow, a droplet falling through upflowing gas has effective relative speed
\[
v_{\text{rel}} \;\approx\; v_d \;-\; u_g\qquad (v_d>u_g\ \text{for fallout}).
\]
Then the **droplet contact time** across a spray zone of height \(H\) is
\[
t_c \;\approx\; \frac{H}{v_{\text{rel}}}\,.
\]

> **Back‑of‑envelope:** A \(0.5\) mm water droplet has \(v_d \sim 3{-}4\) m/s in air. With \(u_g=1\) m/s, \(v_{\text{rel}}\sim 2{-}3\) m/s. For \(H=5\) m, \(t_c \sim 2{-}2.5\) s. Gas residence time is \(H/u_g\) (~5 s at 1 m/s).

---

## 4) Performance calculations

### 4.1 Gas absorption (soluble gases)

For dilute absorption with ample liquid capacity (i.e., gas‑phase control), the **required number of gas‑phase transfer units** is well approximated by
\[
N_G \;\approx\; \ln\!\left(\frac{y_1}{y_2}\right).
\]

Given a volumetric mass‑transfer rate \(K_G a\) (s⁻¹), the **required spray‑zone volume** is
\[
V \;=\; \frac{G_m\,N_G}{K_G a}\,,
\]
and the **spray height** follows from \(V=A\,H \Rightarrow H=\tfrac{V}{A}\).

A useful empirical trend (for typical spray contacting under turbulent conditions) is that \(K_G a\) increases with gas and liquid rates. One commonly used form is
\[
K_G a \;\propto\; G_m^{\,0.8}\;L^{\,0.4}\,,
\]
with a constant of proportionality chosen to match the system, chemistry, and units. In practice, obtain \(K_G a\) from vendor data, pilot tests, or trusted correlations for the specific gas–liquid pair and nozzle setup.

> **Example (SO₂ polishing):** Target 95% removal from \(y_1=4000\) ppm to \(y_2=200\) ppm → \(N_G=\ln(4000/200)=\ln(20)\approx 3.0\).  
> With known \(G_m\) and estimated \(K_G a\), compute \(V\), then \(H=V/A\). If \(H\) is excessive, increase L/G, add spray tiers, or consider packing for a polishing section.

**Notes.** If the liquid side is rate‑limiting or approaches equilibrium loading, use the two‑resistance model with both gas‑ and liquid‑phase transfer units (and the absorption factor \(A\)).

### 4.2 Particulate (dust) collection

Spray towers capture particles mainly by **inertial impaction** onto droplets. Expected behavior:
- Efficient for **coarse PM** (e.g., \(d_p \gtrsim 10\) μm).  
- Limited for **fine PM** (e.g., \(d_p \lesssim 2{-}5\) μm) unless very fine sprays and high liquid rates are used.

A convenient first‑order model uses “collection units” in analogy to transfer units:
\[
\eta \;=\; 1 - \exp(-N_t)\,,
\]
where \(N_t\) increases with contacting intensity (droplet loading, relative velocity, residence) and, empirically, with energy input. Designers sometimes refer to a **cut size** \(d_{50}\) (size at \(\eta\approx 50\%\)); counter‑current towers often have \(d_{50}\sim 5{-}10\) μm under typical conditions.

If stringent fine‑PM control is required, consider **enhancements** (e.g., cyclonic spray contact, venturi pre‑scrubber) or **downstream polishing** (filters).

---

## 5) Pressure drop and energy

Open geometry yields low gas‑side \(\Delta P\) (often **~1 in. H₂O**). Energy use is dominated by **liquid pumping** and, when using fine sprays, **nozzle pressure**. Increasing L/G and reducing \(d_d\) boosts performance but raises energy and mist eliminator duty.

---

## 6) Mist elimination

Provide chevron or centrifugal separators sized to outlet area velocity limits. Keep carryover low by respecting tower \(u_g\) limits and avoiding excessively fine sprays unless the eliminator is designed for them.

---

## 7) Compliance notes (EU & US)

- **Emission targets.** Design to meet plant‑specific limits (e.g., under EU IED/BAT or US EPA NSPS/NESHAP). Convert predicted outlet concentrations to mg/Nm³ (or ppmvd) as required and add a safety margin.
- **Mechanical codes.** Atmospheric towers may fall outside pressure‑vessel codes; otherwise consider **ASME BPVC Sec. VIII** (US) or **EU PED**. Piping to **ASME B31.\*** or EN equivalents; materials to **ASTM/EN**.
- **ATEX/OSHA/NFPA.** For toxic/flammable service, ensure appropriate hazardous‑area classification, venting, and safeguards.
- **Validation.** Ensure stack‑testing and monitoring provisions match local standards (EN methods vs. US EPA methods).

---

## 8) Step‑by‑step sizing workflow (software‑ready)

1. **Inputs:** \(Q\), gas T/P (for \(G_m\)), target pollutant(s), required removal, candidate \(u_g\), candidate \(L/G\), droplet target \(d_d\).  
2. **Diameter:** \(D=\sqrt{4Q/(\pi u_g)}\); compute \(A\). Verify \(u_g\) vs. entrainment guidance.  
3. **Liquid flow:** \(L=(L/G)\,Q\); select nozzles to achieve \(d_d\) and coverage (tiers).  
4. **Residence:** choose \(H\) prelim.; estimate \(v_{\text{rel}}\approx v_d-u_g\) → \(t_c=H/v_{\text{rel}}\).  
5. **Absorption check:** compute \(N_G=\ln(y_1/y_2)\); pick/estimate \(K_G a\) → \(V=G_m N_G/(K_G a)\) → \(H=V/A\). Iterate \(H\), \(L/G\), nozzle plan.  
6. **Particulate check:** verify expected \(\eta(d_p)\) vs. spec; add stages/finer sprays/auxiliary units if needed.  
7. **Pressure drop & energy:** estimate \(\Delta P\) (gas) and pump/nozzle power; confirm with utilities.  
8. **Mist eliminator:** size and select; check outlet area velocity.  
9. **Compliance & materials:** verify codes, emissions, corrosion allowance, instrumentation.  
10. **Output:** \(D, H, L, \Delta P, \eta\) estimates, BOM for sprays/eliminator, operating windows.

---

## References & notes

This synthesis captures the standard design logic for spray towers and the equations most commonly implemented in practice (diameter from \(Q/u_g\); \(L/G\) scaling; NTU approach for absorption; first‑order capture model for PM; residence/velocity heuristics). In detailed projects, replace the generic \(K_G a\) trend with system‑specific correlations or pilot data, and validate against regulatory test methods.
