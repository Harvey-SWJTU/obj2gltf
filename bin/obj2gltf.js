#!/usr/bin/env node
'use strict';
var Cesium = require('cesium');
var path = require('path');
var yargs = require('yargs');
var convert = require('../lib/convert');

var defined = Cesium.defined;

var defaults = convert.defaults;

var args = process.argv;

var argv = yargs
    .usage('Usage: node $0 -i inputPath -o outputPath')
    .example('node $0 -i ./specs/data/box/box.obj -o box.gltf')
    .help('h')
    .alias('h', 'help')
    .options({
        input : {
            alias: 'i',
            describe: 'Path to the obj file.',
            type: 'string',
            normalize: true,
            demandOption: true
        },
        output : {
            alias: 'o',
            describe: 'Path of the converted glTF file.',
            type: 'string',
            normalize: true
        },
        binary : {
            alias: 'b',
            describe: 'Save as binary glTF.',
            type: 'boolean',
            default: defaults.binary
        },
        separate : {
            alias: 's',
            describe: 'Write separate geometry data files, shader files, and textures instead of embedding them in the glTF.',
            type: 'boolean',
            default: defaults.separate
        },
        separateTextures : {
            alias: 't',
            describe: 'Write out separate textures only.',
            type: 'boolean',
            default: defaults.separateTextures
        },
        compress : {
            alias: 'c',
            describe: 'Quantize positions, compress texture coordinates, and oct-encode normals.',
            type: 'boolean',
            default: defaults.compress
        },
        optimize : {
            alias: 'z',
            describe: 'Optimize the glTF for size and runtime performance.',
            type: 'boolean',
            default: defaults.optimize
        },
        optimizeForCesium : {
            describe: 'Optimize the glTF for Cesium by using the sun as a default light source.',
            type: 'boolean',
            default: defaults.optimizeForCesium
        },
        generateNormals : {
            alias: 'n',
            describe: 'Generate normals if they are missing.',
            type: 'boolean',
            default: defaults.generateNormals
        },
        ao : {
            describe: 'Apply ambient occlusion to the converted model.',
            type: 'boolean',
            default: defaults.ao
        },
        kmc : {
            describe: 'Output glTF with the KHR_materials_common extension.',
            type: 'boolean',
            default: defaults.kmc
        },
        bypassPipeline : {
            describe: 'Bypass the gltf-pipeline for debugging purposes. This option overrides many of the options above and will save the glTF with the KHR_materials_common extension.',
            type: 'boolean',
            default: defaults.bypassPipeline
        },
        hasTransparency : {
            describe: 'Do a more exhaustive check for texture transparency by looking at the alpha channel of each pixel. By default textures with an alpha channel are considered to be transparent.',
            type: 'boolean',
            default: defaults.hasTransparency
        },
        secure : {
            describe: 'Prevent the converter from reading image or mtl files outside of the input obj directory.',
            type: 'boolean',
            default: defaults.secure
        }
    }).parse(args);

var objPath = argv.i;
var gltfPath = argv.o;

if (!defined(gltfPath)) {
    var extension = argv.b ? '.glb' : '.gltf';
    var modelName = path.basename(objPath, path.extname(objPath));
    gltfPath = path.join(path.dirname(objPath), modelName + extension);
}

var options = {
    binary : argv.binary,
    separate : argv.separate,
    separateTextures : argv.separateTextures,
    compress : argv.compress,
    optimize : argv.optimize,
    optimizeForCesium : argv.optimizeForCesium,
    generateNormals : argv.generateNormals,
    ao : argv.ao,
    kmc : argv.kmc,
    bypassPipeline : argv.bypassPipeline,
    hasTransparency : argv.hasTransparency,
    secure : argv.secure
};

console.time('Total');

convert(objPath, gltfPath, options)
    .then(function() {
        console.timeEnd('Total');
    })
    .catch(function(error) {
        console.log(error.message);
    });
