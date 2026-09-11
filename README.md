# jamiewarburton.dev

Jamie Warburton's personal site, running on Astro.

## Dev

My writing is stored in a private repository called portfolio-content. It is brought into this site via a git submodule.

To clone this repo with the content submodule:

```
git clone --recurse-submodules git@github.com:YOUR_USER/portfolio-site.git
```

When content is pushed to the content repo, it needs updating in this one, via:

```
git submodule update --recursive --remote
```

Add --init if it's the first time

## Credits

The design of this site is entirely based on Tania Rascia's website. It's a lovely, well-designed site
that Tania has published the source too, and has meant I was able to actually get something online without
deliberating for months without publishing anything. Thank you Tania!
