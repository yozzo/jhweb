precision mediump float;
uniform sampler2D u_image;
uniform float step_w;
uniform float step_h;

varying vec2 v_texCoord;

void main() {

  vec2 tc = v_texCoord;
  vec4 input0 = texture2D(u_image,tc);

  vec2 x1 = vec2(step_w, 0.0);
  vec2 y1 = vec2(0.0, step_h);

  input0 += texture2D(u_image, tc+x1); // right
  input0 += texture2D(u_image, tc-x1); // left
  input0 += texture2D(u_image, tc+y1); // top
  input0 += texture2D(u_image, tc-y1); // bottom

  input0 *=0.2;

  gl_FragColor = input0;
}