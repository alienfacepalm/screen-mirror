#!/bin/bash

echo "======] Setting up MCB Screen Mirror Vendor Dependencies [======"

cd vendor
ls -lah

echo "======] Cloning [======"
git clone https://github.com/openstf/minicap.git
git clone https://github.com/openstf/minitouch.git

echo "======] Copying Shell Script Fix to MiniCap [======"
ls -lah
cp ./run_minicap_fix.sh minicap/run.sh

echo "======] Updating Minicap Dependencies [======"
cd minicap
git submodule init
git submodule update
cd ../
echo "======] Updating Minitouch Dependencies [======"
cd minitouch
git submodule init
git submodule update
cd ../
ls -lah

echo "Finished. Don't forget to build minicap and minitouch using Android's NDK -> https://developer.android.com/ndk/downloads/index.html"
