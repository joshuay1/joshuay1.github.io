---
layout: page
title: real-world projects
permalink: /projects/
description: A growing collection of real-world deployments and experimental interfaces.
nav: true
nav_order: 3
---

<!-- pages/projects.md -->

<div class="projects">

{% assign sorted_projects = site.projects | sort: "importance" %}

{% for project in sorted_projects %}
<div class="row mb-5">
    <div class="col-sm-12">
        <h2 class="category"><a href="{{ project.url | relative_url }}">{{ project.title }}</a></h2>
        {{ project.content }}
    </div>
</div>
{% if forloop.last == false %}
<hr>
{% endif %}
{% endfor %}

</div>
