---
title: "Blog"
layout: single
permalink: /blog/
author_profile: true
---

{% if site.posts.size > 0 %}
<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <small>— {{ post.date | date: "%B %d, %Y" }}</small>
    </li>
  {% endfor %}
</ul>
{% else %}
<p>No posts found.</p>
{% endif %}
