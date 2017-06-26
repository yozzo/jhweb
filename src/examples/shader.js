function loadShaders() {
    SHADER_LOADER.load(function(e) {
        shaders = e, init()
    })
}

function init() {
    if (isWebGL = hasWebGL(), $main = $(".main"), isWebGL) addBackdrop($main, shaders.displace.fragment);
    else {
        var e = new Image;
        e.src = "img/fallback.jpg", $(".main").append(e), e.style.width = "100%", e.style.height = "100%"
    }
    window.addEventListener("resize", onResize, !1), onResize();
    var a = new TimelineLite;
    a.set(".main", {
        display: "block"
    }), isWebGL && (a.add(TweenMax.fromTo(uniforms.wipe1, 1.5, {
        value: -.5
    }, {
        value: 1
    })), a.add(TweenMax.fromTo(uniforms.wipe2, 1.5, {
        value: -.5
    }, {
        value: 1
    }), "-=0.8")), a.add(TweenMax.fromTo(".spinner", .5, {
        scale: .1,
        opacity: 0
    }, {
        scale: scl,
        opacity: 1,
        ease: Power2.easeOut,
        onComplete: function() {
            $(".spinner").css("transform-origin", "top left")
        }
    }), "-=0.5");
    var n = new SplitText(".intro-text", {
            type: "words"
        }),
        t = n.words;
    a.add(TweenMax.staggerFrom(t, .8, {
        opacity: 0,
        y: 10,
        ease: Power2.easeOut
    }, .03), "-=0.1"), $(t[44]).contents().eq(0).wrap('<a href="http://www.toolofna.com" class="shorty"/>'), $(t[45]).contents().eq(0).wrap('<a href="http://www.yahoo.com" class="shorty"/>'), $(t[46]).contents().eq(0).wrap('<a href="http://www.brightcove.com" class="shorty"/>'), $(t[47]).contents().eq(0).wrap('<a href="http://www.rga.com" />'), $(t[49]).contents().eq(0).wrap('<a href="http://www.hugeinc.com" />'), a.add(TweenMax.fromTo($(".big-btn"), .8, {
        opacity: 0,
        y: 10
    }, {
        opacity: 1,
        y: 0,
        ease: Power2.easeOut
    }, .12), "-=0.5"), isWebGL && ($(".main")[0].addEventListener("touchmove", onTouchMove, !1), $(".main")[0].addEventListener("mousemove", onMouseMove, !1), animate())
}

function trace(e) {
    document.getElementById("debug").innerHTML = e
}

function addBackdrop(e, a) {
    var n = e.outerWidth(),
        t = e.outerHeight(),
        o = new PIXI.WebGLRenderer(n, t);
    e.append(o.view), $(o.view).css("position", "absolute"), $(o.view).css("top", "0"), $(o.view).css("zIndex", "1");
    var i = new PIXI.Container;
    uniforms.iResolution = {
        type: "v2",
        value: {
            x: n,
            y: t
        }
    }, uniforms.iMouse = {
        type: "v2",
        value: {
            x: .5,
            y: .5
        }
    }, uniforms.iGlobalTime = {
        type: "1f",
        value: 0
    }, uniforms.iChannel0 = {
        type: "sampler2D",
        value: PIXI.Texture.fromImage("img/heade.jpg")
    }, uniforms.wipe1 = {
        type: "1f",
        value: 0
    }, uniforms.wipe2 = {
        type: "1f",
        value: 0
    };
    var r = a,
        s = new PIXI.AbstractFilter("", r, uniforms),
        c = PIXI.Sprite.fromImage("img/heade.jpg");
    c.width = n, c.height = t, c.filters = [s], i.addChild(c), backdrop.renderer = o, backdrop.stage = i, backdrop.shader = s, backdrop.bgSprite = c
}

function onResize() {
    var e = $main.outerWidth(),
        a = $main.outerHeight();
    isWebGL && (backdrop.renderer.resize(e, a), backdrop.bgSprite.width = e, backdrop.bgSprite.height = a, backdrop.shader.uniforms.iResolution.value = {
        x: e,
        y: a
    });
    var n, t, o, i;
    e > a ? (n = 900, t = 470, o = 200, i = 100) : (n = 620, t = 680, o = 100, i = 200), $(".over").css("width", n), $(".over").css("height", t), scl = Math.min(e / (n + o), a / (t + i)), scl = Math.min(scl, 1), TweenMax.set($(".over-inner"), {
        scale: scl
    }), TweenMax.set($(".spinner"), {
        scale: scl
    }), $(".spinner").css("top", 20 * scl), $(".spinner").css("left", 20 * scl)
}

function animate() {
    requestAnimationFrame(animate), sTime += .01, backdrop.shader.uniforms.iGlobalTime.value = sTime, backdrop.renderer.render(backdrop.stage)
}

function onMouseMove(e) {
    var a = e.pageX / window.innerWidth,
        n = e.pageY / window.innerHeight;
    uniforms.iMouse.value = {
        x: a,
        y: 1 - n
    }
}

function onTouchMove(e) {
    e.preventDefault(), e.stopPropagation(), onMouseMove(e.touches[0])
}

function hasWebGL() {
    try {
        var e = document.createElement("canvas");
        return !(!window.WebGLRenderingContext || !e.getContext("webgl") && !e.getContext("experimental-webgl"))
    } catch (a) {
        return !1
    }
}
var sTime = 100 * Math.random(),
    stats, backdrop = {},
    shaders, uniforms = {},
    scl, isWebGL = !1,
    $main;
$(window).load(loadShaders);