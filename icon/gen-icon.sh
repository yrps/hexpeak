#!/bin/bash

# ImageMagick script to generate a favicon for the hexpeak web page

convert -size 64x64 canvas:none -font Helvetica-BoldOblique -pointsize 56 \
-kerning -3 -draw "text -2,52 '0x'" -blur 8x8 \
-fill crimson -stroke navy -draw "text -2,52 '0x'" favicon.ico