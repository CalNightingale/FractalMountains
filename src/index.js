"use strict";
class FractalMountains {
    constructor() {
        this.nIters = 0;
        this.ctx = null;
        this.canvas = null;
        this.initialize();
    }
    initialize() {
        const input = document.getElementById('n-iters');
        this.canvas = document.getElementById('triangle-canvas');
        this.ctx = this.canvas.getContext('2d');
        // Set initial value
        this.updateNIters(input.value);
        // Add event listener for changes
        input.addEventListener('change', (e) => {
            const target = e.target;
            this.updateNIters(target.value);
        });
    }
    updateNIters(value) {
        this.nIters = parseInt(value);
        this.computeVertices();
        console.log('Number of iterations updated to:', this.nIters);
    }
    computeVertices() {
        // Create a 2D array of size n×n using Array(n).fill()
        const points_per_side = 2 ** this.nIters + 1;
        const vertices = Array(points_per_side).fill(null).map(() => Array(points_per_side).fill(0));
        this.drawVertices(vertices);
    }
    drawVertices(vertices) {
        if (!this.ctx || !this.canvas)
            return;
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Set drawing styles
        this.ctx.fillStyle = 'black';
        this.ctx.strokeStyle = 'black';
        // Calculate border size (10% of canvas width/height)
        const borderSize = this.canvas.width * 0.1;
        // Calculate available space for drawing (accounting for borders)
        const drawingWidth = this.canvas.width - (borderSize * 2);
        const spacing = drawingWidth / (vertices.length - 1);
        // Define rhombus parameters (matching vertex shader)
        const sideLength = 0.75;
        const sqrt3Over2 = Math.sqrt(3) / 2;
        const rectangleHeight = sideLength * sqrt3Over2;
        // Draw each vertex as a small circle
        vertices.forEach((row, i) => {
            row.forEach((height, j) => {
                // Calculate normalized coordinates (0 to 1)
                const normalizedY = i / (vertices.length - 1);
                const normalizedX = j / (vertices.length - 1);
                // Center coordinates (-0.5 to 0.5)
                const centeredY = normalizedY - 0.5;
                const centeredX = normalizedX - 0.5;
                // Scale to create rectangle of correct dimensions
                const scaledY = centeredY * rectangleHeight * drawingWidth;
                const scaledX = centeredX * sideLength * drawingWidth;
                // Apply horizontal shear based on y coordinate
                const shearAmount = -scaledY / (rectangleHeight * drawingWidth) * 0.5 * sideLength * drawingWidth;
                // Calculate final position
                const x = borderSize + (drawingWidth / 2) + scaledX + shearAmount;
                const y = borderSize + (drawingWidth / 2) + scaledY;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            });
        });
    }
}
// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FractalMountains();
});
