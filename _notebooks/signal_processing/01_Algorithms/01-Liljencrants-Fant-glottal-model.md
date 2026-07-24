---
layout: notebook
is_cover: false
notebook_id: "signal-processing"
notebook_title: "Signal Processing Topics"
title: "Alignment Algorithms"
order: 1
custom_css: notebook_layout
category: "signal processing"
---

# Deep Dive: Dynamic Time Warping (DTW) and the Viterbi Algorithm

This note is on two foundational algorithms in sequence processing and signal analysis: **Dynamic Time Warping (DTW)** and the **Viterbi Algorithm**. Both algorithms utilize **Dynamic Programming (DP)** to solve complex sequence alignment and state-estimation problems efficiently, but they do so under fundamentally different paradigms.

---

## Table of Contents
1. [Introduction & Context](#1-introduction--context)
2. [Dynamic Time Warping (DTW)](#2-dynamic-time-warping-dtw)
   - [The Core Problem](#the-core-problem)
   - [Key Constraints](#key-constraints)
   - [Mathematical Formulation](#mathematical-formulation)
   - [Algorithm Step-by-Step](#algorithm-step-by-step)
   - [Python Implementation](#python-implementation)
   - [Complexity & Optimizations](#complexity--optimizations)
   - [Applications](#applications)
3. [The Viterbi Algorithm](#3-the-viterbi-algorithm)
   - [The Core Problem & HMMs](#the-core-problem--hmms)
   - [Hidden Markov Model Essentials](#hidden-markov-model-essentials)
   - [Mathematical Formulation](#mathematical-formulation-1)
   - [Log-Space Transformation](#log-space-transformation)
   - [Python Implementation](#python-implementation-1)
   - [Complexity & Analysis](#complexity--analysis)
   - [Applications](#applications-1)
4. [Comparative Analysis: DTW vs. Viterbi](#4-comparative-analysis-dtw-vs-viterbi)
5. [Summary & Key Takeaways](#5-summary--key-takeaways)

---

## 1. Introduction & Context

When working with sequential data—such as time series, audio waveforms, DNA strands, or natural language—standard element-wise comparisons (like Euclidean distance) often fail. This happens because sequence length can vary, speeds can change, or the underlying generation process is stochastic.

To handle these challenges, computer scientists developed dynamic programming algorithms:
- **Dynamic Time Warping (DTW)**: A non-parametric, deterministic technique for measuring similarity between two temporal sequences that may vary in speed or phase.
- **Viterbi Algorithm**: A probabilistic, model-based algorithm used to find the single most likely sequence of hidden states (the *Viterbi path*) in a Hidden Markov Model (HMM) given an observed sequence.

---

## 2. Dynamic Time Warping (DTW)

### The Core Problem

Imagine comparing two audio recordings of the same person saying the word *"algorithm"*:
- Recording A: The speaker says it quickly (0.8 seconds).
- Recording B: The speaker stretches out the vowels (1.5 seconds).

If you align these audio signals index-by-index ($t_1$ to $t_1$, $t_2$ to $t_2$), the feature frames will be misaligned, producing a huge Euclidean distance even though the words are identical. **DTW warps the time axis non-linearly** to achieve optimal alignment between two sequences.

```
Sequence X:  x_1 --- x_2 --- x_3 --- x_4 --- x_5
               \      |      /        |      |
                \     |     /         |      |
Sequence Y:      y_1 --- y_2 ------- y_3 --- y_4
```

### Key Constraints

To prevent absurd warps (e.g., mapping everything to a single point or going backward in time), DTW imposes strict constraints on the **Warping Path** $W = (w_1, w_2, \dots, w_K)$, where $w_k = (i, j)$ pairs the $i$-th element of sequence $X$ with the $j$-th element of sequence $Y$:

1. **Boundary Condition**: The path must start at $(1, 1)$ and end at $(N, M)$.
   $$w_1 = (1, 1) \quad \text{and} \quad w_K = (N, M)$$
2. **Monotonicity Condition**: The path cannot step backward in time.
   $$\text{If } w_k = (i, j) \text{ and } w_{k+1} = (i', j'), \text{ then } i' \ge i \text{ and } j' \ge j$$
3. **Continuity (Step-size) Condition**: The path can only advance by at most one step at a time (no skipping elements).
   $$i' - i \le 1 \quad \text{and} \quad j' - j \le 1$$

Together, these mean from cell $(i, j)$, you can only move to $(i+1, j)$, $(i, j+1)$, or $(i+1, j+1)$.

---

### Mathematical Formulation

Let $X = (x_1, x_2, \dots, x_N)$ and $Y = (y_1, y_2, \dots, y_M)$ be two time series.

1. **Local Cost Matrix $d(i, j)$**:
   Usually computed as the squared Euclidean distance or absolute difference:
   $$d(i, j) = |x_i - y_j| \quad \text{or} \quad (x_i - y_j)^2$$

2. **Accumulated Cost Matrix $D(i, j)$**:
   The minimum cumulative distance to align $X[1..i]$ with $Y[1..j]$ is defined recursively:
   $$D(i, j) = d(i, j) + \min \begin{cases} D(i-1, j) & \text{(Insertion / Vertical)} \\ D(i, j-1) & \text{(Deletion / Horizontal)} \\ D(i-1, j-1) & \text{(Match / Diagonal)} \end{cases}$$

---

### Algorithm Step-by-Step

1. **Initialize** an $(N+1) \times (M+1)$ matrix $D$ with $\infty$. Set $D(0, 0) = 0$.
2. **Fill Matrix**: Iterate $i$ from 1 to $N$ and $j$ from 1 to $M$, applying the recurrence relation.
3. **DTW Distance**: The overall DTW distance is $D(N, M)$.
4. **Backtracking**: Start at $(N, M)$ and follow the minimum neighbor back to $(1, 1)$ to construct the optimal alignment path.


---

### Complexity & Optimizations

- **Standard Time Complexity**: $\mathcal{O}(N \times M)$
- **Standard Space Complexity**: $\mathcal{O}(N \times M)$ (or $\mathcal{O}(\min(N, M))$ if only calculating distance without path recovery).

#### Common Optimizations:
- **Sakoe-Chiba Band**: Restricts search to a diagonal window of width $R$, reducing complexity to $\mathcal{O}(N \cdot R)$.
- **Itakura Parallelogram**: Enforces slope constraints to limit time warping extremes.
- **FastDTW**: Multiscale approach that downsamples sequences, computes path at coarse scale, and refines it at high resolution ($\mathcal{O}(N)$ complexity).

---

### Applications
- **Speech Recognition**: Matching spoken words across varying tempos.
- **Biometrics**: Signature verification and ECG waveform comparison.
- **Financial Analytics**: Finding historical pattern similarities across stock charts.
- **Human Activity Recognition**: Analyzing accelerometer/gyroscope signals from wearables.

---

## 3. The Viterbi Algorithm

### The Core Problem & HMMs

While DTW operates directly on raw geometric or numerical distances between two observed sequences, the **Viterbi Algorithm** operates in a **probabilistic model framework**.

Specifically, given:
1. An observed sequence $O = (o_1, o_2, \dots, o_T)$.
2. An underlying **Hidden Markov Model (HMM)**.

**Goal**: Find the single most probable sequence of hidden states $S = (s_1, s_2, \dots, s_T)$ that generated the observations $O$.

$$\hat{S} = \arg\max_S P(S \mid O, \lambda)$$

---

### Hidden Markov Model Essentials

An HMM is defined by the parameter tuple $\lambda = (A, B, \pi)$:
- **State Space $Q = \{q_1, q_2, \dots, q_K\}$**: The hidden states.
- **Transition Matrix $A$ ($K \times K$)**: $A_{ij} = P(s_{t+1} = q_j \mid s_t = q_i)$ (prob. of moving from state $i$ to $j$).
- **Emission Matrix $B$ ($K \times V$)**: $B_{j}(o_t) = P(o_t \mid s_t = q_j)$ (prob. of emitting observation $o_t$ from state $j$).
- **Initial State Distribution $\pi$ ($K \times 1$)**: $\pi_i = P(s_1 = q_i)$.

---

### Mathematical Formulation

The Viterbi variable $V_{t, k}$ represents the probability of the most likely hidden state sequence that accounts for the first $t$ observations and ends in state $q_k$:

$$V_{t, k} = \max_{s_1, \dots, s_{t-1}} P(s_1, \dots, s_{t-1}, s_t = q_k, o_1, \dots, o_t \mid \lambda)$$

#### Recurrence Relation:
1. **Initialization** ($t = 1$):
   $$V_{1, k} = \pi_k \cdot B_k(o_1) \quad \forall k \in \{1, \dots, K\}$$
   $$\text{Backpointer: } \psi_{1, k} = 0$$

2. **Recursion** ($t = 2 \dots T$):
   $$V_{t, k} = \left( \max_{j=1}^K V_{t-1, j} \cdot A_{jk} \right) \cdot B_k(o_t)$$
   $$\psi_{t, k} = \arg\max_{j=1}^K \left( V_{t-1, j} \cdot A_{jk} \right)$$

3. **Termination**:
   $$P^* = \max_{k=1}^K V_{T, k}$$
   $$s_T^* = \arg\max_{k=1}^K V_{T, k}$$

4. **Backtracking**:
   $$s_t^* = \psi_{t+1, s_{t+1}^*} \quad \text{for } t = T-1, T-2, \dots, 1$$

---

### Log-Space Transformation

Multiplying small probabilities over long time horizons $T$ causes severe **numerical underflow** (floating-point numbers round to zero).

In practice, we convert probabilities to log-space:
$$\log V_{t, k} = \max_{j} \left( \log V_{t-1, j} + \log A_{jk} \right) + \log B_k(o_t)$$

This turns multiplications into additions, ensuring numerical stability.

---

### Complexity & Analysis

- **Time Complexity**: $\mathcal{O}(T \cdot K^2)$ where $T$ is sequence length and $K$ is the number of hidden states.
- **Space Complexity**: $\mathcal{O}(T \cdot K)$ to store the trellis table and backpointers.

---

### Applications
- **Natural Language Processing**: Part-of-Speech (POS) tagging, Named Entity Recognition (NER).
- **Bioinformatics**: Gene prediction and DNA sequence alignment using Profile HMMs.
- **Speech Recognition**: Acoustic modeling for phone sequence decoding.
- **Telecommunications**: Decoding convolutional codes in noisy channels (Viterbi Decoder).

---

## 4. Comparative Analysis: DTW vs. Viterbi

| Aspect | Dynamic Time Warping (DTW) | Viterbi Algorithm |
| :--- | :--- | :--- |
| **Primary Goal** | Align two continuous/discrete time-series | Find optimal hidden sequence in probabilistic model |
| **Framework** | Non-parametric, Deterministic Geometric Alignment | Parametric, Probabilistic (Bayesian / Hidden Markov) |
| **Input** | Two raw sequences $X$ and $Y$ | Observations $O$ + HMM parameters $(A, B, \pi)$ |
| **Output** | Minimum Alignment Distance & Warping Path | Maximum Likelihood Path of Hidden States |
| **Mathematical Basis** | Dynamic Programming via distance/cost metrics | Dynamic Programming via joint probability maximization |
| **Handling Time** | Warps time axis directly (non-linear stretch/compress) | Encodes time implicit in state transition probabilities |
| **Computational Complexity** | $\mathcal{O}(N \cdot M)$ | $\mathcal{O}(T \cdot K^2)$ |
| **Typical Domain** | Time-series, Bio-signals, Gesture Recognition | NLP, Speech Decoding, Genomics, Channel Coding |

---

## 5. Summary & Key Takeaways

1. **Both algorithms leverage Dynamic Programming** to eliminate the exponential search space inherent in combinatorial sequence analysis.
2. **Use DTW when** you have two explicit time-series sequences and want to measure distance or stretch/compress one onto the other without needing statistical training data.
3. **Use Viterbi when** you have a statistical model of hidden states emitting observations, and you want to infer the most probable underlying process that created those observations.
