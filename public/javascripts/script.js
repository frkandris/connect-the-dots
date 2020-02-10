var canvasWidth = 600;
var canvasHeight = 600;

var radius = 5;

var canvas = null;
var bounds = null;
var ctx = null;
var hasLoaded = false;

var startX = 0;
var startY = 0;
var mouseX = 0;
var mouseY = 0;

var isDrawing = true;
var isEditing = false;
var isRemoving = false;
var isSplitting = false;

var isMouseDown = false;

var pointBeingEdited = null;

var existingPoints = [];

if (localStorage.getItem('connect-the-dots')) {
    jsonString = localStorage.getItem('connect-the-dots');
    var existingPoints = JSON.parse(jsonString);
} else {
    existingPoints = [];
}



function render() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.font = "10px Arial";
    ctx.fillStyle= "#000";

    if (existingPoints.length == 0) {
        return;
    } 
    if (existingPoints.length == 1) {
        var endX = existingPoints[0].x;
        var endY = existingPoints[0].y;
    } else {
        for (var i = 0; i < existingPoints.length-1; ++i) {
            var startX = existingPoints[i].x;
            var startY = existingPoints[i].y;
            var endX = existingPoints[i+1].x;
            var endY = existingPoints[i+1].y;
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.fillText(i+2, endX+5, endY-5);
        }
    }

    var startX = existingPoints[0].x;
    var startY = existingPoints[0].y;
    ctx.fillText(1, startX+5, startY-5);

    ctx.stroke();
    
    if (isDrawing) {
        ctx.strokeStyle = "darkred";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
    }

    $('#pointStorage').val(existingPoints);

}

function onmousedown(e) {
    if (hasLoaded && e.button === 0) {
        isMouseDown = true;
    }
}

function onmouseup(e) {
    if (hasLoaded && e.button === 0) {

        isMouseDown = false;

        if (isDrawing) {
            existingPoints.push({
                x: mouseX,
                y: mouseY,
            });
            startX = mouseX;
            startY = mouseY;            
            render();
        }

        if (isEditing) {
            pointBeingEdited = null;
        }

        if (isRemoving) {
            for (var i = 0; i < existingPoints.length; ++i) {

                var x = existingPoints[i].x;
                var y = existingPoints[i].y;
        
                if ( Math.pow(mouseX-x, 2) + Math.pow(mouseY-y, 2) <= Math.pow(radius, 2) ) {
                    existingPoints.splice(i, 1);
                    render();
                }
            }
        }

        if (isSplitting) {
            for (var i = 0; i < existingPoints.length; ++i) {

                var x = existingPoints[i].x;
                var y = existingPoints[i].y;
        
                if ( Math.pow(mouseX-x, 2) + Math.pow(mouseY-y, 2) <= Math.pow(radius, 2) ) {    
                    existingPoints[i].x = x - 10;
                    existingPoints.splice(i, 0, {x: x+10, y: y});
                    render();
                    return;
                }
            }
        }

        var jsonString = JSON.stringify(existingPoints);
        localStorage.setItem('connect-the-dots', jsonString);

    }
}

function onmousemove(e) {
    if (hasLoaded) {

        mouseX = e.clientX - bounds.left;
        mouseY = e.clientY - bounds.top;
        
        if (isDrawing) {
            render();
        }

        if (isEditing) {

            render();

            if (pointBeingEdited == null) {

                for (var i = 0; i < existingPoints.length; ++i) {

                    var x = existingPoints[i].x;
                    var y = existingPoints[i].y;
            
                    if ( Math.pow(mouseX-x, 2) + Math.pow(mouseY-y, 2) <= Math.pow(radius, 2) ) {
                        drawCircle(x, y, radius, "green");

                        // if no point is being edited right now
                        if ((pointBeingEdited == null) && isMouseDown) {
                            // set this point to be the one that is being edited
                            pointBeingEdited = i;
                        }
                    }
                }
            }

            if (isMouseDown && (pointBeingEdited != null))  {
                existingPoints[pointBeingEdited].x = mouseX;
                existingPoints[pointBeingEdited].y = mouseY;
                // drawCircle(mouseX, mouseY, radius, "green");
            }

        }    


        if (isRemoving) {

            render();

            for (var i = 0; i < existingPoints.length; ++i) {

                var x = existingPoints[i].x;
                var y = existingPoints[i].y;
        
                if ( Math.pow(mouseX-x, 2) + Math.pow(mouseY-y, 2) <= Math.pow(radius, 2) ) {
                    drawCircle(x, y, radius, "red");
                }
            }
        }    

        if (isSplitting) {

            render();

            for (var i = 0; i < existingPoints.length; ++i) {

                var x = existingPoints[i].x;
                var y = existingPoints[i].y;
        
                if ( Math.pow(mouseX-x, 2) + Math.pow(mouseY-y, 2) <= Math.pow(radius, 2) ) {
                    drawCircle(x, y, radius, "blue");
                }
            }
        }    


    }
}


function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
}


window.onload = function() {
    canvas = document.getElementById("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.onmousedown = onmousedown;
    canvas.onmouseup = onmouseup;
    canvas.onmousemove = onmousemove;
    
    bounds = canvas.getBoundingClientRect();
    ctx = canvas.getContext("2d");
    hasLoaded = true;
    
    render();
}



$( "#draw-button" ).on( "click", function() {
    isDrawing = true;
    isEditing = false;
    isRemoving = false;
    isSplitting = false;
    render();
    updateButtons();
});

$( "#edit-button" ).on( "click", function() {
    isDrawing = false;
    isEditing = true;
    isRemoving = false;
    isSplitting = false;
    render();
    updateButtons();
});

$( "#remove-button" ).on( "click", function() {
    isDrawing = false;
    isEditing = false;
    isRemoving = true;
    isSplitting = false;
    render();
    updateButtons();
});

$( "#split-button" ).on( "click", function() {
    isDrawing = false;
    isEditing = false;
    isRemoving = false;
    isSplitting = true;
    render();
    updateButtons();
});

$( "#reset-button" ).on( "click", function() {
    isDrawing = true;
    isEditing = false;
    isRemoving = false;
    isSplitting = false;

    existingPoints = [];
    var jsonString = JSON.stringify(existingPoints);
    localStorage.setItem('connect-the-dots', jsonString);

    render();
    updateButtons();
});

$( "#save-button" ).on( "click", function() {
    var jsonString = JSON.stringify(existingPoints);
    download(jsonString, "connect-the-dots.txt", "txt");
});

function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

function updateButtons() {
    if (isDrawing) { 
        $("#draw-button").addClass("btn-primary");
        $("#draw-button").removeClass("btn-secondary");
    } else {
        $("#draw-button").addClass("btn-secondary");
        $("#draw-button").removeClass("btn-primary");
    }
    if (isEditing) { 
        $("#edit-button").addClass("btn-primary");
        $("#edit-button").removeClass("btn-secondary");
    } else {
        $("#edit-button").addClass("btn-secondary");
        $("#edit-button").removeClass("btn-primary");
    }
    if (isRemoving) { 
        $("#remove-button").addClass("btn-primary");
        $("#remove-button").removeClass("btn-secondary");
    } else {
        $("#remove-button").addClass("btn-secondary");
        $("#remove-button").removeClass("btn-primary");
    }
    if (isSplitting) { 
        $("#split-button").addClass("btn-primary");
        $("#split-button").removeClass("btn-secondary");
    } else {
        $("#split-button").addClass("btn-secondary");
        $("#split-button").removeClass("btn-primary");
    }
}