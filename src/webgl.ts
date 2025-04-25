// This example creates an HTML canvas which uses WebGL to
// render spinning confetti using JavaScript. We're going
// to walk through the code to understand how it works, and
// see how TypeScript's tooling provides useful insight.

// This example builds off: example:working-with-the-dom

// First up, we need to create an HTML canvas element, which
// we do via the DOM API and set some inline style attributes:

const canvas = document.getElementById("3d-canvas") as HTMLCanvasElement;
canvas.style.backgroundColor = "#EEEEEE";

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
gl.shaderSource(
  vertexShader,
  `
attribute vec2 a_position;
uniform mat4 u_matrix;

void main() {
    gl_Position = u_matrix * vec4(a_position, 0, 1);
}
`
);
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
gl.shaderSource(
  fragmentShader,
  `
precision mediump float;

void main() {
    gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);  // Solid gray color
}
`
);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error('Fragment shader compilation failed:', gl.getShaderInfoLog(fragmentShader));
}

// After the first fragment shader setup, add new shaders for wireframe

// Vertex shader can be reused for both fill and wireframe

// Add new fragment shader for wireframe
const wireframeFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
if (!wireframeFragmentShader) {
  throw new Error("Failed to create wireframe fragment shader");
}
gl.shaderSource(
  wireframeFragmentShader,
  `
precision mediump float;

void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);  // Black color for lines
}
`
);
gl.compileShader(wireframeFragmentShader);
if (!gl.getShaderParameter(wireframeFragmentShader, gl.COMPILE_STATUS)) {
    console.error('Wireframe fragment shader compilation failed:', gl.getShaderInfoLog(wireframeFragmentShader));
}

// Create second shader program for wireframe
const wireframeProgram = gl.createProgram();
gl.attachShader(wireframeProgram, vertexShader);  // Reuse vertex shader
gl.attachShader(wireframeProgram, wireframeFragmentShader);
gl.linkProgram(wireframeProgram);
if (!gl.getProgramParameter(wireframeProgram, gl.LINK_STATUS)) {
    console.error('Wireframe program linking failed:', gl.getProgramInfoLog(wireframeProgram));
}

// Get locations for wireframe program
const wireframePositionLocation = gl.getAttribLocation(wireframeProgram, "a_position");
const wireframeMatrixLocation = gl.getUniformLocation(wireframeProgram, "u_matrix");

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
function createGeometry(nIters: number) {
    const points_per_side = 2 ** nIters + 1;
    const vertices: number[] = [];
    const indices: number[] = [];
    
    // Match the original canvas parameters
    const sideLength = 0.75;
    const rectangleHeight = sideLength * Math.sqrt(3) / 2;
    const scale = 0.95; // Increase scale to fit viewport better

    for (let i = 0; i < points_per_side; i++) {
        for (let j = 0; j < points_per_side; j++) {
            const normalizedY = i / (points_per_side - 1);
            const normalizedX = j / (points_per_side - 1);
            
            const centeredY = (normalizedY - 0.5) * scale;
            const centeredX = (normalizedX - 0.5) * scale;
            
            // Apply shear transform in the opposite direction
            const shearAmount = centeredY * 0.5; // Removed negative sign
            const finalX = (centeredX + shearAmount) * sideLength;
            const finalY = centeredY * rectangleHeight;
            
            vertices.push(finalX, finalY);
        }
    }

    // Generate triangle indices (unchanged)
    for (let i = 0; i < points_per_side - 1; i++) {
        for (let j = 0; j < points_per_side - 1; j++) {
            const topLeft = i * points_per_side + j;
            const topRight = topLeft + 1;
            const bottomLeft = (i + 1) * points_per_side + j;
            const bottomRight = bottomLeft + 1;

            indices.push(topLeft, topRight, bottomLeft);    // First triangle
            indices.push(bottomLeft, topRight, bottomRight); // Second triangle
        }
    }

    return { vertices, indices };
}

// Create geometry with 3 iterations to match canvas version
const geometry = createGeometry(3);

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

// Adjust projection matrix to match the aspect ratio
const projectionMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

// Modify drawScene to draw both filled triangles and wireframe
function drawScene() {
    if (!gl) return;

    // Clear with light background
    gl.clearColor(0.93, 0.93, 0.93, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // First draw filled triangles
    gl.useProgram(shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);
    gl.uniformMatrix4fv(matrixLocation, false, projectionMatrix);
    gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);

    // Then draw wireframe
    gl.useProgram(wireframeProgram);
    gl.vertexAttribPointer(wireframePositionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(wireframePositionLocation);
    gl.uniformMatrix4fv(wireframeMatrixLocation, false, projectionMatrix);

    // Draw lines for each triangle
    gl.lineWidth(1);  // Set line width
    for (let i = 0; i < geometry.indices.length; i += 3) {
        const indices = geometry.indices.slice(i, i + 3);
        gl.drawElements(gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, i * 2);
    }
}

// Initial draw
drawScene();

// Add the new canvas element into the bottom left
// of the playground
document.body.appendChild(canvas);

// Credit: based on this JSFiddle by Subzey
// https://jsfiddle.net/subzey/52sowezj/

class WebGLMountains {
    private nIters: number = 0;
    private showWireframe: boolean = true;
    private gl: WebGLRenderingContext;
    private vertexShader: WebGLShader;
    private fragmentShader: WebGLShader;
    private wireframeFragmentShader: WebGLShader;
    private shaderProgram: WebGLProgram;
    private wireframeProgram: WebGLProgram;
    private vertexBuffer: WebGLBuffer | null = null;
    private indexBuffer: WebGLBuffer | null = null;
    private geometry: { vertices: number[], indices: number[] };
    private canvas: HTMLCanvasElement;

    constructor() {
        // Initialize canvas and WebGL context
        this.canvas = document.getElementById("3d-canvas") as HTMLCanvasElement;
        this.canvas.style.backgroundColor = "#EEEEEE";
        this.canvas.width = 400;
        this.canvas.height = 400;

        const gl = this.canvas.getContext("webgl");
        if (!gl) throw new Error("WebGL not supported");
        this.gl = gl;

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

    private setupControls(): void {
        const iterInput = document.getElementById('webgl-n-iters') as HTMLInputElement;
        const wireframeCheckbox = document.getElementById('show-wireframe') as HTMLInputElement;

        iterInput.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            this.updateNIters(parseInt(target.value));
        });

        wireframeCheckbox.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            this.showWireframe = target.checked;
            this.drawScene();
        });

        // Set initial values
        this.updateNIters(parseInt(iterInput.value));
        this.showWireframe = wireframeCheckbox.checked;
    }

    private initShaders(): void {
        // Create and compile vertex shader
        this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER)!;
        this.gl.shaderSource(this.vertexShader, `
            attribute vec2 a_position;
            uniform mat4 u_matrix;

            void main() {
                gl_Position = u_matrix * vec4(a_position, 0, 1);
            }
        `);
        this.gl.compileShader(this.vertexShader);

        // Create and compile fragment shaders
        this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
        this.gl.shaderSource(this.fragmentShader, `
            precision mediump float;
            void main() {
                gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
            }
        `);
        this.gl.compileShader(this.fragmentShader);

        this.wireframeFragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
        this.gl.shaderSource(this.wireframeFragmentShader, `
            precision mediump float;
            void main() {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
        `);
        this.gl.compileShader(this.wireframeFragmentShader);

        // Create shader programs
        this.shaderProgram = this.gl.createProgram()!;
        this.gl.attachShader(this.shaderProgram, this.vertexShader);
        this.gl.attachShader(this.shaderProgram, this.fragmentShader);
        this.gl.linkProgram(this.shaderProgram);

        this.wireframeProgram = this.gl.createProgram()!;
        this.gl.attachShader(this.wireframeProgram, this.vertexShader);
        this.gl.attachShader(this.wireframeProgram, this.wireframeFragmentShader);
        this.gl.linkProgram(this.wireframeProgram);
    }

    private updateNIters(value: number): void {
        this.nIters = value;
        this.geometry = this.createGeometry(this.nIters);
        this.setupBuffers();
        this.drawScene();
    }

    private setupBuffers(): void {
        // Set up vertex buffer
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.geometry.vertices), this.gl.STATIC_DRAW);

        // Set up index buffer
        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.geometry.indices), this.gl.STATIC_DRAW);
    }

    private createGeometry(nIters: number) {
        const points_per_side = 2 ** nIters + 1;
        const vertices: number[] = [];
        const indices: number[] = [];
        
        const sideLength = 0.75;
        const rectangleHeight = sideLength * Math.sqrt(3) / 2;
        const scale = 0.95;

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

                indices.push(topLeft, topRight, bottomLeft);    // First triangle
                indices.push(bottomLeft, topRight, bottomRight); // Second triangle
            }
        }

        return { vertices, indices };
    }

    private drawScene(): void {
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
        const positionLocation = this.gl.getAttribLocation(this.shaderProgram, "a_position");
        const matrixLocation = this.gl.getUniformLocation(this.shaderProgram, "u_matrix");

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.uniformMatrix4fv(matrixLocation, false, projectionMatrix);
        this.gl.drawElements(this.gl.TRIANGLES, this.geometry.indices.length, this.gl.UNSIGNED_SHORT, 0);

        // Draw wireframe if enabled
        if (this.showWireframe) {
            this.gl.useProgram(this.wireframeProgram);
            const wireframePositionLocation = this.gl.getAttribLocation(this.wireframeProgram, "a_position");
            const wireframeMatrixLocation = this.gl.getUniformLocation(this.wireframeProgram, "u_matrix");

            this.gl.vertexAttribPointer(wireframePositionLocation, 2, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(wireframePositionLocation);
            this.gl.uniformMatrix4fv(wireframeMatrixLocation, false, projectionMatrix);

            for (let i = 0; i < this.geometry.indices.length; i += 3) {
                this.gl.drawElements(this.gl.LINE_LOOP, 3, this.gl.UNSIGNED_SHORT, i * 2);
            }
        }
    }
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebGLMountains();
});