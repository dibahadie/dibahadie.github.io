---
layout: notebook
is_cover: false
notebook_id: "signal-processing"
notebook_title: "Signal Processing Topics"
title: "Liljencrants-Fant (LF) glottal model"
order: 1
custom_css: notebook_layout
category: "signal processing"
---

To put it simply, the Liljencrants-Fant (LF) model is a mathematical blueprint for how human vocal cords create sound. It is one of the most famous models used in digital speech synthesis (like giving AI a realistic, human-sounding voice) and medical voice analysis.

When we speak or sing, air from our lungs pushes through our vocal folds (cords). Instead of letting the air flow out smoothly, our vocal folds vibrate, rapidly opening and snapping shut to chop the airstream into a series of rapid pulses.

The LF model is a standardized way to draw the exact shape of one of those air pulses.

The model mathematically splits the glottal pulse into two distinct continuous phases: the phase before the vocal folds snap shut, and the "return phase" immediately after. 

*   **The Opening Phase:** Three parameters—E<sub>0</sub>, ω<sub>g</sub> (where frequency is F<sub>g</sub> = ω<sub>g</sub>/2π), and an exponential growth parameter (often denoted as α)—describe the flow derivative up to the exact moment of maximum closure, known as the discontinuity point t<sub>e</sub>. 

<p align="center">E(t) = E<sub>0</sub>e<sup>αt</sup>sin(ω<sub>g</sub>t)</p>

*   **The Return Phase:** After the sudden closure at t<sub>e</sub>, the airflow does not instantly drop to zero. Instead, it enters a return phase dictated by a time constant t<sub>a</sub>. 

<p align="center">E(t) = (-E<sub>0</sub> / εt<sub>a</sub>) [e<sup>-ε(t - t<sub>e</sub>)</sup> - e<sup>-ε(t<sub>c</sub> - t<sub>e</sub>)</sup>]</p>

---

## Why the LF Model is Important


*   **Spectral Roll-off:** The return time constant t<sub>a</sub> directly controls how high frequencies fade out in a voice. In the frequency spectrum, this creates a cut-off frequency F<sub>a</sub> = (2πt<sub>a</sub>)<sup>-1</sup>. Beyond this frequency, the acoustic energy falls off at an additional rate of 6 dB per octave. 
*   **Modeling Source-Filter Interaction:** The model helps explain how the pressure building up in the vocal tract (above the vocal cords) actually pushes back down and alters the shape of the glottal flow. This means the voice source is highly dependent on the vocal tract's filter function (like the shape of your mouth and throat). 
*   **Explaining Waveform Anomalies:** It accounts for "ripple" effects, such as the occasional appearance of a double peak in the glottal flow derivative. This is not an error in measurement, but a natural consequence of the supraglottal pressure dropping and interacting with the flow.



---


## Practical Applications in Music and Sound Generation

Because the LF model accurately translates the physical biology of the human voice into controllable mathematical parameters, it is a foundational tool for audio engineers, digital instrument builders, and developers of virtual singers (like Vocaloid or AI voice models).

*   **Designing Expressive Virtual Vocalists (Breathy to Belting):** Standard synthesizers generate static, rigid waveforms that sound distinctly electronic. The LF model allows sound designers to dynamically change the "voice" by tweaking the math. For example, by adjusting the model to include a constant glottal shunt (where the digital vocal folds never fully seal), engineers can simulate "leaky phonation". This generates a realistic breathy or whispering vocal texture characterized by a noticeable residual return phase and dynamic leakage.
*   **Synthesizing Realistic High-Register Singing (Soprano Acoustics):** The model demonstrates how singers can maximize their acoustic output while minimizing air consumption, which is crucial for programming realistic vocal synths. For example, when a soprano sings with a fundamental frequency (F0) matching their vocal tract's first formant (F1), the supraglottal pressure peaks just before maximum glottal aperture. This physical interaction highly reduces the maximum rate of flow while keeping the closure sharp, creating a powerful, ringing tone. Digital instruments can replicate this exact acoustic behavior to ensure virtual choirs sound authentic in their upper ranges.
*   **Adding "Organic" Warmth to Digital Instruments (Jitter and Shimmer):** A perfectly repeating waveform sounds artificial to the human ear. The LF model shows that because of complex air pressure interactions in the vocal tract, consecutive glottal pulses naturally vary slightly in shape, peak amplitude, and duration, even if the musical pitch remains completely constant. By mapping these specific, mathematically modeled micro-variations into a synthesizer's oscillator, sound designers can inject a natural, human-like quality (often called shimmer and jitter) into digital instruments and voice patches.


## Further Reading:
* **Fant, G., Liljencrants, J., & Lin, Q-g. (1985).** *A four-parameter model of glottal flow.* Paper presented at the French-Swedish Symposium, Grenoble, France.
* **Fant, G. (1986).** *Glottal flow: models and interaction.* Journal of Phonetics, 14(3-4), 393–399.