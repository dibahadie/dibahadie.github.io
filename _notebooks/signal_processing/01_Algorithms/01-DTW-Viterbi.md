---
layout: notebook
is_cover: false
notebook_id: "signal-processing"
notebook_title: "Signal Processing Topics"
title: "Foundational Sequence Alignment & Hidden State Algorithms"
order: 1
custom_css: notebook_layout
category: "signal processing"
---

# Deep Dive: Sequence Alignment, State Decoding, and Dynamic Programming

Welcome to this technical guide on foundational algorithms in sequence processing, pattern matching, and signal analysis: **Dynamic Time Warping (DTW)**, the **Viterbi Algorithm**, **Needleman-Wunsch**, **Smith-Waterman**, and **Baum-Welch**. 

These algorithms form the backbone of modern temporal signal analysis, bioinformatics, and probabilistic sequence processing. While they rely heavily on **Dynamic Programming (DP)** and graph search to eliminate combinatorial complexity, they operate under fundamentally different paradigms.

---

## Table of Contents
1. [Introduction & Context](#1-introduction--context)
2. [Dynamic Time Warping (DTW)](#2-dynamic-time-warping-dtw)
   - [The Core Problem](#the-core-problem)
   - [Key Constraints](#key-constraints)
   - [Mathematical Formulation](#mathematical-formulation)
   - [Algorithm Step-by-Step](#algorithm-step-by-step)
   - [Complexity & Optimizations](#complexity--optimizations)
   - [Applications](#applications)
3. [The Viterbi Algorithm](#3-the-viterbi-algorithm)
   - [The Core Problem & HMMs](#the-core-problem--hmms)
   - [Hidden Markov Model Essentials](#hidden-markov-model-essentials)
   - [Mathematical Formulation](#mathematical-formulation-1)
   - [Log-Space Transformation](#log-space-transformation)
   - [Complexity & Analysis](#complexity--analysis)
   - [Applications](#applications-1)
4. [Additional Foundational Algorithms](#4-additional-foundational-algorithms)
   - [Needleman-Wunsch Algorithm (Global Discrete Alignment)](#a-needleman-wunsch-algorithm-global-discrete-alignment)
   - [Smith-Waterman Algorithm (Local Subsegment Alignment)](#b-smith-waterman-algorithm-local-subsegment-alignment)
   - [Baum-Welch Algorithm (HMM Parameter Learning)](#c-baum-welch-algorithm-hmm-parameter-learning)
5. [Comparative Analysis](#5-comparative-analysis)
6. [Summary & Key Takeaways](#6-summary--key-takeaways)

---

## 1. Introduction & Context

When working with sequential data—such as time series, audio waveforms, DNA strands, or natural language—standard element-wise comparisons (like Euclidean distance or index-by-index equality) often fail. This happens because sequence length can vary, speed/tempo can fluctuate non-linearly, or the underlying generation process is stochastic.

To address these challenges, sequence processing algorithms split into two main paradigms:
* **Deterministic / Non-Parametric Approaches**: Measure direct spatial or geometric similarities between explicit series (e.g., DTW, Needleman-Wunsch, Smith-Waterman).
* **Probabilistic / Model-Based Approaches**: Model hidden underlying processes that generate observable events (e.g., Viterbi, Baum-Welch).

---

## 2. Dynamic Time Warping (DTW)

### The Core Problem

Imagine comparing two audio recordings of the same person saying the word *"algorithm"*:
* **Recording A**: The speaker says it quickly (0.8 seconds).
* **Recording B**: The speaker stretches out the vowels (1.5 seconds).

If you align these audio signals index-by-index (*t*<sub>1</sub> to *t*<sub>1</sub>, *t*<sub>2</sub> to *t*<sub>2</sub>), the feature frames will be severely misaligned, producing a massive Euclidean distance even though the underlying words are identical. **DTW warps the time axis non-linearly** to achieve optimal alignment between two sequences.

```
Sequence X:  x_1 --- x_2 --- x_3 --- x_4 --- x_5
               \      |      /        |      |
                \     |     /         |      |
Sequence Y:      y_1 --- y_2 ------- y_3 --- y_4
```

### Key Constraints

To prevent absurd alignments (e.g., mapping all points to a single index or stepping backward in time), DTW imposes strict constraints on the **Warping Path** *W* = (*w*<sub>1</sub>, *w*<sub>2</sub>, ..., *w*<sub>K</sub>), where *w*<sub>k</sub> = (*i*, *j*) pairs the *i*-th element of sequence *X* with the *j*-th element of sequence *Y*:

1. **Boundary Condition**: The path must start at (1, 1) and end at (*N*, *M*).
<div class="math-display">
$$w_1 = (1, 1) \quad \text{and} \quad w_K = (N, M)$$
</div>

2. **Monotonicity Condition**: The path cannot step backward in time.
<div class="math-display">
$$\text{If } w_k = (i, j) \text{ and } w_{k+1} = (i', j'), \text{ then } i' \ge i \text{ and } j' \ge j$$
</div>

3. **Continuity (Step-size) Condition**: The path can only advance by at most one step at a time (no skipping elements).
<div class="math-display">
$$i' - i \le 1 \quad \text{and} \quad j' - j \le 1$$
</div>

Together, these constraints ensure that from cell (*i*, *j*), you can only transition to (*i*+1, *j*), (*i*, *j*+1), or (*i*+1, *j*+1).

---

### Mathematical Formulation

Let *X* = (*x*<sub>1</sub>, *x*<sub>2</sub>, ..., *x*<sub>N</sub>) and *Y* = (*y*<sub>1</sub>, *y*<sub>2</sub>, ..., *y*<sub>M</sub>) be two temporal sequences.

1. **Local Cost Matrix *d*(*i*, *j*)**:
   Measures the point-to-point distance between elements (e.g., absolute difference or squared Euclidean distance):
<div class="math-display">
$$d(i, j) = |x_i - y_j| \quad \text{or} \quad (x_i - y_j)^2$$
</div>

2. **Accumulated Cost Matrix *D*(*i*, *j*)**:
   The minimum cumulative distance to align prefix *X*[1..*i*] with prefix *Y*[1..*j*] is defined recursively:
<div class="math-display">
$$D(i, j) = d(i, j) + \min \begin{cases} D(i-1, j) & \text{(Insertion / Vertical)} \\ D(i, j-1) & \text{(Deletion / Horizontal)} \\ D(i-1, j-1) & \text{(Match / Diagonal)} \end{cases}$$
</div>

---

### Algorithm Step-by-Step

1. **Initialize**: Create an (*N*+1) &times; (*M*+1) matrix *D* initialized to infinity. Set *D*(0, 0) = 0.
2. **Fill Matrix**: Iterate *i* from 1 to *N* and *j* from 1 to *M*, filling cells using the recurrence relation.
3. **DTW Distance**: The total optimal alignment distance is given by *D*(*N*, *M*).
4. **Backtracking**: Trace back from (*N*, *M*) to (1, 1) by stepping to the minimum neighboring cell at each step to reconstruct the warping path.

---

### Complexity & Optimizations

* **Standard Time Complexity**: O(*N* &times; *M*)
* **Standard Space Complexity**: O(*N* &times; *M*) (or O(min(*N*, *M*)) if calculating only the total distance without path recovery).

#### Common Optimizations
* **Sakoe-Chiba Band**: Restricts search to a diagonal window of width *R*, reducing time complexity to O(*N* &middot; *R*).
* **Itakura Parallelogram**: Enforces strict slope constraints to limit excessive warping at sequence boundaries.
* **FastDTW**: A multiscale coarsening algorithm that downsamples sequences, estimates alignment at coarse resolution, and refines it locally, achieving O(*N*) complexity.

---

### Applications
* **Speech Recognition**: Matching spoken audio against reference templates.
* **Biometrics**: Online signature verification and ECG signal analysis.
* **Financial Analytics**: Identifying similar historical price movements.
* **Human Activity Recognition**: Comparing motion streams from wearable sensors.

---

## 3. The Viterbi Algorithm

### The Core Problem & HMMs

While DTW works on raw geometric or numerical distances between two observed sequences, the **Viterbi Algorithm** operates within a **probabilistic model framework**.

Given:
1. An observed sequence *O* = (*o*<sub>1</sub>, *o*<sub>2</sub>, ..., *o*<sub>T</sub>).
2. An underlying **Hidden Markov Model (HMM)** with known parameters &lambda;.

**Goal**: Find the single most likely sequence of hidden states *S* = (*s*<sub>1</sub>, *s*<sub>2</sub>, ..., *s*<sub>T</sub>) that generated observations *O*.

<div class="math-display">
$$\hat{S} = \arg\max_S P(S \mid O, \lambda)$$
</div>

---

### Hidden Markov Model Essentials

An HMM is defined by the parameter tuple &lambda; = (*A*, *B*, &pi;):
* **State Space *Q* = {*q*<sub>1</sub>, *q*<sub>2</sub>, ..., *q*<sub>K</sub>}**: The set of hidden states.
* **Transition Matrix *A* (*K* &times; *K*)**: *A*<sub>ij</sub> = *P*(*s*<sub>t+1</sub> = *q*<sub>j</sub> | *s*<sub>t</sub> = *q*<sub>i</sub>) (probability of transitioning from state *i* to state *j*).
* **Emission Matrix *B* (*K* &times; *V*)**: *B*<sub>j</sub>(*o*<sub>t</sub>) = *P*(*o*<sub>t</sub> | *s*<sub>t</sub> = *q*<sub>j</sub>) (probability of state *j* emitting observation *o*<sub>t</sub>).
* **Initial State Distribution &pi; (*K* &times; 1)**: &pi;<sub>i</sub> = *P*(*s*<sub>1</sub> = *q*<sub>i</sub>).

---

### Mathematical Formulation

The Viterbi variable *V*<sub>t, k</sub> represents the probability of the most likely hidden state path accounting for the first *t* observations and ending in state *q*<sub>k</sub>:

<div class="math-display">
$$V_{t, k} = \max_{s_1, \dots, s_{t-1}} P(s_1, \dots, s_{t-1}, s_t = q_k, o_1, \dots, o_t \mid \lambda)$$
</div>

#### Recurrence Relation
1. **Initialization** (*t* = 1):
<div class="math-display">
$$V_{1, k} = \pi_k \cdot B_k(o_1) \quad \forall k \in \{1, \dots, K\}$$
</div>
<div class="math-display">
$$\text{Backpointer: } \psi_{1, k} = 0$$
</div>

2. **Recursion** (*t* = 2 ... *T*):
<div class="math-display">
$$V_{t, k} = \left( \max_{j=1}^K V_{t-1, j} \cdot A_{jk} \right) \cdot B_k(o_t)$$
</div>
<div class="math-display">
$$\psi_{t, k} = \arg\max_{j=1}^K \left( V_{t-1, j} \cdot A_{jk} \right)$$
</div>

3. **Termination**:
<div class="math-display">
$$P^* = \max_{k=1}^K V_{T, k}$$
</div>
<div class="math-display">
$$s_T^* = \arg\max_{k=1}^K V_{T, k}$$
</div>

4. **Backtracking**:
<div class="math-display">
$$s_t^* = \psi_{t+1, s_{t+1}^*} \quad \text{for } t = T-1, T-2, \dots, 1$$
</div>

---

### Log-Space Transformation

Multiplying probabilities across long sequence lengths *T* results in floating-point **numerical underflow** (values rounding down to zero). 

To prevent this, implementations convert probabilities into log-space:

<div class="math-display">
$$\log V_{t, k} = \max_{j} \left( \log V_{t-1, j} + \log A_{jk} \right) + \log B_k(o_t)$$
</div>

This transforms multiplications into additions, ensuring numerical stability.

---

### Complexity & Analysis

* **Time Complexity**: O(*T* &middot; *K*<sup>2</sup>), where *T* is the sequence length and *K* is the number of hidden states.
* **Space Complexity**: O(*T* &middot; *K*) to store the trellis values and backpointer indices.

---

### Applications
* **Natural Language Processing**: Part-of-Speech (POS) tagging and Named Entity Recognition (NER).
* **Bioinformatics**: Gene finding and sequence annotation.
* **Communications**: Decoding convolutional codes over noisy channels (Viterbi Decoder).
* **Acoustic Modeling**: Phoneme decoding in HMM-based speech systems.

---

## 4. Additional Foundational Algorithms

To round out your theoretical knowledge of sequence processing, three other algorithms build directly on these concepts:

### A. Needleman-Wunsch Algorithm (Global Discrete Alignment)

#### The Core Problem
Designed for discrete character strings (such as DNA sequences or amino acids), **Needleman-Wunsch** finds the **optimal global alignment** between two strings by explicitly accounting for matches, mismatches, and **gap penalties** (insertions/deletions).

#### Theoretical Framework
Uses a configurable scoring function:
* **Match Score (*S*<sub>match</sub>)**: Reward for identical characters.
* **Mismatch Penalty (*S*<sub>mismatch</sub>)**: Penalty for replacing one character with another.
* **Gap Penalty (*d*)**: Penalty for introducing gaps (represented by `-`).

#### Mathematical Recurrence
For sequences *X* (length *N*) and *Y* (length *M*):

<div class="math-display">
$$F(i, j) = \max \begin{cases} F(i-1, j-1) + S(X_i, Y_j) & \text{(Match / Mismatch)} \\ F(i-1, j) - d & \text{(Deletion / Vertical Gap)} \\ F(i, j-1) - d & \text{(Insertion / Horizontal Gap)} \end{cases}$$
</div>

---

### B. Smith-Waterman Algorithm (Local Subsegment Alignment)

#### The Core Problem
Global alignment forces two sequences to match end-to-end. However, two long sequences might share only a short, conserved domain while being unrelated elsewhere. **Smith-Waterman** solves the **optimal local alignment** problem, isolating the highest-scoring matching sub-regions.

#### Theoretical Framework
Smith-Waterman modifies Needleman-Wunsch by enforcing a **zero lower bound**. If a path incurs too many penalties and drops below zero, the score resets to 0, allowing alignment to restart at any index.

#### Mathematical Recurrence
<div class="math-display">
$$H(i, j) = \max \begin{cases} 0 & \text{(Reset local search)} \\ H(i-1, j-1) + S(X_i, Y_j) & \text{(Match / Mismatch)} \\ H(i-1, j) - d & \text{(Deletion)} \\ H(i, j-1) - d & \text{(Insertion)} \end{cases}$$
</div>

#### Traceback Mechanism
* **Needleman-Wunsch**: Traceback starts at the bottom-right corner *F*(*N*, *M*) and ends at *F*(0, 0).
* **Smith-Waterman**: Traceback starts at the **highest score cell anywhere in the table** and stops as soon as it hits a cell with a score of **0**.

---

### C. Baum-Welch Algorithm (HMM Parameter Learning)

#### The Core Problem
The Viterbi algorithm assumes HMM parameters (&lambda; = *A*, *B*, &pi;) are known in advance. When you only have observation sequences *O* without labeled hidden states, the **Baum-Welch algorithm** (an implementation of the **Expectation-Maximization / EM** framework) iteratively estimates the parameters that maximize *P*(*O* | &lambda;).

#### Theoretical Framework: Forward-Backward Variables
1. **Forward Variable &alpha;<sub>t</sub>(*i*)**: The probability of observing sequence prefix *o*<sub>1</sub>...*o*<sub>t</sub> and ending in state *q*<sub>i</sub> at step *t*.
2. **Backward Variable &beta;<sub>t</sub>(*i*)**: The probability of observing sequence suffix *o*<sub>t+1</sub>...*o*<sub>T</sub> given state *q*<sub>i</sub> at step *t*.

#### The EM Iteration
* **Expectation Step (E-step)**: Compute expected state transition and emission counts using current parameter estimates and forward-backward variables.
* **Maximization Step (M-step)**: Re-estimate transition matrix *A*, emission matrix *B*, and initial probabilities &pi; by normalizing the expected counts.

---

## 5. Comparative Analysis

| Algorithm | Model Type | Primary Objective | Optimization Metric | Input Requirements |
| :--- | :--- | :--- | :--- | :--- |
| **Dynamic Time Warping (DTW)** | Non-parametric, Deterministic | Align continuous trajectories non-linearly | Minimal cumulative warping distance | Two time-series sequences |
| **Viterbi Algorithm** | Parametric, Probabilistic | Decode most likely hidden state path | Maximum joint path probability | Observations + Known HMM |
| **Needleman-Wunsch** | Non-parametric, Discrete | Global end-to-end string alignment | Maximum global score matrix | Two discrete symbol strings |
| **Smith-Waterman** | Non-parametric, Discrete | Local subsegment alignment | Maximum local subsegment score | Two discrete symbol strings |
| **Baum-Welch** | Unsupervised Probabilistic | Learn unknown HMM parameters | Marginal likelihood *P*(*O* \| &lambda;) | Unlabeled observation sequences |

---

## 6. Summary & Key Takeaways

1. **Dynamic Programming as the Core**: All five algorithms use sub-problem memoization to avoid exploring exponential search spaces.
2. **Deterministic Alignment vs. State Estimation**: Use **DTW** or **Smith-Waterman / Needleman-Wunsch** when comparing explicit sequences directly; use **Viterbi** or **Baum-Welch** when modeling hidden underlying processes.
3. **Global vs. Local Focus**: Use global methods (DTW, Needleman-Wunsch) when full sequence length alignment matters; use local methods (Smith-Waterman) when looking for matching sub-patterns inside longer sequences.