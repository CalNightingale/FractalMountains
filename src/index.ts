class FractalMountains {
    private nIters: number = 1;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        const input = document.getElementById('n-iters') as HTMLInputElement;
        
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
        console.log('Number of iterations updated to:', this.nIters);
    }
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FractalMountains();
}); 