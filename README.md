# Phone Stand - Our Class Phone Museum

A small class activity to practise Git (clone, pull, push) and Netlify deployment
using only HTML, CSS and JavaScript.

## Folder map
- index.html        - the showcase page (open it by double-clicking; no server needed)
- css/style.css     - the look
- js/roster.js      - master list of 55 students (FACULTY ONLY - students never edit this)
- js/app.js         - the logic (cards, search, filters, fun facts)
- phones/           - one file per student, named with the Reg No (e.g. phones/U03MJ24S0001.js)
- phones/_TEMPLATE.js - the file students copy
- netlify.toml      - tells Netlify to publish the folder as it is (no build step)

## Rule
Every student edits ONLY their own file in phones/. Then nobody has merge conflicts.

## Run offline
Double-click index.html. No internet, fetch or server is used.

## Deploy
See the Faculty Manual. Short version: push to GitHub, connect the repo in Netlify,
build command empty, publish directory "."

## Add a new student
Add one line to js/roster.js, like: { reg: "U03MJ24S0061", name: "New Student" },
