precision mediump float;
varying vec2 v_texCoord;

uniform vec2 amt;
uniform sampler2D u_image;
uniform sampler2D u_image2;


void main(){

    vec2 tc = v_texCoord;
    vec4 look = texture2D(u_image2,tc);//sample repos texture
    vec2 offs = vec2(look.y-look.x,look.w-look.z)*amt;
    vec2 coord = offs+tc;  //relative coordinates

    vec4 repos = texture2D(u_image, coord);

    gl_FragColor = repos;
}