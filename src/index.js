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
        const points_per_side = 2 ** this.nIters + 1;
        const vertices = Array(points_per_side).fill(null).map(() => Array(points_per_side).fill(0));
        // Generate triangle indices
        const indices = this.generateTriangleIndices(points_per_side);
        this.drawVertices(vertices, indices);
    }
    generateTriangleIndices(pointsPerSide) {
        const indices = [];
        // For each cell in the grid (except the last row and column)
        for (let i = 0; i < pointsPerSide - 1; i++) {
            for (let j = 0; j < pointsPerSide - 1; j++) {
                // Calculate the indices for two triangles in each cell
                const topLeft = i * pointsPerSide + j;
                const topRight = topLeft + 1;
                const bottomLeft = (i + 1) * pointsPerSide + j;
                const bottomRight = bottomLeft + 1;
                // First triangle (top-left, bottom-left, bottom-right)
                indices.push([topLeft, bottomLeft, bottomRight]);
                // Second triangle (top-left, bottom-right, top-right)
                indices.push([topLeft, bottomRight, topRight]);
            }
        }
        return indices;
    }
    drawVertices(vertices, indices) {
        if (!this.ctx || !this.canvas)
            return;
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Set drawing styles
        this.ctx.fillStyle = 'rgba(200, 200, 200, 0.5)'; // Semi-transparent gray for triangles
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        const borderSize = this.canvas.width * 0.1;
        const drawingWidth = this.canvas.width - (borderSize * 2);
        // Define rhombus parameters
        const sideLength = 0.75;
        // ratio of equilateral triangle height to side length
        const rectangleHeight = sideLength * Math.sqrt(3) / 2;
        // Function to calculate point coordinates
        const calculatePoint = (i, j) => {
            const normalizedY = i / (vertices.length - 1);
            const normalizedX = j / (vertices.length - 1);
            const centeredY = normalizedY - 0.5;
            const centeredX = normalizedX - 0.5;
            const scaledY = centeredY * rectangleHeight * drawingWidth;
            const scaledX = centeredX * sideLength * drawingWidth;
            const shearAmount = -scaledY / (rectangleHeight * drawingWidth) * 0.5 * sideLength * drawingWidth;
            return {
                x: borderSize + (drawingWidth / 2) + scaledX + shearAmount,
                y: borderSize + (drawingWidth / 2) + scaledY
            };
        };
        // Draw triangles
        indices.forEach(triangle => {
            const [i1, i2, i3] = triangle;
            const row1 = Math.floor(i1 / vertices.length);
            const col1 = i1 % vertices.length;
            const row2 = Math.floor(i2 / vertices.length);
            const col2 = i2 % vertices.length;
            const row3 = Math.floor(i3 / vertices.length);
            const col3 = i3 % vertices.length;
            const p1 = calculatePoint(row1, col1);
            const p2 = calculatePoint(row2, col2);
            const p3 = calculatePoint(row3, col3);
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.lineTo(p3.x, p3.y);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        });
        this.ctx.fillStyle = 'red';
        // Draw vertices
        vertices.forEach((row, i) => {
            row.forEach((height, j) => {
                const point = calculatePoint(i, j);
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            });
        });
    }
}
// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FractalMountains();
});
