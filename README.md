# Web Content Analyzer

This is a node red contribution package that focuses on crawling websites and analyzing their content (text & images). The package is still in it's early stages but expect it to grow in the future.

# Dir structure

```
├── nodes
│   ├── <node_name>.html
│   ├── <node_name>.js
│   └── ...
├── img
│   └── examples
├── install.sh (used for development only)
└── README.md
```

# Nodes explained individually

There are currently 3 nodes in the package:
- `image-analyzer` - for a given `webpage url` (single page) and a set of `keywords`, the node will analyze the content of the images (titles, meta tags etc.) and return the corresponding images that matches the criteria.
- `text-analyzer` - for a given `webpage url` (single page) and a set of `keywords`, the node will analyze the content of the text (tags such as p, h1...) and return the corresponding text that matches the criteria.
- `page-finder` - for a given `webpage url`, page finder will crawl the given website and return all the links to the pages, without going offbounds of the given domain. As a result it spits out found links one by one, example being: 
```
every 0.5 seconds the node sends downstream messages:
example.com ->
example.com/about ->
example.com/about/team ->
example.com/contact ->
example.com/contact/office ->
example.com/contact/office/berlin ->
```

# Bugs

Filtering out logs in `text-analyzer` and `image-analyzer` doesn't work yet. Expected to be fixed in the next minor patch.

# WIPs & Proposals

- [ ] Web crawling is currently done relatively simple, without any kind of optimization. Should get improved.
- [ ] Web crawling currently isn't elaborate, thus i propose to add advanced ways of querying a website (example being criteria such as crawling depth etc.)
- [ ] Analyze the ways these nodes could / should be used and introduce new nodes that would be useful in the context of this package.
- [ ] Introduce ELK stack sanitizers and transformers for the logs -> goal being easier to play around with data
- [ ] Enhance logging
- [ ] Improve dir structure and automate chores etc.
- [ ] Improve docs & provide examples
- [ ] Add better icons to the nodes, current ones are confusing
- [ ] Decouple the logic from nodes itself, contain the logic in ts/js modules and use them within the nodes. This would allow the better containment & scalability of the project. 
- [ ] CI/CD & tests, tests, tests... - luka gotta devops!

# Usecase & Closing words

As far as my views go, i do see some potential in this package. Creating any kind of nodeRED contribution opens up quite a lot of doors considering the nature of nodeRED and the amount of integrations it already has. Besides that, this package helps people analyze content on web pages automatically. The value of the package is in it's simplicity and ability to integrate easily into any logic without a lot of setup & need for deeper understanding.

As of the time of writing, only existing nodes are `image-analyzer`, `text-analyzer` and `page-finder`. There are a few ideas that might be interesting to implement, content analysis wise. At the current state, i would still call it POC, but it's a good start regardless.

