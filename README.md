---
layout: default
title: readme
---

## AqQua: The Aquatic Life Foundation Project: Quantifying Life at Scale in a Changing World

This is the repository for our AqQua project page at <https://kainmueller-lab.github.io/aqqua/> . It uses `Jekyll` for static site generation.

### How to test github page locally

- setup virtual env (you can replace `micromamba` with whatever tool you are using (e.g., conda, mamba))
  ```
  micromamba create --name github_pages
  micromamba activate github_pages
  micromamba install ruby=3
  micromamba install compilers
  gem install jekyll bundler
  ```
- go to folder
  ```
  bundle install
  bundle update
  bundle exec jekyll serve
  ```

### How to use Jekyll

The [Jekyll Documentation](https://jekyllrb.com/docs/) contains detailed information on how to add content. `Jekyll` supports templates, conditional statements (e.g., if, unless), loops and a lot more.

The content is written using `Markdown`, each file should begin with a header similar to this:

```
---
layout: default
title: Title of page
---
```

Layout definitions are located in `_layouts`.
Each layout can inherit from other layouts. For example the `team` layout inherits from the `default` layout. Inheritance in this case means that the 
{% raw %}
`{{ content }}`
{% endraw %}
tag in the `default` layout is replaced by whatever is defined in the `team` layout.
