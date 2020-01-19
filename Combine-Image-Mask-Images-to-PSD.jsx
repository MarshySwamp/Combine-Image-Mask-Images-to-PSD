/*

Combine Image & Mask Images to PSD.jsx

by Stephen Marsh - 2020

//community.adobe.com/t5/photoshop/automated-layer-mask-from-separate-silhouette-file/td-p/10865377

Code based on the following topic thread:
//community.adobe.com/t5/photoshop/batch-process-groups-of-files-based-on-numbering/td-p/10809093

NOTE:
There is no error checking, the 2 input folders must all contain the same quantity of alphabetically sorting images.
No Files should be open.
It is assumed that all files are RGB.
It is assumed that all files are flattened with only a "Background" image layer.
It is assumed that all files will be saved with a single masked layer, named after the document name.
It is also assumed that the old and mask files all have the same width/height/resolution.
Original file names will have a prefix of "Masked_" added.

*/

#target photoshop

/* Start Open Document Error Check - Part A: If */
if (app.documents.length == 0) {

    (function () {

        // Prompt for input and output folders
        var imageFiles = Folder.selectDialog('Select the images folder...', '~/desktop/');
        // Test if CANCEL returns null, then do nothing.
        if (imageFiles == null) {
            return
        }; 
        var maskFiles = Folder.selectDialog('Select the mask folder...', '~/desktop/');
        // Test if CANCEL returns null, then do nothing.
        if (maskFiles == null) {
            return
        }; 
        var outFolder = Folder.selectDialog('Select the save/output folder...', '~/desktop/');
        // Test if CANCEL returns null, then do nothing.
        if (outFolder == null) {
            return
        };

        // File List
        var searchMask = '*.???';
        var fileList1 = imageFiles.getFiles(searchMask);
        var fileList2 = maskFiles.getFiles(searchMask);
        
        // Alpha-numeric sort
        fileList1.sort();
        fileList2.sort();

        // File input Loop
        for (var i = 0; i < fileList1.length; i++) {
            var doc1 = open(fileList1[i]);
            var doc2 = open(fileList2[i]);

            // Start - Doing stuff to open files

            // Mask Doc [1]
            app.activeDocument.selection.selectAll();
            app.activeDocument.selection.copy();
            app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            // Image Doc [0]
            app.activeDocument.paste();

            // Load active mask layer RGB composite channel as selection
            set();

            function set() {
                var c2t = function (s) {
                    return app.charIDToTypeID(s);
                };
                var s2t = function (s) {
                    return app.stringIDToTypeID(s);
                };
                var descriptor = new ActionDescriptor();
                var reference = new ActionReference();
                var reference2 = new ActionReference();
                reference.putProperty(s2t("channel"), s2t("selection"));
                descriptor.putReference(c2t("null"), reference);
                reference2.putEnumerated(s2t("channel"), s2t("channel"), s2t("RGB"));
                descriptor.putReference(s2t("to"), reference2);
                executeAction(s2t("set"), descriptor, DialogModes.NO);
            }

            // Remove the mask doc layer
            app.activeDocument.activeLayer.remove();

            // Convert the Background 'image' layer to regular layer
            app.activeDocument.activeLayer.isBackgroundLayer = false;

            // Create layer mask
            make();

            function make() {
                var c2t = function (s) {
                    return app.charIDToTypeID(s);
                };
                var s2t = function (s) {
                    return app.stringIDToTypeID(s);
                };
                var descriptor = new ActionDescriptor();
                var reference = new ActionReference();
                descriptor.putClass(s2t("new"), s2t("channel"));
                reference.putEnumerated(s2t("channel"), s2t("channel"), s2t("mask"));
                descriptor.putReference(s2t("at"), reference);
                // Invert mask as required using "revealSelection" or "hideSelection"
                descriptor.putEnumerated(s2t("using"), c2t("UsrM"), s2t("hideSelection"));
                executeAction(s2t("make"), descriptor, DialogModes.NO);
            }

            // Name the masked image layer after the document
            var fileName = app.activeDocument.name.replace(/\.[^\.]+$/, '');
            app.activeDocument.activeLayer.name = fileName;

            // Finish - Doing stuff to open files

            // Save PSD
            var docName = app.activeDocument.name.split('.')[0];
            var saveFilePSD = new File(new File(outFolder + '/' + 'Masked_' + docName.split('.')[0] + '.psd'));
            SavePSD(saveFilePSD);

            // Setup PSD options
            function SavePSD(saveFilePSD) {
                psdSaveOptions = new PhotoshopSaveOptions();
                psdSaveOptions.embedColorProfile = true;
                psdSaveOptions.alphaChannels = true;
                psdSaveOptions.layers = true;
                psdSaveOptions.annotations = true;
                psdSaveOptions.spotColors = true;
                app.activeDocument.saveAs(saveFilePSD, psdSaveOptions, true, Extension.LOWERCASE);
            }

            app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);

        }

        alert('Script completed!');

    })();

}
/* Finish Open Document Error Check - Part A: If */

/* Start Open Document Error Check - Part B: Else */
else {
    alert('Please close all open files before running this script!');
}
/* Finish Open Document Error Check - Part B: Else */
