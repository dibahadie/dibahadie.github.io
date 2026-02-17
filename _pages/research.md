---
layout: default
title: Research
subtitle: "Computational music generation, NIME, and statistical learning."
permalink: /research/
custom_css: research
---

{% if page.custom_css %}
  <link rel="stylesheet" href="{{ '/assets/css/' | append: page.custom_css | append: '.css' | relative_url }}">
{% endif %}

<div class="research-list">
  {% for res in site.data.research.items %}
    <div class="card research-card reveal-card">
      {% if res.venue == "In Progress" or res.venue == "Under Review" %}
        <div class="status-badge">{{ res.venue }}</div>
      {% endif %}

      <div class="card-pad">
        <div class="research-header">
          <div class="title-area">
            <h2 class="research-title">{{ res.title }}</h2>
            <div class="research-venue">
              {% unless res.venue == "In Progress" %}
                {{ res.venue }} · {{ res.year }}
              {% else %}
                Ongoing Research
              {% endunless %}
            </div>
          </div>
          
          <div class="research-actions">
            {% if res.pdf %}<a href="{{ res.pdf }}" class="action-pill"><i class="fa-solid fa-file-pdf"></i> PDF</a>{% endif %}
            {% if res.code %}<a href="{{ res.code }}" class="action-pill"><i class="fa-solid fa-code"></i> Code</a>{% endif %}
          </div>
        </div>

        <div class="research-abstract">
          <p>{{ res.abstract }}</p>
        </div>
      </div>
    </div>
  {% endfor %}
</div>