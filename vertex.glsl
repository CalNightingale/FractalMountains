#version 330
in vec3 raw_position;  // x_i, y_i, z
uniform int width;

void main() {
    // begin by mapping to [0,1]
    // shift by 1/2 width to the right based on y
    float x_adj_pct = 0.5 * (1 - raw_position.y / (width - 1));
    float x_pct = raw_position.x / (width - 1);
    float y_pct = raw_position.y / (width - 1);
    float x_coord = x_pct + x_adj_pct;
    float max_possible_x = 1.5;
    // re scale x to be clamped to [0,1]
    x_coord /= max_possible_x;
    float y_coord = y_pct;
    
    // Convert to GL coordinates (but actually keep a margin on each side): scale [0,1] -> [-0.8, 0.8]
    float x_gl = x_coord * 1.6 - 0.8;
    float y_gl = y_coord * 1.6 - 0.8;
    
    gl_Position = vec4(x_gl, y_gl, 0.0, 1.0);
} 