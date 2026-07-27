---
layout: notebook
is_cover: false
notebook_id: "signal-processing"
notebook_title: "Signal Processing Topics"
title: "DAP: Discrete All-Pole Modeling"
order: 1
custom_css: notebook_layout
category: "signal processing"
---

### DAP: Discrete All-Pole Modeling: Introduction

If you have ever tried to analyze a high-pitched voice using standard Linear Predictive Coding (LPC), you have probably run into its biggest flaw: the model gets heavily distorted.

This happens because LPC has a mathematical blind spot. Its underlying equations force it to analyze the entire frequency spectrum as if it were a solid, continuous block of sound. But pitched human speech isn't solid—it looks like a sparse row of sharp harmonic spikes separated by wide gaps of dead silence. Because standard LPC is forced to measure everything, it awkwardly tries to map that empty space, pulling and warping the digital model down into the silent gaps.

Discrete All-Pole (DAP) modeling was invented to fix exactly this. Instead of blindly measuring the whole spectrum, DAP changes the rules so the algorithm only looks at the exact tips of those harmonic spikes. By completely ignoring the empty, silent space in between, DAP stops the model from warping. The result is a perfectly smooth, highly accurate map of the vocal tract, no matter how high the speaker's pitch goes.

### Itakura-Saito Distance

DAP needs a way to calculate "error" at those specific harmonic frequencies. Instead of using standard subtraction (Mean Squared Error), it uses a formula uniquely suited for human hearing: the Itakura-Saito (IS) distance.

For a specific harmonic peak $P$ and our model's guess $\hat{P}$, the error is calculated as:

$$d_{IS}(P, \hat{P}) = \frac{P}{\hat{P}} - \ln\left(\frac{P}{\hat{P}}\right) - 1$$

- Missing a peak is heavily punished: If the real voice is loud at that harmonic, but our model dips too low, the ratio explodes into a massive number. The algorithm immediately course-corrects to push the model up.
- Missing a valley is forgiven: If the model stays high while the real audio dips, the ratio becomes a tiny fraction. Thanks to the natural logarithm, the math applies almost no penalty.

When you sum this up across all the discrete harmonics $N$, you get the ultimate DAP error equation:

$$E_{DAP} = \frac{1}{N} \sum_{k=1}^{N} \left( \frac{P(\omega_k)}{\hat{P}(\omega_k)} - \ln\left(\frac{P(\omega_k)}{\hat{P}(\omega_k)}\right) - 1 \right)$$

### Computational Catch

To find the predictor coefficients that minimize this error, we have to take the derivative of $E_{DAP}$ with respect to the coefficients and set it to zero.Here is where DAP gets difficult: because we are using a discrete sum involving a logarithm, the derivative does not cleanly resolve into a simple set of linear equations (the Yule-Walker equations we saw in standard LPC).

The Trade-off: DAP generates an incredibly accurate, pitch-independent map of the vocal tract. However, because it requires an iterative loop instead of a single, straight-line calculation, it is significantly more computationally expensive than standard LPC.