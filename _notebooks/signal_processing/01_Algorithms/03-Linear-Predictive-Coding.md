---
layout: notebook
is_cover: false
notebook_id: "signal-processing"
notebook_title: "Signal Processing Topics"
title: "LPC: Linear Predictive Coding"
order: 3
custom_css: notebook_layout
category: "signal processing"
---

## Linear Predictive Coding: Introduction

At its core, LPC is a highly efficient way to compress and transmit human speech. Instead of recording and sending the actual audio waveform (like an MP3 or WAV file does), LPC analyzes the voice, extracts the mathematical parameters of how that voice was produced, and sends only the parameters. The receiving device then uses those parameters to artificially synthesize the voice from scratch.

LPC is built on the assumption that human speech can be modeled as a two-part mechanical system:

1. Source: In human anatomy, this is related to Vocal cords and Lungs which are modeled in DSP as an excitation signal (either a pitched periodic "buzz" or a noisy "hiss" for consonants).

2. Filter: In human anatomy, this is where throat, mouth, nasal cavity take effect. This is modeled as a time-varying digital filter that shapes the source sound by boosting specific frequencies (formants).

When you speak, your vocal cords produce a raw buzz. As that buzz travels out of your mouth, the shape of your throat and tongue filters it into distinct vowels and consonants. LPC separates these two things.

The name "Linear Predictive Coding" comes from how the algorithm calculates the filter. It assumes that the current sample of a digital audio signal can be accurately predicted as a linear combination of the previous samples.

Mathematically, the predicted sample $\hat{s}[n]$ is calculated as:

$$\hat{s}[n] = \sum_{k=1}^{p} a_k s[n-k]$$

where:
- $s[n-k]$ are the previous audio samples.
- $a_k$ are the predictor coefficients (which represent the shape of the vocal tract filter).
- $p$ is the order of the filter (how many past samples you look at).

The algorithm takes a short "frame" of audio (usually 20 to 30 milliseconds) and finds the coefficients $a_k$ that minimize the error between the prediction and the actual audio. This is done per each frame.

By abandoning the raw audio wave and only sending the mathematical "recipe" for the sound, LPC achieves staggering data compression. It can take a standard 64,000 bits/second voice signal and compress it down to just 2,400 bits/second. Because of this, LPC became the backbone of:
- Early Mobile Networks
- Secure Military Communications
- Electronic Music & Vocoders
- Retro Tech


## Finding The Coefficients

### The Derivative

We assume that the current audio sample, $s[n]$, can be approximated by a linear combination of the $p$ previous samples. The predicted sample, $\hat{s}[n]$, is defined as:

$$\hat{s}[n] = \sum_{k=1}^{p} a_k s[n-k]$$

Because the prediction is not perfect, there is a prediction error (or residual), $e[n]$, at every sample:

$$e[n] = s[n] - \hat{s}[n] = s[n] - \sum_{k=1}^{p} a_k s[n-k]$$

To find the absolute minimum of the error function $E$, we must take the partial derivative of $E$ with respect to each individual coefficient $a_i$ (where $i$ ranges from $1$ to $p$) and set it to exactly zero.

$$\frac{\partial E}{\partial a_i} = \sum_{n} 2 \left( s[n] - \sum_{k=1}^{p} a_k s[n-k] \right) (-s[n-i]) = 0$$

$$\sum_{n} \left( s[n] s[n-i] - \sum_{k=1}^{p} a_k s[n-k] s[n-i] \right) = 0$$

$$\sum_{n} s[n] s[n-i] = \sum_{n} \sum_{k=1}^{p} a_k s[n-k] s[n-i]$$

$$\sum_{n} s[n] s[n-i] = \sum_{k=1}^{p} a_k \sum_{n} s[n-k] s[n-i]$$

### The Emergence of Autocorrelation

At this point, we look at the mathematical definition of the discrete autocorrelation function, $R(m)$, which measures how a signal correlates with a delayed version of itself:

$$R(m) = \sum_{n} s[n] s[n-m]$$

Substituting the autocorrelation function $R$ back into our derivative equation yields:

$$R(i) = \sum_{k=1}^{p} a_k R(\vert{}i-k\vert{})$$

This must hold true for all $i = 1, 2, ..., p$. This forms a system of $p$ linear equations, known as the Yule-Walker equations (or the Normal equations). In matrix form, it looks like this:

$$\begin{bmatrix} R(0) & R(1) & \dots & R(p-1) \\ R(1) & R(0) & \dots & R(p-2) \\ \vdots & \vdots & \ddots & \vdots \\ R(p-1) & R(p-2) & \dots & R(0) \end{bmatrix} \begin{bmatrix} a_1 \\ a_2 \\ \vdots \\ a_p \end{bmatrix} = \begin{bmatrix} R(1) \\ R(2) \\ \vdots \\ R(p) \end{bmatrix}$$


### The Levinson-Durbin Recursion
To solve this matrix efficiently, we use the Levinson-Durbin recursion. Because the matrix is Toeplitz (the diagonals contain identical values), Levinson-Durbin builds the solution iteratively. It solves for a filter of order $m=1$, uses that to solve $m=2$, and iterates until $m=p$.

Algorithm:
- Initialization:Set the initial prediction error energy to the zero-lag autocorrelation (the total energy of the signal):

$$E_0 = R(0)$$

- The Loop: For each filter order $m = 1, 2, ..., p$, perform the following three steps:
    - Step 1: Calculate the Reflection Coefficient ($k_m$): Calculate the cross-correlation between the forward and backward prediction errors.\

    $$k_m = \frac{R(m) - \sum_{j=1}^{m-1} a_j^{(m-1)} R(m-j)}{E_{m-1}}$$
    
    (Note: $a_j^{(m-1)}$ represents the $j$-th coefficient from the previous iteration $m-1$.)

    - Step 2: Update the Predictor Coefficients: The new coefficient for the current order $m$ is simply the reflection coefficient:

    $$a_m^{(m)} = k_m$$

    For the remaining coefficients ($j = 1$ to $m-1$), update the previous iteration's coefficients by subtracting a time-reversed version of themselves scaled by $k_m$:
    
    $$a_j^{(m)} = a_j^{(m-1)} - k_m a_{m-j}^{(m-1)}$$


    - Step 3: Update the Error Energy: Calculate the new, smaller prediction error energy for the next iteration:

    $$E_m = (1 - k_m^2) E_{m-1}$$


Once the loop finishes at $m=p$, the final set of coefficients $a_j^{(p)}$ are the definitive LPC predictor coefficients required to model the vocal tract filter for that frame of audio.