# Welcome!
My goal for this project is to make an easily accessible and intuitive controller for PTZ-Optics cameras.
The backend of the controller is mostly based off the original (IMHO messy) controller build by PTZ-Optics themselves.

### Contents:
  - [Installation](#installation)
  - [UI Overview](#ui-overview)
  - [How it works](#how-it-works)
    - [HTTP and cgi-bin](#http-and-cgi-bin)
    - Ajax
    - Keybinding
    - Preferences and settings

___
### Installation
Currently (Oct 2023) in order to use this camera controller, you will need to run a local web-server on whatever device you want to run it on, I use Apache's HTTPD server but you can use whatever one you want as long as it can interperet php[^1]. So just click the green "Code" button and select "Download ZIP"

<img src="https://github.com/j-trueman/PTZ-Optics/assets/82833724/80d5ad48-303b-4c85-b402-772af67a8832" width="300">

Then unzip and place all the files in the document root of your web-server

<img src="https://github.com/j-trueman/PTZ-Optics/assets/82833724/1c35f67b-e99f-4a2d-94c3-3ae00561ec0b" width="300">

___
### UI Overview
I have designed the UI to be as easy to understand as possible.[^2] I've used mediaqueries to create 2 slightly different UIs for the controller. The first has 3 main sections:

<img src="https://github.com/j-trueman/PTZ-Optics/assets/82833724/bd2bbce4-6168-4db5-a95c-f136fbc83b50" width="500">

The "Preset" panel is used for calling presets[^3] that the user has defined. The "Preview" panel displays a preview of whichever preset is currently being hovered over in the "Preset" panel. The "PTZ" panel has controls for the camera, allowing the user to (as the name sugests) pan, tilt and zoom the camera as well as adjust the focus.

The smaller version of the UI is practically identical minus the "Preview" panel as well as the "PTZ" panel being below the "Preset" panel.

___
### How It Works
In this section i'll give a brief overview of how the backend of the controller operates and some code snippets as well.
#### HTTP and cgi-bin
PTZ-Optics cameras can be given isntructions by submiting an HTTP-GET request to scripts within the cgi-bin directory on the camera. There are two base paths that all the commands stem from on a PTZ camera. These are:
```
http://[camera ip]/cgi-bin/ptzctrl.cgi?ptzcmd&
```
and
```
http://[camera ip]/cgi-bin/param.cgi?
```

[^1]: I will most likely remove the dependancy on php sometime in the near future, it's only neccessary at the moment to allow for thumbnail downloads of preset positions
[^2]: This section will be updated whenever significant changes to the UI are made
[^3]: Setting presets currently requires going to a different page but I'll eventually change this to just a toggle to switch between calling and setting
