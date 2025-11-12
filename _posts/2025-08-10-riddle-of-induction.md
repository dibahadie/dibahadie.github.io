---
title: "Deep Dive: The Old Riddle of Induction"
layout: single
sidebar:
  nav: deep-dive-induction
date: 2025-08-10
categories: [blog]
permalink: /deep-dive-induction/
---
# The Old Riddle of Induction

First up, we’re diving into the article that set this whole series in motion: *The New Riddle of Induction* by Goodman. Even if you’ve never studied the philosophy of induction, the title alone begs the question: what exactly is the problem of induction?  
Surprisingly, it’s about something we all do every day—often without thinking twice—that turns out to have deep philosophical roots. Once you start looking closer, this “simple” act of making inductive judgments becomes a puzzle that’s far trickier than it seems.
For me, it connects deeply with my long-standing curiosity about out-of-distribution generalization in machine learning. The more I explore induction, the more I feel we need to pause and reflect on what we truly want from our AI systems. One thing is becoming crystal clear: without fully grasping the nature of induction, building AI with truly strong reasoning capabilities will remain out of reach. So buckle up!


## Problem of Validity of Judgments About Future or Unknown Cases

The problem is very simple, nothing in the future can be logically inferred from what has been observed already. What has happened imposes no logical restriction on what will happen. A more technical way of describing this would be that there are no necessary connections of matters of fact. This seem complex so let’s break it down:
To really get this right, I’m gonna go back to definitions. What are matters of facts, what is a necessary condition, and lastly, what does it mean to say there are no necessary connections of matters of facts?


### Hume’s Distinction: Matters of Fact vs. Relations of Ideas

According to Hume, there are two sources of knowledge: relations of ideas and matters of fact [^1].
- Relations of ideas: analytic claims which can be justified a priori, that is to say, independent of experience and with necessity. These include claims about geometry and algebra, and definitional statements.
- Matters of fact: Matters of fact are a posteriori claims grounded in experience in the world, such as claims about substance and causal relations. But unlike as with a priori claims, to deny a posteriori claims implies no contradiction.
We can also characterize Hume’s distinction between relations of ideas and matters of fact as the distinction between analytic and synthetic knowledge, respectively.
Now jumping to the idea of necessary connections.


### Hume’s Copy Principle and Necessary Connections

Hume has a copy principle that loosely states all our ideas come from experience. The contents of our minds (perceptions) are categorized in two parts: impressions and ideas. Impressions are vivid experiences from our senses or memory, and ideas are fainter versions in our mind. Hume suggests that all our ideas come from our impressions being mixed together through various relations: [2]
- Natural relations resemblance, closeness in space/time, cause and effect.
- Philosophical relations (put together by reasoning): some give certainty (like resemblance), others don’t—cause and effect is one of the uncertain ones.
Among all these relations, cause and effect is the most special, it fits into both categories of relations and it seems to be the main way we reason about things we can’t directly sense. In Hume’s view, causation isn’t a property of things, but a relation between ideas in the mind that helps us make sense of the world beyond what we see right now.

### No Necessary Connection Between Cause and Effect

This is where it gets interesting, Hume here argues that there is really no necessary connection between cause and effect. I’ll refer to this great explanation provided in [^2]:

> Hume challenges us to consider any one event and meditate on it; for instance, a billiard ball striking another. He holds that no matter how clever we are, the only way we can infer if and how the second billiard ball will move is via past experience. There is nothing in the cause that will ever imply the effect in an experiential vacuum.  
> And here it is important to remember that, in addition to cause and effect, the mind naturally associates ideas via resemblance and contiguity.  
> Hume does not hold that, having never seen a game of billiards before, we cannot know what the effect of the collision will be. Rather, we can use resemblance, for instance, to infer an analogous case from our past experiences of transferred momentum, deflection, and so forth.  
> We are still relying on previous impressions to predict the effect and therefore do not violate the Copy Principle. We simply use resemblance to form an analogous prediction. And we can charitably make such resemblances as broad as we want.  
> Thus, objections like: *Under a Humean account, the toddler who burned his hand would not fear the flame after only one such occurrence because he has not experienced a constant conjunction,* are unfair to Hume, as the toddler would have had thousands of experiences of the principle that like causes like, and could thus employ resemblance to reach the conclusion to fear the flame.

Now, another question is raised. If we define causation merely as constant conjunction, that events A and B consistently happen together, how do we decide that this consistency isn’t just luck? In other words, seeing events happen together a number of times still doesn’t necessarily imply that idea of causation in our mind. Causation provides the deeper meaning that not only the conjunction seems to be consistent, but also it’s necessary and not accidental.

We can truly understand here what revolutionary statement it is to say there are no necessary connections of matters of fact! If you think about it, logically speaking, we can’t justify the decision as to why a relation between matters of fact is considered as causation in our mind. There are always possible worlds in which event A does not cause event B to happen. This begs the question to mind: So what is this necessity that is implied by causation? Although it can’t be justified logically, it’s definitely an attribute of a connection that we decide about and feel. This is where we can jump to the problem of induction. 

---

[^1]: [Exploring Hume’s Distinction Between Relations of Ideas and Matters of Fact](https://michaelrobertcaditz.medium.com/exploring-humes-distinction-between-relations-of-ideas-and-matters-of-fact-the-devil-is-in-the-5e975624f2a6)  
[^2]: [Hume on Causation](https://iep.utm.edu/hume-causation/#H1)

