attribute vec3 pos;
attribute vec4 color;
attribute vec2 texcoord;

varying vec2 v_texCoord;
varying vec4 vColor;

void main() {
   gl_Position = vec4((pos.x),pos.y,pos.z,1.0);
   v_texCoord = texcoord;
   vColor = color;
}