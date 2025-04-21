class FractalMountains {
    private nIters: number = 0;
    private ctx: CanvasRenderingContext2D | null = null;
    private canvas: HTMLCanvasElement | null = null;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        const input = document.getElementById('n-iters') as HTMLInputElement;
        this.canvas = document.getElementById('triangle-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d');
        // Set initial value
        this.updateNIters(input.value);

        // Add event listener for changes
        input.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            this.updateNIters(target.value);
        });
    }

    private updateNIters(value: string): void {
        this.nIters = parseInt(value);
        this.computeVertices();
        console.log('Number of iterations updated to:', this.nIters);
    }

    private computeVertices(): void {
        // Create a 2D array of size n×n using Array(n).fill()
        const points_per_side = 2 ** this.nIters + 1;
        const vertices: number[][] = Array(points_per_side).fill(null).map(() => 
            Array(points_per_side).fill(0)
        );
        
        this.drawVertices(vertices);
    }

    private drawVertices(vertices: number[][]): void {
        if (!this.ctx || !this.canvas) return;

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
                
                this.ctx!.beginPath();
                this.ctx!.arc(x, y, 2, 0, Math.PI * 2);
                this.ctx!.fill();
            });
        });
    }
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FractalMountains();
}); 