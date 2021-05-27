'use strict'

require('electron-disable-file-drop');

const { ipcRenderer } = require('electron');
const $ = require('jquery');

var filename = "pipe.zip";

var serializer = null;

var modes = {};

var environment = {
    mode: 0,
    connector: 0,
    decorate: true,
    editors: true,
    selectable: true,
    playable: false,
    grid: true,
    artifacts: [],
    artifactMap: {},
    arcMap: {},
    arcNodeMap: {},
    placeStateMap: {},
    activeTransitionMap: {},
    joinEnabled: function(enable) {

        if (enable) {
            $('#join-place-transition').css('opacity', '1.0');
            $('#join-transition-place').css('opacity', '1.0');
        } else {
            $('#join-place-transition').css('opacity', '0.6');
            $('#join-transition-place').css('opacity', '0.6');
        }

    }

}

const EDITOR = 0;
const PLAYER = 1;

function leave(id) {

    modes[environment.mode].leave(id);

}

function redraw(id) {

    modes[environment.mode].redraw(id);

}

/**
 * Get the Canvas Mouse Position
 * 
 * @param {canvas} canvas the Canvas
 * @param {event} evt the Mouse Event 
 */
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };

}

function load() {
    let zipFile = new zip();
    let folder = zipFile.folder('');

    let result = ipcRenderer.sendSync('showOpenDialog');

    if (!result.canceled) {
        let filepath = result.filePaths[0];

        $('#filename').text(`${filepath}`);

        serializer.load(filepath);

    }

    document.getElementById("dropdown").classList.remove('show');
    document.getElementById("dropdown").classList.toggle("view");

}

function save() {
    let result = ipcRenderer.sendSync('showSaveDialog', (filename == null ? 'pipe.zip' : filename));

    if (!result.canceled) {
        filename = result.filePath;

        $('#filename').text(`${filename}`);

        serializer.save(filename);

    }

    document.getElementById("dropdown").classList.remove('show');
    document.getElementById("dropdown").classList.toggle("view");

}

/**
 * Respond to the Document 'ready' event
 */
$(async() => {
    function loadImage(src) {

        return new Promise(async(accept, reject) => {
            var image = new Image();
            image.onload = function() {
                accept(image);
                return
            }

            image.src = src

        })

    }

    var canvas = document.getElementById('canvas');

    canvas.style.width = ($(window).width() - 40) + 'px'
    canvas.style.height = ($(window).height() - 36) + 'px';

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    var context = canvas.getContext('2d');

    var rect = canvas.getBoundingClientRect();

    context.clearRect(rect.x, rect.y, rect.width, rect.height);

    $('#direct').css('color', 'rgba(0, 0, 0, 1.0)');

    var images = [];

    images.push(await loadImage(`assets/images/plus.png`));
    images.push(await loadImage(`assets/images/minus.png`));
    images.push(await loadImage(`assets/images/paint-bucket-small.png`));
    images.push(await loadImage(`assets/images/edit-icon.png`));

    environment.mode = EDITOR;

    modes[EDITOR] = new Editor('frame', canvas, 'placeholder', images, environment);
    serializer = new Serializer(modes[EDITOR]);

    modes[PLAYER] = new Player('frame', canvas, images, environment);

    modes[environment.mode].draw();

    $('#canvas')[0].addEventListener('mouseup', (event) => {
        modes[environment.mode].mouseup(event);
    });

    $('#canvas')[0].addEventListener('mousemove', (event) => {
        modes[environment.mode].mousemove(event);
    });

    $('#canvas')[0].addEventListener('mousedown', (event) => {
        modes[environment.mode].mousedown(event);
    });

    $('#canvas')[0].addEventListener('click', (event) => {
        modes[environment.mode].click(event);
    });

    $('#canvas')[0].addEventListener('dblclick', (event) => {
        modes[environment.mode].dblclick(event);
    });

    $(window).on('resize', (event) => {
        modes[environment.mode].draw();
    });

    $(window).on('keydown', function(event) {

        if (event.target.tagName != "BODY") {
            return;
        }

        modes[environment.mode].keydown(event);

    });

    $(window).on('keyup', function(event) {

        if (event.target.tagName != "BODY") {
            return;
        }

        modes[environment.mode].keyup(event);

    });

    $(window).on('click', function(event) {

        if (document.getElementById("dropdown").classList.contains('show')) {
            document.getElementById("dropdown").classList.remove('show');
            document.getElementById("dropdown").classList.toggle("view");
        } else if (document.getElementById("dropdown").classList.contains('view')) {
            document.getElementById("dropdown").classList.remove('view');
        }

    });

    $(document).on('mouseout', function(event) {

        modes[environment.mode].mouseout(event);

    });

    $("#window-minimize").on('click', async(e) => {

        ipcRenderer.send('minimize');

    });

    $("#window-maximize").on('click', async(e) => {
        var isMaximized = ipcRenderer.sendSync('isMaximized');

        if (!isMaximized) {
            $("#window-maximize").addClass("fa-window-restore");
            $("#window-maximize").removeClass("fa-square");
            ipcRenderer.send('maximize');
        } else {
            $("#window-maximize").removeClass("fa-window-restore");
            $("#window-maximize").addClass("fa-square");
            ipcRenderer.send('unmaximize');
        }

    });

    $("#quit").on('click', async(e) => {

        ipcRenderer.send('quit');

    });

    $("#place_mode")[0].ondragstart = function(event) {

        event.dataTransfer.setData("Text", event.target.id);

        $(".actions").css({
            "border-color": "rgba(255,255,255,1.0)",
            "background-color": "rgba(255,255,255,1.0)"
        });

        $('#place').css({
            "border-color": "rgba(0,0,0,0.1)",
            "background-color": "rgba(0,0,0,0.1)"
        });

    }

    $("#transition_mode")[0].ondragstart = function(event) {

        event.dataTransfer.setData("Text", event.target.id);

        $(".actions").css({
            "border-color": "rgba(255,255,255,1.0)",
            "background-color": "rgba(255,255,255,1.0)"
        });

        $('#transition').css({
            "border-color": "rgba(0,0,0,0.1)",
            "background-color": "rgba(0,0,0,0.1)"
        });

    }

    $("#container_mode")[0].ondragstart = function(event) {

        event.dataTransfer.setData("Text", event.target.id);

        $(".actions").css({
            "border-color": "rgba(255,255,255,1.0)",
            "background-color": "rgba(255,255,255,1.0)"
        });

        $('#container').css({
            "border-color": "rgba(0,0,0,0.1)",
            "background-color": "rgba(0,0,0,0.1)"
        });

    }

    $("#canvas")[0].ondrop = function(event) {

        modes[environment.mode].ondrop(event);

    }

    $('#menu-save').on('click', (e) => {

        save();

        return false;

    });

    $('#save').on('click', (e) => {

        save();

    });

    $('#menu-load').on('click', (e) => {

        environment.mode = 0;

        load();

        return false;

    });


    $('#load').on('click', (e) => {

        environment.mode = 0;

        load();

    });

    $('#menu-clear').on('click', (e) => {

        for (var iMode in modes) {
            modes[iMode].clear();
        }

        document.getElementById("dropdown").classList.remove('show');
        document.getElementById("dropdown").classList.toggle("view");

        return false;

    });

    $('#menu').on('click', (e) => {

        document.getElementById("dropdown").classList.toggle("show");

    })

    $('#toggle-grid').on('click', (e) => {

        environment.grid = environment.grid ? false : true;
        modes[environment.mode].draw();

        return false;

    });

    $('#toggle-editors').on('click', (e) => {

        environment.editors = environment.editors ? false : true;
        modes[environment.mode].draw();

        return false;

    });

    $('#play').on('click', (e) => {

        environment.mode = environment.mode == 0 ? 1 : 0;

        modes[environment.mode].notify();
        modes[environment.mode].draw();

    });


    $('#direct').on('click', (e) => {
        $('#direct').css("color", "rgba(0, 0, 0, 1.0)");
        $('#inhibit').css("color", "rgba(0, 0, 0, 0.4)");

        environment.connector = 0;

    });

    $('#inhibit').on('click', (e) => {
        $('#direct').css("color", "rgba(0, 0, 0, 0.4)");
        $('#inhibit').css("color", "rgba(0, 0, 0, 1.0)");

        environment.connector = 1;

    });

    $('#fill').on('click', (e) => {
        var node = document.createElement("div");
        $(`#toolbar`)[0].appendChild(node);

        node.setAttribute('style', `display:inline-block; position:absolute; ` +
            `left: ${$('#fill').offset().left + 30}px; ` +
            `top: ${$('#fill').offset().top}px;` +
            `z-index: 2; padding:4px;"`);

        var picker = new Picker({
            parent: node,
            color: transition.__color,
            onDone: function(color) {

                if ('fill' in modes[environment.mode]) {
                    modes[environment.mode].fill(color.rgbaString)
                }
                modes[environment.mode].draw();

            },
            onClose: function(color) {
                $('#toolbar')[0].removeChild(node);
                modes[environment.mode].draw();
            }

        });

        picker.openHandler();

    });

    $('#join-place-transition').on('click', (e) => {

        if ('join' in modes[environment.mode]) {
            modes[environment.mode].join(PLACE, TRANSITION);
        }

    });

    $('#join-transition-place').on('click', (e) => {

        if ('join' in modes[environment.mode]) {
            modes[environment.mode].join(TRANSITION, PLACE);
        }

    });

});