#!/bin/bash

#Syntax: ./ndk_path /usr/local/android-ndk-r14b

echo "======] Adding ${1} to  your PATH [======"
export PATH=$PATH:$1
