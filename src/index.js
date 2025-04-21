"use strict";
class FractalMountains {
    constructor() {
        this.nIters = 1;
        this.initialize();
    }
    initialize() {
        const input = document.getElementById('n-iters');
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
        console.log('Number of iterations updated to:', this.nIters);
    }
}
// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FractalMountains();
});
