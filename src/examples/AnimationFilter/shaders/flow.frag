precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform sampler2D u_image2;
uniform vec2 scale;
uniform vec2 offset;
uniform float lambda;
const vec4 lumcoeff = vec4(1,1,1,1);

void main()
{
  vec4 a = texture2D(u_image, v_texCoord);
  vec4 b = texture2D(u_image2, v_texCoord);
  vec2 x1 = vec2(offset.x,0.);
  vec2 y1 = vec2(0.,offset.y);

  vec4 curdif = b-a;

  vec4 gradx = texture2D(u_image2, v_texCoord+x1)-texture2D(u_image2, v_texCoord-x1);
  gradx += texture2D(u_image, v_texCoord+x1)-texture2D(u_image, v_texCoord-x1);

  vec4 grady = texture2D(u_image2, v_texCoord+y1)-texture2D(u_image2, v_texCoord-y1);
  grady += texture2D(u_image, v_texCoord+y1)-texture2D(u_image, v_texCoord-y1);

  vec4 gradmag = sqrt((gradx*gradx)+(grady*grady)+vec4(lambda));

  vec4 vx = curdif*(gradx/gradmag);
  float vxd = vx.r;
  vec2 xout = vec2(max(vxd,0.),abs(min(vxd,0.)))*scale.x;

  vec4 vy = curdif*(grady/gradmag);
  float vyd = vy.r;
  vec2 yout = vec2(max(vyd,0.),abs(min(vyd,0.)))*scale.y;

  gl_FragColor = vec4(xout.yy,xout.yy);

}