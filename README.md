# Welcome!
My goal for this project is to make an easily accessible and intuitive controller for PTZ-Optics cameras.
The backend of the controller is mostly based off the original (IMHO messy) controller build by PTZ-Optics themselves.

### Contents:
  - [Installation](###Installation)
  - [UI Overview](#UI Overview)
  - How it works
    - HTTP /cgi-bin
    - Ajax
    - Keybinding
    - Preferences and settings
---
### Installation
Currently (Oct 2023) in order to use this camera controller, you will need to run a local web-server on whatever device you want to run it on, I use Apache's HTTPD server but you can use whatever one you want as long as it can interperet php[^1]. So just click the green "Code" button and select "Download ZIP"

<img src="https://github.com/j-trueman/PTZ-Optics/assets/82833724/80d5ad48-303b-4c85-b402-772af67a8832" width="300">

Then unzip and place all the files in the document root of your web-server



[^1]: I will most likely remove the dependancy on php sometime in the near future, it's only neccessary at the moment to allow for thumbnail downloads of preset positions
