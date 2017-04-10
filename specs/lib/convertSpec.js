'use strict';
var Cesium = require('cesium');
var GltfPipeline = require('gltf-pipeline').Pipeline;
var path = require('path');
var convert = require('../../lib/convert');
var writeUris = require('../../lib/writeUris');

var DeveloperError = Cesium.DeveloperError;

var objPath = 'specs/data/box-textured/box-textured.obj';
var gltfPath = 'specs/data/box-textured/box-textured.gltf';
var glbPath = 'specs/data/box-textured/box-textured.glb';
var objPathInvalid = 'invalid/';
var gltfPathInvalid = 'invalid/model.invalid';
var objPathNonExistent = 'specs/data/non-existent.obj';
var objExternalResourcesPath = 'specs/data/box-external-resources/box-external-resources.obj';

describe('convert', function() {
    it('converts an obj to gltf', function(done) {
        var spy = spyOn(GltfPipeline, 'processJSONToDisk');
        expect(convert(objPath, gltfPath)
            .then(function() {
                var args = spy.calls.first().args;
                var gltf = args[0];
                var outputPath = args[1];
                expect(path.normalize(outputPath)).toEqual(path.normalize(gltfPath));
                expect(gltf).toBeDefined();
                expect(gltf.images.cesium).toBeDefined();
            }), done).toResolve();
    });

    it('uses default gltf-pipeline options', function(done) {
        var spy = spyOn(GltfPipeline, 'processJSONToDisk');
        expect(convert(objPath, gltfPath)
            .then(function() {
                var args = spy.calls.first().args;
                var options = args[2];
                expect(options).toEqual({
                    createDirectory : false,
                    basePath : path.dirname(objPath),
                    binary : false,
                    embed : true,
                    embedImage : true,
                    encodeNormals : false,
                    quantize : false,
                    compressTextureCoordinates : false,
                    aoOptions : undefined,
                    kmcOptions : undefined,
                    smoothNormals : false,
                    optimizeForCesium : false,
                    textureCompressionOptions : undefined,
                    preserve : true
                });
            }), done).toResolve();
    });

    it('sets options', function(done) {
        var spy1 = spyOn(GltfPipeline, 'processJSONToDisk');
        var spy2 = spyOn(writeUris, '_outputFile');
        var textureCompressionOptions = {
            format : 'dxt1',
            quality : 10
        };
        var options = {
            binary : true,
            separate : true,
            separateTextures : true,
            compress : true,
            optimize : true,
            optimizeForCesium : true,
            generateNormals : true,
            ao : true,
            kmc : true,
            textureCompressionOptions : textureCompressionOptions,
            hasTransparency : true,
            secure : true,
            logger : convert.defaults.logger
        };

        expect(convert(objPath, gltfPath, options)
            .then(function() {
                var args = spy1.calls.first().args;
                var options = args[2];
                expect(options).toEqual({
                    createDirectory : false,
                    basePath : path.dirname(objPath),
                    binary : true,
                    embed : false,
                    embedImage : false,
                    encodeNormals : true,
                    quantize : true,
                    compressTextureCoordinates : true,
                    aoOptions : {},
                    kmcOptions : {},
                    smoothNormals : true,
                    optimizeForCesium : true,
                    textureCompressionOptions : textureCompressionOptions,
                    preserve : false
                });
                expect(spy2.calls.count()).toBe(2); // Saves out .png and .bin
            }), done).toResolve();
    });

    it('saves as binary if gltfPath has a .glb extension', function(done) {
        var spy = spyOn(GltfPipeline, 'processJSONToDisk');
        expect(convert(objPath, glbPath)
            .then(function() {
                var args = spy.calls.first().args;
                var options = args[2];
                expect(options.binary).toBe(true);
            }), done).toResolve();
    });

    it('bypassPipeline flag bypasses gltf-pipeline', function(done) {
        var spy1 = spyOn(convert, '_outputJson');
        var spy2 = spyOn(GltfPipeline, 'processJSONToDisk');
        var options = {
            bypassPipeline : true
        };
        expect(convert(objPath, gltfPath, options)
            .then(function() {
                expect(spy1.calls.count()).toBe(1);
                expect(spy2.calls.count()).toBe(0);
            }), done).toResolve();
    });

    it('uses a custom logger', function(done) {
        var spy = spyOn(GltfPipeline, 'processJSONToDisk');
        var logCount = 0;
        var options = {
            secure : true, // Needs to be set to trigger messages
            logger : function() {
                logCount++;
            }
        };
        expect(convert(objExternalResourcesPath, gltfPath, options)
            .then(function() {
                expect(logCount).toEqual(2);
            }), done).toResolve();
    });

    it('rejects if objPath is undefined', function(done) {
        expect(convert(undefined, gltfPath), done).toRejectWith(DeveloperError);
    });

    it('rejects if gltfPath is undefined', function(done) {
        expect(convert(objPath, undefined), done).toRejectWith(DeveloperError);
    });

    it('rejects if obj path is invalid', function(done) {
        expect(convert(objPathInvalid, gltfPath), done).toRejectWith(DeveloperError);
    });

    it('rejects if gltf path is invalid', function(done) {
        expect(convert(objPath, gltfPathInvalid), done).toRejectWith(DeveloperError);
    });

    it('rejects if obj path does not exist', function(done) {
        expect(convert(objPathNonExistent, gltfPath), done).toRejectWith(Error);
    });
});
