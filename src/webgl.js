"use strict";
// This example creates an HTML canvas which uses WebGL to
// render spinning confetti using JavaScript. We're going
// to walk through the code to understand how it works, and
// see how TypeScript's tooling provides useful insight.
// This example builds off: example:working-with-the-dom
// First up, we need to create an HTML canvas element, which
// we do via the DOM API and set some inline style attributes:
const canvas = document.getElementById("3d-canvas");
canvas.style.backgroundColor = "#EEEEEE";
canvas.width = 800; // or whatever size you want
canvas.height = 800;
// Tell the canvas element that we will use WebGL to draw
// inside the element (and not the default raster engine):
const gl = canvas.getContext("webgl");
if (!gl) {
    throw new Error("WebGL not supported");
}
// Next we need to create vertex shaders - these roughly are
// small programs that apply maths to a set of incoming
// array of vertices (numbers).
// You can see the large set of attributes at the top of the shader,
// these are passed into the compiled shader further down the example.
// There's a great overview on how they work here:
// https://webglfundamentals.org/webgl/lessons/webgl-how-it-works.html
// Simplified vertex shader that just handles position
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
if (!vertexShader) {
    throw new Error("Failed to create vertex shader");
}
gl.shaderSource(vertexShader, `
attribute vec2 a_position;
uniform mat4 u_matrix;

void main() {
    gl_Position = u_matrix * vec4(a_position, 0, 1);
}
`);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error('Vertex shader compilation failed:', gl.getShaderInfoLog(vertexShader));
}
// This example also uses fragment shaders - a fragment
// shader is another small program that runs through every
// pixel in the canvas and sets its color.
// In this case, if you play around with the numbers you can see how
// this affects the lighting in the scene, as well as the border
// radius on the confetti:
// Simple fragment shader that uses a fixed color
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
if (!fragmentShader) {
    throw new Error("Failed to create fragment shader");
}
gl.shaderSource(fragmentShader, `
precision mediump float;

void main() {
    gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);  // Solid gray color
}
`);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error('Fragment shader compilation failed:', gl.getShaderInfoLog(fragmentShader));
}
// Takes the compiled shaders and adds them to the canvas'
// WebGL context so that can be used:
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Program linking failed:', gl.getProgramInfoLog(shaderProgram));
}
gl.useProgram(shaderProgram);
// Simplified attribute setup - we only need position
const positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
const matrixLocation = gl.getUniformLocation(shaderProgram, "u_matrix");
// Create the same vertices and indices as in FractalMountains
function createGeometry(nIters) {
    const points_per_side = 2 ** nIters + 1;
    const vertices = [];
    const indices = [];
    // Scale factors to fit in clip space (-1 to 1)
    const scale = 0.8; // Make it slightly smaller than the full canvas
    for (let i = 0; i < points_per_side; i++) {
        for (let j = 0; j < points_per_side; j++) {
            const normalizedY = i / (points_per_side - 1);
            const normalizedX = j / (points_per_side - 1);
            // Convert to clip space (-1 to 1)
            const y = (normalizedY * 2 - 1) * scale;
            const x = (normalizedX * 2 - 1) * scale;
            // Apply shear transform
            const shearAmount = -y * 0.5;
            const finalX = x + shearAmount;
            vertices.push(finalX, y);
        }
    }
    // Generate triangle indices (unchanged)
    for (let i = 0; i < points_per_side - 1; i++) {
        for (let j = 0; j < points_per_side - 1; j++) {
            const topLeft = i * points_per_side + j;
            const topRight = topLeft + 1;
            const bottomLeft = (i + 1) * points_per_side + j;
            const bottomRight = bottomLeft + 1;
            indices.push(topLeft, bottomLeft, bottomRight);
            indices.push(topLeft, bottomRight, topRight);
        }
    }
    return { vertices, indices };
}
// Create geometry with fewer iterations to start
const geometry = createGeometry(2); // Start with 2 iterations for testing
// Set up vertex buffer
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.vertices), gl.STATIC_DRAW);
// Set up index buffer
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);
// Enable alpha blending
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
// Simple orthographic projection matrix
const projectionMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];
// Draw scene
function drawScene() {
    if (!gl)
        return;
    // Clear with light background
    gl.clearColor(0.93, 0.93, 0.93, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);
    gl.uniformMatrix4fv(matrixLocation, false, projectionMatrix);
    gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
}
// Initial draw
drawScene();
// Add the new canvas element into the bottom left
// of the playground
document.body.appendChild(canvas);
// Credit: based on this JSFiddle by Subzey
// https://jsfiddle.net/subzey/52sowezj/
