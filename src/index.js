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
        const spacing = this.canvas.width / (vertices.length - 1);
        // Draw each vertex as a small circle
        vertices.forEach((row, i) => {
            row.forEach((height, j) => {
                const x = j * spacing;
                const y = i * spacing;
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
