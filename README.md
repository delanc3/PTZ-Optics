# Welcome!
My goal for this project is to make an easily accessible and intuitive controller for PTZ-Optics cameras.
The backend of the controller is mostly based off the original (IMHO messy) controller build by PTZ-Optics themselves.

### Contents:
  - [Installation](#Installation)
  - UI Overview
  - How it works
    - HTTP /cgi-bin
    - Ajax
    - Keybinding
    - Preferences and settings

## Installation
Currently (Oct 2023) in order to use this camera controller, you will need to run a local webserver on whatever device you want to run it on, I use Apache's HTTPD server but you can use whatever one you want as long as it can interperet php[^1]

[^1]: I will most likely remove the dependancy on php sometime in the near future
