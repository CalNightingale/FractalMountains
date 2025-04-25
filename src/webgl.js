"use strict";
class WebGLMountains {
    constructor() {
        this.nIters = 0;
        this.showWireframe = true;
        // Buffers
        this.vertexBuffer = null;
        this.indexBuffer = null;
        // Initialize canvas and WebGL context
        this.canvas = document.getElementById("3d-canvas");
        this.canvas.style.backgroundColor = "#EEEEEE";
        const gl = this.canvas.getContext("webgl", {
            antialias: true, // Request antialiasing
            preserveDrawingBuffer: true
        });
        if (!gl)
            throw new Error("WebGL not supported");
        this.gl = gl;
        // Add resize observer
        const resizeObserver = new ResizeObserver(() => {
            this.resizeCanvas();
            this.drawScene();
        });
        resizeObserver.observe(this.canvas);
        // Initial resize
        this.resizeCanvas();
        // Initialize shaders and programs
        this.initShaders();
        // Set up initial geometry
        this.geometry = this.createGeometry(0);
        this.setupBuffers();
        // Enable alpha blending
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        // Set up UI controls
        this.setupControls();
        // Initial draw
        this.drawScene();
    }
    setupControls() {
        const iterSlider = document.getElementById('webgl-n-iters');
        const iterValue = document.getElementById('webgl-n-iters-value');
        const wireframeCheckbox = document.getElementById('show-wireframe');
        iterSlider.addEventListener('input', (e) => {
            const target = e.target;
            iterValue.textContent = target.value;
            this.updateNIters(parseInt(target.value));
        });
        wireframeCheckbox.addEventListener('change', (e) => {
            const target = e.target;
            this.showWireframe = target.checked;
            this.drawScene();
        });
        // Set initial values
        iterValue.textContent = iterSlider.value;
        this.updateNIters(parseInt(iterSlider.value));
        this.showWireframe = wireframeCheckbox.checked;
    }
    initShaders() {
        // Create and compile vertex shader
        this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(this.vertexShader, `
            attribute vec2 a_position;
            uniform mat4 u_matrix;

            void main() {
                gl_Position = u_matrix * vec4(a_position, 0, 1);
            }
        `);
        this.gl.compileShader(this.vertexShader);
        if (!this.gl.getShaderParameter(this.vertexShader, this.gl.COMPILE_STATUS)) {
            console.error('Vertex shader compilation failed:', this.gl.getShaderInfoLog(this.vertexShader));
        }
        // Create and compile fragment shaders
        this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(this.fragmentShader, `
            precision mediump float;
            void main() {
                gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
            }
        `);
        this.gl.compileShader(this.fragmentShader);
        if (!this.gl.getShaderParameter(this.fragmentShader, this.gl.COMPILE_STATUS)) {
            console.error('Fragment shader compilation failed:', this.gl.getShaderInfoLog(this.fragmentShader));
        }
        this.wireframeFragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(this.wireframeFragmentShader, `
            precision mediump float;
            void main() {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
        `);
        this.gl.compileShader(this.wireframeFragmentShader);
        if (!this.gl.getShaderParameter(this.wireframeFragmentShader, this.gl.COMPILE_STATUS)) {
            console.error('Wireframe fragment shader compilation failed:', this.gl.getShaderInfoLog(this.wireframeFragmentShader));
        }
        // Create shader programs
        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, this.vertexShader);
        this.gl.attachShader(this.shaderProgram, this.fragmentShader);
        this.gl.linkProgram(this.shaderProgram);
        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            console.error('Program linking failed:', this.gl.getProgramInfoLog(this.shaderProgram));
        }
        this.wireframeProgram = this.gl.createProgram();
        this.gl.attachShader(this.wireframeProgram, this.vertexShader);
        this.gl.attachShader(this.wireframeProgram, this.wireframeFragmentShader);
        this.gl.linkProgram(this.wireframeProgram);
        if (!this.gl.getProgramParameter(this.wireframeProgram, this.gl.LINK_STATUS)) {
            console.error('Wireframe program linking failed:', this.gl.getProgramInfoLog(this.wireframeProgram));
        }
        // Get shader locations
        this.positionLocation = this.gl.getAttribLocation(this.shaderProgram, "a_position");
        this.matrixLocation = this.gl.getUniformLocation(this.shaderProgram, "u_matrix");
        this.wireframePositionLocation = this.gl.getAttribLocation(this.wireframeProgram, "a_position");
        this.wireframeMatrixLocation = this.gl.getUniformLocation(this.wireframeProgram, "u_matrix");
    }
    updateNIters(value) {
        this.nIters = value;
        this.geometry = this.createGeometry(this.nIters);
        this.setupBuffers();
        this.drawScene();
    }
    setupBuffers() {
        // Set up vertex buffer
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.geometry.vertices), this.gl.STATIC_DRAW);
        // Set up index buffer
        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.geometry.indices), this.gl.STATIC_DRAW);
    }
    createGeometry(nIters) {
        const points_per_side = 2 ** nIters + 1;
        const vertices = [];
        const indices = [];
        const sideLength = 1;
        const rectangleHeight = sideLength * Math.sqrt(3) / 2;
        const scale = 1;
        for (let i = 0; i < points_per_side; i++) {
            for (let j = 0; j < points_per_side; j++) {
                const normalizedY = i / (points_per_side - 1);
                const normalizedX = j / (points_per_side - 1);
                const centeredY = (normalizedY - 0.5) * scale;
                const centeredX = (normalizedX - 0.5) * scale;
                const shearAmount = centeredY * 0.5;
                const finalX = (centeredX + shearAmount) * sideLength;
                const finalY = centeredY * rectangleHeight;
                vertices.push(finalX, finalY);
            }
        }
        for (let i = 0; i < points_per_side - 1; i++) {
            for (let j = 0; j < points_per_side - 1; j++) {
                const topLeft = i * points_per_side + j;
                const topRight = topLeft + 1;
                const bottomLeft = (i + 1) * points_per_side + j;
                const bottomRight = bottomLeft + 1;
                indices.push(topLeft, topRight, bottomLeft); // First triangle
                indices.push(bottomLeft, topRight, bottomRight); // Second triangle
            }
        }
        return { vertices, indices };
    }
    drawScene() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0.93, 0.93, 0.93, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        const projectionMatrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
        // Draw filled triangles
        this.gl.useProgram(this.shaderProgram);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.uniformMatrix4fv(this.matrixLocation, false, projectionMatrix);
        this.gl.drawElements(this.gl.TRIANGLES, this.geometry.indices.length, this.gl.UNSIGNED_SHORT, 0);
        // Draw wireframe if enabled
        if (this.showWireframe) {
            this.gl.useProgram(this.wireframeProgram);
            this.gl.vertexAttribPointer(this.wireframePositionLocation, 2, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(this.wireframePositionLocation);
            this.gl.uniformMatrix4fv(this.wireframeMatrixLocation, false, projectionMatrix);
            for (let i = 0; i < this.geometry.indices.length; i += 3) {
                this.gl.drawElements(this.gl.LINE_LOOP, 3, this.gl.UNSIGNED_SHORT, i * 2);
            }
        }
    }
    resizeCanvas() {
        // Get the device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        // Get the size of the canvas in CSS pixels
        const displayWidth = Math.floor(this.canvas.clientWidth * dpr);
        const displayHeight = Math.floor(this.canvas.clientHeight * dpr);
        // Check if the canvas is not the same size
        if (this.canvas.width !== displayWidth ||
            this.canvas.height !== displayHeight) {
            // Make the canvas the same size
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            // Update the viewport to match
            this.gl.viewport(0, 0, displayWidth, displayHeight);
        }
    }
}
// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebGLMountains();
});
