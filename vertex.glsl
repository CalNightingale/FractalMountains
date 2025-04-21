#version 330
in vec3 raw_position;  // x_i, y_i, z
uniform int width;

void main() {
    // Create 2D vertex from input position
    vec2 vertex = vec2(raw_position.x, raw_position.y);
    
    // Convert to [0,1] space by dividing by (width-1)
    vec2 normalized = vertex / (width - 1.0);
    
    // Adjust x position based on y coordinate
    // This creates the horizontal shift effect
    float x_adjustment = 0.5 * (1.0 - normalized.y);
    normalized.x += x_adjustment;
    
    // Scale x coordinate to fit within max possible range
    normalized.x /= 1.5;
    
    // Convert to GL coordinates: scale and translate from [0,1] to [-0.8, 0.8]
    vec2 final_coords = normalized * 1.6 - 0.8;
    
    gl_Position = vec4(final_coords, 0.0, 1.0);
} 