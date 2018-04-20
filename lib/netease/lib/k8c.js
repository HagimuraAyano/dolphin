var BR8J = function(jQ2x) {
    if (jQ2x < -128) {
        return BR8J(128 - (-128 - jQ2x))
    } else if (jQ2x >= -128 && jQ2x <= 127) {
        return jQ2x
    } else if (jQ2x > 127) {
        return BR8J(-129 + jQ2x - 127)
    } else {
        throw new Error("1001")
    }
};
var cmn0x = function(jQ2x, be9V) {
    return BR8J(jQ2x + be9V)
};
var cmk0x = function(Yk3x, blQ7J) {
    if (Yk3x == null) {
        return null
    }
    if (blQ7J == null) {
        return Yk3x
    }
    var pG4K = [];
    var clG9x = blQ7J.length;
    for (var i = 0, bm9d = Yk3x.length; i < bm9d; i++) {
        pG4K[i] = cmn0x(Yk3x[i], blQ7J[i % clG9x])
    }
    return pG4K
};
var clB9s = function(Yr3x) {
    if (Yr3x == null) {
        return Yr3x
    }
    var pG4K = [];
    var ckN9E = Yr3x.length;
    for (var i = 0, bm9d = ckN9E; i < bm9d; i++) {
        pG4K[i] = BR8J(0 - Yr3x[i])
    }
    return pG4K
};
var ckM9D = function(blN7G, Sr1x) {
    blN7G = BR8J(blN7G);
    Sr1x = BR8J(Sr1x);
    return BR8J(blN7G ^ Sr1x)
};
var bwN0x = function(Sn1x, blL7E) {
    if (Sn1x == null || blL7E == null || Sn1x.length != blL7E.length) {
        return Sn1x
    }
    var pG4K = [];
    var ckD9u = Sn1x.length;
    for (var i = 0, bm9d = ckD9u; i < bm9d; i++) {
        pG4K[i] = ckM9D(Sn1x[i], blL7E[i])
    }
    return pG4K
};
var bwK0x = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
var ckB9s = function(dn0x) {
    var HQ6K = [];
    HQ6K.push(bwK0x[dn0x >>> 4 & 15]);
    HQ6K.push(bwK0x[dn0x & 15]);
    return HQ6K.join("")
};
var bwJ0x = function(us5x) {
    var bm9d = us5x.length;
    if (us5x == null || bm9d < 0) {
        return new String("")
    }
    var HQ6K = [];
    for (var i = 0; i < bm9d; i++) {
        HQ6K.push(ckB9s(us5x[i]))
    }
    return HQ6K.join("")
};
var bwE0x = function(YT3x) {
    if (YT3x == null || YT3x.length == 0) {
        return YT3x
    }
    var blI7B = new String(YT3x);
    var pG4K = [];
    var bm9d = blI7B.length / 2;
    var be9V = 0;
    for (var i = 0; i < bm9d; i++) {
        var oi3x = parseInt(blI7B.charAt(be9V++), 16) << 4;
        var nO3x = parseInt(blI7B.charAt(be9V++), 16);
        pG4K[i] = BR8J(oi3x + nO3x)
    }
    return pG4K
};
var bwA0x = function(cF0x) {
    if (cF0x == null || cF0x == undefined) {
        return cF0x
    }
    var Sg1x = encodeURIComponent(cF0x);
    var us5x = [];
    var bwz0x = Sg1x.length;
    for (var i = 0; i < bwz0x; i++) {
        if (Sg1x.charAt(i) == "%") {
            if (i + 2 < bwz0x) {
                us5x.push(bwE0x(Sg1x.charAt(++i) + "" + Sg1x.charAt(++i))[0])
            } else {
                throw new Error("1009")
            }
        } else {
            us5x.push(Sg1x.charCodeAt(i))
        }
    }
    return us5x
};
var cjN9E = function(uW6Q) {
    var ba9R = 0;
    ba9R += (uW6Q[0] & 255) << 24;
    ba9R += (uW6Q[1] & 255) << 16;
    ba9R += (uW6Q[2] & 255) << 8;
    ba9R += uW6Q[3] & 255;
    return ba9R
};
var cAQ3x = function(ba9R) {
    var uW6Q = [];
    uW6Q[0] = ba9R >>> 24 & 255;
    uW6Q[1] = ba9R >>> 16 & 255;
    uW6Q[2] = ba9R >>> 8 & 255;
    uW6Q[3] = ba9R & 255;
    return uW6Q
};
var cjy9p = function(dt0x, blB7u, bm9d) {
    var ej0x = [];
    if (dt0x == null || dt0x.length == 0) {
        return ej0x
    }
    if (dt0x.length < bm9d) {
        throw new Error("1003")
    }
    for (var i = 0; i < bm9d; i++) {
        ej0x[i] = dt0x[blB7u + i]
    }
    return ej0x
};
var blA7t = function(dt0x, blB7u, rv4z, cje9V, bm9d) {
    if (dt0x == null || dt0x.length == 0) {
        return rv4z
    }
    if (rv4z == null) {
        throw new Error("1004")
    }
    if (dt0x.length < bm9d) {
        throw new Error("1003")
    }
    for (var i = 0; i < bm9d; i++) {
        rv4z[cje9V + i] = dt0x[blB7u + i]
    }
    return rv4z
};
var cjd9U = function(bm9d) {
    var bs9j = [];
    for (var i = 0; i < bm9d; i++) {
        bs9j[i] = 0
    }
    return bs9j
};
var ciS9J = [82, 9, 106, -43, 48, 54, -91, 56, -65, 64, -93, -98, -127, -13, -41, -5, 124, -29, 57, -126, -101, 47, -1, -121, 52, -114, 67, 68, -60, -34, -23, -53, 84, 123, -108, 50, -90, -62, 35, 61, -18, 76, -107, 11, 66, -6, -61, 78, 8, 46, -95, 102, 40, -39, 36, -78, 118, 91, -94, 73, 109, -117, -47, 37, 114, -8, -10, 100, -122, 104, -104, 22, -44, -92, 92, -52, 93, 101, -74, -110, 108, 112, 72, 80, -3, -19, -71, -38, 94, 21, 70, 87, -89, -115, -99, -124, -112, -40, -85, 0, -116, -68, -45, 10, -9, -28, 88, 5, -72, -77, 69, 6, -48, 44, 30, -113, -54, 63, 15, 2, -63, -81, -67, 3, 1, 19, -118, 107, 58, -111, 17, 65, 79, 103, -36, -22, -105, -14, -49, -50, -16, -76, -26, 115, -106, -84, 116, 34, -25, -83, 53, -123, -30, -7, 55, -24, 28, 117, -33, 110, 71, -15, 26, 113, 29, 41, -59, -119, 111, -73, 98, 14, -86, 24, -66, 27, -4, 86, 62, 75, -58, -46, 121, 32, -102, -37, -64, -2, 120, -51, 90, -12, 31, -35, -88, 51, -120, 7, -57, 49, -79, 18, 16, 89, 39, -128, -20, 95, 96, 81, 127, -87, 25, -75, 74, 13, 45, -27, 122, -97, -109, -55, -100, -17, -96, -32, 59, 77, -82, 42, -11, -80, -56, -21, -69, 60, -125, 83, -103, 97, 23, 43, 4, 126, -70, 119, -42, 38, -31, 105, 20, 99, 85, 33, 12, 125];
var HL6F = 64;
var Zu4y = 64;
var bwj0x = 4;
var ciA9r = function(pM4Q) {
    var bwd0x = [];
    if (pM4Q == null || pM4Q == undefined || pM4Q.length == 0) {
        return cjd9U(Zu4y)
    }
    if (pM4Q.length >= Zu4y) {
        return cjy9p(pM4Q, 0, Zu4y)
    } else {
        for (var i = 0; i < Zu4y; i++) {
            bwd0x[i] = pM4Q[i % pM4Q.length]
        }
    }
    return bwd0x
};
var cig9X = function(ZD4H) {
    if (ZD4H == null || ZD4H.length % HL6F != 0) {
        throw new Error("1005")
    }
    var bln7g = [];
    var be9V = 0;
    var chB9s = ZD4H.length / HL6F;
    for (var i = 0; i < chB9s; i++) {
        bln7g[i] = [];
        for (var j = 0; j < HL6F; j++) {
            bln7g[i][j] = ZD4H[be9V++]
        }
    }
    return bln7g
};
var chA9r = function(bvM0x) {
    var oi3x = bvM0x >>> 4 & 15;
    var nO3x = bvM0x & 15;
    var be9V = oi3x * 16 + nO3x;
    return ciS9J[be9V]
};
var bvL0x = function(blj7c) {
    if (blj7c == null) {
        return null
    }
    var bvF0x = [];
    for (var i = 0, bm9d = blj7c.length; i < bm9d; i++) {
        bvF0x[i] = chA9r(blj7c[i])
    }
    return bvF0x
};
var bvB0x = function(HH6B, pM4Q) {
    if (HH6B == null) {
        return null
    }
    if (HH6B.length == 0) {
        return []
    }
    if (HH6B.length % HL6F != 0) {
        throw new Error("1005")
    }
    pM4Q = ciA9r(pM4Q);
    var bli7b = pM4Q;
    var blh7a = cig9X(HH6B);
    var Rz1x = [];
    var cgh8Z = blh7a.length;
    for (var i = 0; i < cgh8Z; i++) {
        var blg7Z = bvL0x(blh7a[i]);
        blg7Z = bvL0x(blg7Z);
        var blf7Y = bwN0x(blg7Z, bli7b);
        var cfS8K = cmk0x(blf7Y, clB9s(bli7b));
        blf7Y = bwN0x(cfS8K, pM4Q);
        blA7t(blf7Y, 0, Rz1x, i * HL6F, HL6F);
        bli7b = blh7a[i]
    }
    var bvn9e = [];
    blA7t(Rz1x, Rz1x.length - bwj0x, bvn9e, 0, bwj0x);
    var bm9d = cjN9E(bvn9e);
    if (bm9d > Rz1x.length) {
        throw new Error("1006")
    }
    var pG4K = [];
    blA7t(Rz1x, 0, pG4K, 0, bm9d);
    return pG4K
};
var cfP8H = function(bap4t, J8B) {
    if (bap4t == null) {
        return null
    }
    var bvb9S = new String(bap4t);
    if (bvb9S.length == 0) {
        return []
    }
    var HH6B = bwE0x(bvb9S);
    if (J8B == null || J8B == undefined) {
        throw new Error("1007")
    }
    var pM4Q = bwA0x(J8B);
    return bvB0x(HH6B, pM4Q)
};

// --------------------------------------------------------

var bHJ2x = function() {
    var bHK2x = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        OD0x = {},
        Dt8l = {};
    for (var i = 0, l = bHK2x.length, c; i < l; i++) {
        c = bHK2x.charAt(i);
        OD0x[i] = c;
        Dt8l[c] = i
    }
    var qR4V = /\n|\r|=/g;
    return function(j8b) {
        var r8j = 0,
            o8g = [];
        j8b = j8b.replace(qR4V, "");
        for (var i = 0, l = j8b.length; i < l; i += 4) o8g.push(Dt8l[j8b.charAt(i)] << 2 | Dt8l[j8b.charAt(i + 1)] >> 4, (Dt8l[j8b.charAt(i + 1)] & 15) << 4 | Dt8l[j8b.charAt(i + 2)] >> 2, (Dt8l[j8b.charAt(i + 2)] & 3) << 6 | Dt8l[j8b.charAt(i + 3)]);
        var bm9d = o8g.length,
            eZ0x = j8b.length % 4;
        if (eZ0x == 2) o8g = o8g.slice(0, bm9d - 2);
        if (eZ0x == 3) o8g = o8g.slice(0, bm9d - 1);
        return o8g
    }
}();

var cdO8G = function(j8b) {
    var hZ1x = bHJ2x(j8b),
        du0x = hZ1x.length,
        hO1x;
    var r8j = 0;
    while (hO1x = hZ1x[r8j]) {
        if (hO1x > 128) {
            hZ1x[r8j] = hO1x - 256
        }
        r8j++
    }
    return hZ1x
};

var ceQ8I = function(bkX7Q, J8B) {
    var bkZ7S = bvB0x(bkX7Q, bwA0x(J8B));
    var Cy8q = new String(bwJ0x(bkZ7S));
    var wW6Q = [];
    var bkY7R = Cy8q.length / 2;
    var be9V = 0;
    for (var i = 0; i < bkY7R; i++) {
        wW6Q.push("%");
        wW6Q.push(Cy8q.charAt(be9V++));
        wW6Q.push(Cy8q.charAt(be9V++))
    }
    return wW6Q.join("")
}

var cpq0x = function(bkX7Q, J8B) {
    return ceQ8I(cdO8G(bkX7Q), J8B)
}

module.exports = cpq0x;