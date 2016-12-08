module.exports = new function () {
    if (typeof(location) !== 'undefined') {
        this.WEB_SOCKET_HOST = location.origin.replace(/^http/, 'ws');
    }

    this.WEB_SOCKET_MESSAGE_TYPE = {
        play_note: 0,
        stop_note: 1,
        stop: 5,
        change_instrument: 10,
        get_state: 20,
        ping: 100, // keep connection alive (message from client)
        pong: 101  // keep connection alive (message from server)
    };

    this.MASTER_GAIN_MAX = 0.5;
    this.ANALYZER_FFT_SIZE = 2048;

    this.WAVE_FUNCTION = function (funcName) {
        switch (funcName) {
            case 'sine':
                return Math.sin;
            case 'square':
                return function (t) {
                    return t == 0 ? 0 : (Math.sin(t) > 0) ? 1 : -1
                };
            case 'sawtooth':
                return function (t) {
                    if (t > 0) return 2 * ((t / 2 / Math.PI) % 1) - 1;
                    else return 2 * ((t / 2 / Math.PI) % 1) + 1;
                };
            case 'triangle':
                return function (t) {
                    if (t > 0) return 4 * Math.abs((t / 2 / Math.PI) % 1 - 0.5) - 1;
                    else return 4 * Math.abs((t / 2 / Math.PI) % 1 + 0.5) - 1;
                };
            default:
                return Math.sin;
        }
    };

    this.MODES = {
        minor: {
            name: 'Minor',
            intervals: [2, 1, 2, 2, 1, 2, 2]
        },
        major: {
            name: 'Major',
            intervals: [2, 2, 1, 2, 2, 2, 1]
        },
        pentatonicMinor: {
            name: 'Pentatonic minor',
            intervals: [3, 2, 3, 2, 2]
        },
        pentatonicMajor: {
            name: 'Pentatonic major',
            intervals: [2, 3, 2, 2, 3]
        }
    };

    this.SIGN_SHARP = '♯';
    this.SIGN_FLAT = '♭';

    this.SCALES = {
        natural: {
            name: 'Natural',
            scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
        },
        sharp: {
            name: 'Sharp',
            scale: ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
        },
        flat: {
            name: 'Flat',
            scale: ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
        }
    };

    this.ENVELOPE_PROPERTIES = ['attack', 'decay', 'sustain', 'release'];

    // will be translated to a Note object during compilation
    this.NOTE_START = ['C', 2];
    this.NOTE_END = ['B', 5];
    this.NOTES_COUNT = 0;
};


// TODO
// https://github.com/kaimallea/isMobile
function isMobile(a) {
    var b = /iPhone/i, c = /iPod/i, d = /iPad/i, e = /(?=.*\bAndroid\b)(?=.*\bMobile\b)/i, f = /Android/i, g = /(?=.*\bAndroid\b)(?=.*\bSD4930UR\b)/i, h = /(?=.*\bAndroid\b)(?=.*\b(?:KFOT|KFTT|KFJWI|KFJWA|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|KFARWI|KFASWI|KFSAWI|KFSAWA)\b)/i, i = /Windows Phone/i, j = /(?=.*\bWindows\b)(?=.*\bARM\b)/i, k = /BlackBerry/i, l = /BB10/i, m = /Opera Mini/i, n = /(CriOS|Chrome)(?=.*\bMobile\b)/i, o = /(?=.*\bFirefox\b)(?=.*\bMobile\b)/i, p = new RegExp("(?:Nexus 7|BNTV250|Kindle Fire|Silk|GT-P1000)", "i"), q = function (a, b) {
        return a.test(b)
    }, r = function (a) {
        var r = a || navigator.userAgent, s = r.split("[FBAN");
        if ("undefined" != typeof s[1] && (r = s[0]), s = r.split("Twitter"), "undefined" != typeof s[1] && (r = s[0]), this.apple = {
                phone: q(b, r),
                ipod: q(c, r),
                tablet: !q(b, r) && q(d, r),
                device: q(b, r) || q(c, r) || q(d, r)
            }, this.amazon = {
                phone: q(g, r),
                tablet: !q(g, r) && q(h, r),
                device: q(g, r) || q(h, r)
            }, this.android = {
                phone: q(g, r) || q(e, r),
                tablet: !q(g, r) && !q(e, r) && (q(h, r) || q(f, r)),
                device: q(g, r) || q(h, r) || q(e, r) || q(f, r)
            }, this.windows = {
                phone: q(i, r),
                tablet: q(j, r),
                device: q(i, r) || q(j, r)
            }, this.other = {
                blackberry: q(k, r),
                blackberry10: q(l, r),
                opera: q(m, r),
                firefox: q(o, r),
                chrome: q(n, r),
                device: q(k, r) || q(l, r) || q(m, r) || q(o, r) || q(n, r)
            }, this.seven_inch = q(p, r), this.any = this.apple.device || this.android.device || this.windows.device || this.other.device || this.seven_inch, this.phone = this.apple.phone || this.android.phone || this.windows.phone, this.tablet = this.apple.tablet || this.android.tablet || this.windows.tablet, "undefined" == typeof window)return this
    }, s = function () {
        var a = new r;
        return a.Class = r, a
    };
    "undefined" != typeof module && module.exports && "undefined" == typeof window ? module.exports = r : "undefined" != typeof module && module.exports && "undefined" != typeof window ? module.exports = s() : "function" == typeof define && define.amd ? define("isMobile", [], a.isMobile = s()) : a.isMobile = s()
};