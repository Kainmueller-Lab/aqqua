## AqQua: The Aquatic Life Foundation Project: Quantifying Life at Scale in a Changing World

This is the repository for our AqQua project page at https://kainmueller-lab.github.io/aqqua/ .

### How to test github page locally

- setup conda env
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
