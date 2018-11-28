#!/bin/bash
# RoBot Linux Launcher.
# @author lordjbs

user=$USER
echo "Welcome $user ! Starting RoBot"

node bot.js

read -n1 -r -p "Press any key to continue..." key
