# `quadrafuzz_without_builder`

> This is a test of the quadrafuzz that hasn't been built/minimized. Only changes:
> 1) the index.html test/host page needs to load a module (host.js) in order to be able to use imports in it
> 2) all import statements need filenames that end with .js, the suffix is mandatory
> 3) in the GUI, I replaced the imports that imported the HTML template, the CSS stylesheet, the images,  by simple variables.
> Now the SDK should be available, minimized, at a single location (on a CDN? On the repo)

