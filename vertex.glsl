#version 330
in vec3 raw_position;  // x_i, y_i, z
uniform int width;

void main() {
    // Create 2D vertex from input position
    vec2 vertex = vec2(raw_position.x, raw_position.y);
    
    // Convert to [0,1] space by dividing by (width-1)
    vec2 normalized = vertex / (width - 1.0);
    
    // Define rhombus parameters
    float side_length = 0.75;
    float sqrt3_over_2 = sqrt(3.0) / 2.0;
    float rectangle_height = side_length * sqrt3_over_2;
    
    // Center the coordinates around origin
    vec2 centered = normalized - vec2(0.5);
    
    // Scale to create the rectangle of correct dimensions
    vec2 scaled = centered * vec2(side_length, rectangle_height);
    
    // Apply horizontal shear based on y coordinate
    // The shear factor is 0.5 at the extremes of y, interpolated linearly
    float shear_amount = -scaled.y / rectangle_height * 0.5 * side_length;
    vec2 final_coords = scaled + vec2(shear_amount, 0.0);
    // Scale up to fill screen, leaving a margin that is pleasing to the eye
    final_coords *= 1.5;
    
    gl_Position = vec4(final_coords, 0.0, 1.0);
}