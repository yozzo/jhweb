precision highp float;
uniform sampler2D u_image;
varying vec2 v_texCoord;

//float contrast = 2.0;

void main() {
    vec4 color = texture2D(u_image, vec2((v_texCoord.x*-1.0)+1.0, v_texCoord.y)); //horizontal flip
    //const vec3 LumCoeff = vec3(0.2125, 0.7154, 0.0721);

   //vec3 AvgLumin = vec3(0.5, 0.5, 0.5);

    //vec3 intensity = vec3(dot(color.rgb, LumCoeff));

    //vec3 satColor = mix(intensity, color.rgb, 1.);
    //vec3 conColor = mix(AvgLumin, satColor, contrast);

    gl_FragColor = vec4(vec3(color.rgb),1.0);
}