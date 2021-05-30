const fs = require('fs');
const zip = require('jszip');

class Serializer {
    constructor(editor) {

        this.__editor = editor;

    }

    save(filepath) {
        var extra = {
            containers: []
        };

        var properties = {
            places: [],
            transitions: [],
            arcs: []
        };

        for (var iArtifact in this.__editor.artifacts) {

            if (this.__editor.artifacts[iArtifact].type == PLACE) {
                properties.places.push(this.__editor.artifacts[iArtifact].serialize);
            } else if (this.__editor.artifacts[iArtifact].type == TRANSITION) {
                properties.transitions.push(this.__editor.artifacts[iArtifact].serialize);
            } else if (this.__editor.artifacts[iArtifact].type == CONTAINER) {
                extra.containers.push(this.__editor.artifacts[iArtifact].serialize);
            }

            if (this.__editor.artifacts[iArtifact].sourceArcs.length > 0) {
                properties.arcs = properties.arcs.concat(this.__editor.artifacts[iArtifact].serializeArcs);
            }

        }

        let zipFile = new zip();
        let folder = zipFile.folder('');

        let zipFolder = zipFile.folder('');

        zipFolder.file(`pipe.json`, JSON.stringify(properties), {
            comment: "Generated by Pipe - JSON File"
        });

        zipFolder.file(`xtra.json`, JSON.stringify(extra), {
            comment: "Generated by Pipe - JSON File"
        });

        zipFile
            .generateNodeStream({ streamFiles: true })
            .pipe(fs.createWriteStream(filepath))
            .on('finish', function() {});

    }

    load(filepath) {

        function getBlob(file) {

            return new Promise(resolve => {
                file.async("blob").then(function(blob) {
                    resolve(blob);
                });

            });

        }

        function readBlob(url) {

            return new Promise(resolve => {
                var reader = new FileReader();

                reader.onload = function() {
                    resolve(reader.result);
                }

                reader.readAsText(url);

            });

        }

        function create(__this, artifacts, decorator = null) {
            var objects = [];

            for (var iArtifact in artifacts) {
                var artifact = artifacts[iArtifact];
                var creator = __this.__editor.creators[artifact['type']];

                var object = creator(artifact['center'], artifact['id'], artifact['label']);

                if ('tokens' in object) {
                    object.tokens = artifact['tokens'];
                }

                if ('color' in object) {
                    object.color = ('color' in artifact) ? artifact['color'] : 'rgba(255, 255, 255, 1.0)';
                }
                if (decorator) {
                    decorator(artifact, object);
                }

                if ('release' in object) {
                    object.release();
                }

                object.selected = false;
                object.selectable = false;

            }

        }

        function link(__this, arcs) {

            for (var iArcs in arcs) {

                if (arcs[iArcs].hasOwnProperty('source')) {
                    var source = __this.__editor.artifactMap[arcs[iArcs]['target']];
                    var target = __this.__editor.artifactMap[arcs[iArcs]['source']];
                    var type = 0;

                    if (arcs[iArcs].hasOwnProperty('usage')) {
                        type = arcs[iArcs]['usage'] == "inhibit" ? 1 : 0;
                    }

                    var arc = source.addSource(type, target);

                    target.addTarget(type, source, arc);

                    var segments = arcs[iArcs]['segments'];

                    for (var iSegment in segments) {
                        var segment = segments[iSegment];

                        arc.segments.push(new Segment(segment));

                    }

                }

            }

        }

        var __this = this;

        __this.__editor.clear();

        fs.readFile(filepath, function(err, data) {
            var zipFile = new zip();

            zipFile.loadAsync(data).then(async function(zipFile) {

                zipFile.forEach(async function(relativePath, zipEntry) {

                    if (zipEntry.dir) {} else {
                        let fileUrl = await getBlob(zipEntry);
                        let data = await readBlob(fileUrl);
                        let artifacts = JSON.parse(data);

                        if (zipEntry.name == 'pipe.json') {

                            create(__this, artifacts.places);
                            create(__this, artifacts.transitions);

                            link(__this, artifacts.arcs);

                        } else if (zipEntry.name == 'xtra.json') {
                            create(__this, artifacts.containers, function(artifact, object) {

                                object.decorate(artifact);

                            });


                        }
                        __this.__editor.moveArtifacts = false;
                        __this.__editor.draw();
                        __this.__editor.focus();


                    }



                });

            });


        });

    };

}