---
layout: default
title: Notebooks
subtitle: "Interactive explorations in deep music, NIME, and statistical learning."
permalink: /notebooks/
custom_css: notebooks
---

{% if page.custom_css %}
  <link rel="stylesheet" href="{{ '/assets/css/' | append: page.custom_css | append: '.css' | relative_url }}">
{% endif %}

<div class="research-list">
  {% for nb in site.notebooks %}
    {% if nb.path contains 'index.md' %}
      <a href="{{ nb.url | relative_url }}" class="card-anchor-wrapper">
        <div class="card research-card reveal-card">
          
          {% if nb.status %}
            <div class="status-badge">{{ nb.status }}</div>
          {% endif %}

          <div class="card-pad">
            <div class="research-header">
              <div class="title-area">
                <h2 class="research-title">{{ nb.title }}</h2>
                <div class="research-venue">
                  {{ nb.category }} · {{ nb.last_updated }}
                </div>
              </div>
            </div>

            <div class="research-abstract">
              <p>{{ nb.description }}</p>
              {% if nb.tags %}
                <div class="notebook-tags">
                  <strong>Topics:</strong> 
                  {% for tag in nb.tags %}
                    <span class="tag">{{ tag }}</span>
                  {% endfor %}
                </div>
              {% endif %}
            </div>
          </div>
        </div>
      </a>
    {% endif %}
  {% endfor %}
</div>