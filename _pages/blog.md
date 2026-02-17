---
layout: default
title: Blog
subtitle: "Thoughts on music, AI, and digital culture."
permalink: /blog/
custom_css: blog
---

{% if page.custom_css %}
  <link rel="stylesheet" href="{{ '/assets/css/' | append: page.custom_css | append: '.css' | relative_url }}">
{% endif %}

<div class="blog-list">
  {% for post in site.posts %}
    <a href="{{ post.url | relative_url }}" class="blog-card-link">
      <div class="card blog-card reveal-card">
        <div class="card-pad">
          
          <div class="blog-header">
            <h2 class="blog-title">{{ post.title }}</h2>
            <div class="blog-meta">
              {{ post.date | date: "%B %d, %Y" }}
              {% if post.tags.size > 0 %}
                · <span class="blog-tags">{% for tag in post.tags %}#{{ tag }} {% endfor %}</span>
              {% endif %}
            </div>
          </div>

          <div class="blog-excerpt">
            {{ post.excerpt | strip_html | truncatewords: 30 }}
          </div>

        </div>
      </div>
    </a>
  {% endfor %}
</div>