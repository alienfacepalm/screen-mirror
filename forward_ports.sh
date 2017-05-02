#!/bin/bash

echo "Forwarding TCP ports 1111 and 1717 for minitouch and minicap respectively."

adb forward tcp:1111 localabstract:minitouch
adb forward tcp:1717 localabstract:minicap
