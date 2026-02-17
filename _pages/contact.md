---
layout: default
title: Contact
subtitle: "Best ways to reach me."
permalink: /contact/
custom_css: contact
---

<div class="contact-list reveal-card">
  <a href="mailto:{{ site.data.profile.email }}" class="contact-card-link">
    <div class="card contact-card">
      <div class="card-pad">
        <i class="fa-solid fa-envelope"></i>
        <div class="contact-info">
          <span class="contact-label">Email</span>
          <span class="contact-value">{{ site.data.profile.email }}</span>
        </div>
      </div>
    </div>
  </a>

  <a href="https://github.com/dibahadie" class="contact-card-link" target="_blank">
    <div class="card contact-card">
      <div class="card-pad">
        <i class="fa-brands fa-github"></i>
        <div class="contact-info">
          <span class="contact-label">GitHub</span>
          <span class="contact-value">github.com/dibahadie</span>
        </div>
      </div>
    </div>
  </a>

  {% for s in site.data.profile.social %}
    <a href="{{ s.url }}" class="contact-card-link" target="_blank">
      <div class="card contact-card">
        <div class="card-pad">
          <i class="{{ s.icon }}"></i>
          <div class="contact-info">
            <span class="contact-label">{{ s.label }}</span>
            <span class="contact-value">{{ s.url | remove: "https://" | remove: "www." | split: "/" | first }}</span>
          </div>
        </div>
      </div>
    </a>
  {% endfor %}
</div>