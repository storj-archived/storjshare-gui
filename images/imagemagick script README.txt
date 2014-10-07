Removes sRGB color profiles from PNG image files. This removes the warning Kivy throws out: 

"libpng warning: iCCP: known incorrect sRGB profile"

This needs to be done on any PNG file created with Photoshop especially, since Photoshop uses a color profile which causes an error with libpng. 

Note: Filenames are added manually to the script. 



References: 
https://wiki.archlinux.org/index.php/Libpng_errors
https://github.com/Storj/driveshare-gui/issues/21#issuecomment-58206821