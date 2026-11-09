---
layout: default
title: My Music
subtitle: "Just a hobby!"
permalink: /music/
custom_css: music
---

{% if page.custom_css %}
  <link rel="stylesheet" href="{{ '/assets/css/' | append: page.custom_css | append: '.css' | relative_url }}">
{% endif %}

<!-- Added width: 100% and text-align: left to break out of any centered parent wrappers -->
<div class="container" style="width: 100%; display: block; text-align: left; margin: 0 auto;">
  
  <div class="music-grid">
    {% for track in site.data.music.items %}
      <a href="{{ track.link }}" target="_blank" class="card music-card">
        
        <!-- Cover Image or Fallback Gradient -->
        {% if track.cover != "" and track.cover != nil %}
          <img src="{{ track.cover }}" alt="{{ track.title }} cover" class="music-cover">
        {% else %}
          <div class="music-cover-fallback">
            <i class="fa-solid fa-music"></i>
          </div>
        {% endif %}

        <!-- Glassy Overlay for Text -->
        <div class="music-overlay">
          <div class="music-meta">
            <span class="music-genre">{{ track.genre }}</span>
            <span class="music-year">{{ track.year }}</span>
          </div>
          <h3 class="music-title">{{ track.title }}</h3>
          
          <!-- Hover Play Button -->
          <div class="play-indicator">
            <i class="fa-solid fa-play"></i>
          </div>
        </div>
        
      </a>
    {% endfor %}
  </div>
</div>