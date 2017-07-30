attribute vec3 pos;
attribute vec4 color;
attribute vec2 texcoord;

varying vec2 v_texCoord;
varying vec4 vColor;

uniform float u_mouseX;
uniform float u_mouseY;

vec2 scale = vec2(u_mouseX, u_mouseY);
void main() {

   gl_Position = vec4(pos.x*scale.x,pos.y*scale.y,pos.z,1.0);
   v_texCoord = texcoord;
   vColor = color;

}