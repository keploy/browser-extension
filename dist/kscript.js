/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/flat/index.js":
/*!************************************!*\
  !*** ./node_modules/flat/index.js ***!
  \************************************/
/***/ ((module) => {

module.exports = flatten
flatten.flatten = flatten
flatten.unflatten = unflatten

function isBuffer (obj) {
  return obj &&
    obj.constructor &&
    (typeof obj.constructor.isBuffer === 'function') &&
    obj.constructor.isBuffer(obj)
}

function keyIdentity (key) {
  return key
}

function flatten (target, opts) {
  opts = opts || {}

  const delimiter = opts.delimiter || '.'
  const maxDepth = opts.maxDepth
  const transformKey = opts.transformKey || keyIdentity
  const output = {}

  function step (object, prev, currentDepth) {
    currentDepth = currentDepth || 1
    Object.keys(object).forEach(function (key) {
      const value = object[key]
      const isarray = opts.safe && Array.isArray(value)
      const type = Object.prototype.toString.call(value)
      const isbuffer = isBuffer(value)
      const isobject = (
        type === '[object Object]' ||
        type === '[object Array]'
      )

      const newKey = prev
        ? prev + delimiter + transformKey(key)
        : transformKey(key)

      if (!isarray && !isbuffer && isobject && Object.keys(value).length &&
        (!opts.maxDepth || currentDepth < maxDepth)) {
        return step(value, newKey, currentDepth + 1)
      }

      output[newKey] = value
    })
  }

  step(target)

  return output
}

function unflatten (target, opts) {
  opts = opts || {}

  const delimiter = opts.delimiter || '.'
  const overwrite = opts.overwrite || false
  const transformKey = opts.transformKey || keyIdentity
  const result = {}

  const isbuffer = isBuffer(target)
  if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
    return target
  }

  // safely ensure that the key is
  // an integer.
  function getkey (key) {
    const parsedKey = Number(key)

    return (
      isNaN(parsedKey) ||
      key.indexOf('.') !== -1 ||
      opts.object
    ) ? key
      : parsedKey
  }

  function addKeys (keyPrefix, recipient, target) {
    return Object.keys(target).reduce(function (result, key) {
      result[keyPrefix + delimiter + key] = target[key]

      return result
    }, recipient)
  }

  function isEmpty (val) {
    const type = Object.prototype.toString.call(val)
    const isArray = type === '[object Array]'
    const isObject = type === '[object Object]'

    if (!val) {
      return true
    } else if (isArray) {
      return !val.length
    } else if (isObject) {
      return !Object.keys(val).length
    }
  }

  target = Object.keys(target).reduce(function (result, key) {
    const type = Object.prototype.toString.call(target[key])
    const isObject = (type === '[object Object]' || type === '[object Array]')
    if (!isObject || isEmpty(target[key])) {
      result[key] = target[key]
      return result
    } else {
      return addKeys(
        key,
        result,
        flatten(target[key], opts)
      )
    }
  }, {})

  Object.keys(target).forEach(function (key) {
    const split = key.split(delimiter).map(transformKey)
    let key1 = getkey(split.shift())
    let key2 = getkey(split[0])
    let recipient = result

    while (key2 !== undefined) {
      if (key1 === '__proto__') {
        return
      }

      const type = Object.prototype.toString.call(recipient[key1])
      const isobject = (
        type === '[object Object]' ||
        type === '[object Array]'
      )

      // do not write over falsey, non-undefined values if overwrite is false
      if (!overwrite && !isobject && typeof recipient[key1] !== 'undefined') {
        return
      }

      if ((overwrite && !isobject) || (!overwrite && recipient[key1] == null)) {
        recipient[key1] = (
          typeof key2 === 'number' &&
          !opts.object ? [] : {}
        )
      }

      recipient = recipient[key1]
      if (split.length > 0) {
        key1 = getkey(split.shift())
        key2 = getkey(split[0])
      }
    }

    // unflatten again for 'messy objects'
    recipient[key1] = unflatten(target[key], opts)
  })

  return result
}


/***/ }),

/***/ "./node_modules/jshashes/hashes.js":
/*!*****************************************!*\
  !*** ./node_modules/jshashes/hashes.js ***!
  \*****************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;/**
 * jshashes - https://github.com/h2non/jshashes
 * Released under the "New BSD" license
 *
 * Algorithms specification:
 *
 * MD5 - http://www.ietf.org/rfc/rfc1321.txt
 * RIPEMD-160 - http://homes.esat.kuleuven.be/~bosselae/ripemd160.html
 * SHA1   - http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 * SHA256 - http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 * SHA512 - http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 * HMAC - http://www.ietf.org/rfc/rfc2104.txt
 */
(function() {
  var Hashes;

  function utf8Encode(str) {
    var x, y, output = '',
      i = -1,
      l;

    if (str && str.length) {
      l = str.length;
      while ((i += 1) < l) {
        /* Decode utf-16 surrogate pairs */
        x = str.charCodeAt(i);
        y = i + 1 < l ? str.charCodeAt(i + 1) : 0;
        if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
          x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
          i += 1;
        }
        /* Encode output as utf-8 */
        if (x <= 0x7F) {
          output += String.fromCharCode(x);
        } else if (x <= 0x7FF) {
          output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
            0x80 | (x & 0x3F));
        } else if (x <= 0xFFFF) {
          output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
            0x80 | ((x >>> 6) & 0x3F),
            0x80 | (x & 0x3F));
        } else if (x <= 0x1FFFFF) {
          output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
            0x80 | ((x >>> 12) & 0x3F),
            0x80 | ((x >>> 6) & 0x3F),
            0x80 | (x & 0x3F));
        }
      }
    }
    return output;
  }

  function utf8Decode(str) {
    var i, ac, c1, c2, c3, arr = [],
      l;
    i = ac = c1 = c2 = c3 = 0;

    if (str && str.length) {
      l = str.length;
      str += '';

      while (i < l) {
        c1 = str.charCodeAt(i);
        ac += 1;
        if (c1 < 128) {
          arr[ac] = String.fromCharCode(c1);
          i += 1;
        } else if (c1 > 191 && c1 < 224) {
          c2 = str.charCodeAt(i + 1);
          arr[ac] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
          i += 2;
        } else {
          c2 = str.charCodeAt(i + 1);
          c3 = str.charCodeAt(i + 2);
          arr[ac] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        }
      }
    }
    return arr.join('');
  }

  /**
   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
   * to work around bugs in some JS interpreters.
   */

  function safe_add(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF),
      msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }

  /**
   * Bitwise rotate a 32-bit number to the left.
   */

  function bit_rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  /**
   * Convert a raw string to a hex string
   */

  function rstr2hex(input, hexcase) {
    var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef',
      output = '',
      x, i = 0,
      l = input.length;
    for (; i < l; i += 1) {
      x = input.charCodeAt(i);
      output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
    }
    return output;
  }

  /**
   * Encode a string as utf-16
   */

  function str2rstr_utf16le(input) {
    var i, l = input.length,
      output = '';
    for (i = 0; i < l; i += 1) {
      output += String.fromCharCode(input.charCodeAt(i) & 0xFF, (input.charCodeAt(i) >>> 8) & 0xFF);
    }
    return output;
  }

  function str2rstr_utf16be(input) {
    var i, l = input.length,
      output = '';
    for (i = 0; i < l; i += 1) {
      output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF, input.charCodeAt(i) & 0xFF);
    }
    return output;
  }

  /**
   * Convert an array of big-endian words to a string
   */

  function binb2rstr(input) {
    var i, l = input.length * 32,
      output = '';
    for (i = 0; i < l; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
    }
    return output;
  }

  /**
   * Convert an array of little-endian words to a string
   */

  function binl2rstr(input) {
    var i, l = input.length * 32,
      output = '';
    for (i = 0; i < l; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
    }
    return output;
  }

  /**
   * Convert a raw string to an array of little-endian words
   * Characters >255 have their high-byte silently ignored.
   */

  function rstr2binl(input) {
    var i, l = input.length * 8,
      output = Array(input.length >> 2),
      lo = output.length;
    for (i = 0; i < lo; i += 1) {
      output[i] = 0;
    }
    for (i = 0; i < l; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
    }
    return output;
  }

  /**
   * Convert a raw string to an array of big-endian words
   * Characters >255 have their high-byte silently ignored.
   */

  function rstr2binb(input) {
    var i, l = input.length * 8,
      output = Array(input.length >> 2),
      lo = output.length;
    for (i = 0; i < lo; i += 1) {
      output[i] = 0;
    }
    for (i = 0; i < l; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
    }
    return output;
  }

  /**
   * Convert a raw string to an arbitrary string encoding
   */

  function rstr2any(input, encoding) {
    var divisor = encoding.length,
      remainders = Array(),
      i, q, x, ld, quotient, dividend, output, full_length;

    /* Convert to an array of 16-bit big-endian values, forming the dividend */
    dividend = Array(Math.ceil(input.length / 2));
    ld = dividend.length;
    for (i = 0; i < ld; i += 1) {
      dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
    }

    /**
     * Repeatedly perform a long division. The binary array forms the dividend,
     * the length of the encoding is the divisor. Once computed, the quotient
     * forms the dividend for the next step. We stop when the dividend is zerHashes.
     * All remainders are stored for later use.
     */
    while (dividend.length > 0) {
      quotient = Array();
      x = 0;
      for (i = 0; i < dividend.length; i += 1) {
        x = (x << 16) + dividend[i];
        q = Math.floor(x / divisor);
        x -= q * divisor;
        if (quotient.length > 0 || q > 0) {
          quotient[quotient.length] = q;
        }
      }
      remainders[remainders.length] = x;
      dividend = quotient;
    }

    /* Convert the remainders to the output string */
    output = '';
    for (i = remainders.length - 1; i >= 0; i--) {
      output += encoding.charAt(remainders[i]);
    }

    /* Append leading zero equivalents */
    full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
    for (i = output.length; i < full_length; i += 1) {
      output = encoding[0] + output;
    }
    return output;
  }

  /**
   * Convert a raw string to a base-64 string
   */

  function rstr2b64(input, b64pad) {
    var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      output = '',
      len = input.length,
      i, j, triplet;
    b64pad = b64pad || '=';
    for (i = 0; i < len; i += 3) {
      triplet = (input.charCodeAt(i) << 16) | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
      for (j = 0; j < 4; j += 1) {
        if (i * 8 + j * 6 > input.length * 8) {
          output += b64pad;
        } else {
          output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
        }
      }
    }
    return output;
  }

  Hashes = {
    /**
     * @property {String} version
     * @readonly
     */
    VERSION: '1.0.6',
    /**
     * @member Hashes
     * @class Base64
     * @constructor
     */
    Base64: function() {
      // private properties
      var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        pad = '=', // default pad according with the RFC standard
        url = false, // URL encoding support @todo
        utf8 = true; // by default enable UTF-8 support encoding

      // public method for encoding
      this.encode = function(input) {
        var i, j, triplet,
          output = '',
          len = input.length;

        pad = pad || '=';
        input = (utf8) ? utf8Encode(input) : input;

        for (i = 0; i < len; i += 3) {
          triplet = (input.charCodeAt(i) << 16) | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
          for (j = 0; j < 4; j += 1) {
            if (i * 8 + j * 6 > len * 8) {
              output += pad;
            } else {
              output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
            }
          }
        }
        return output;
      };

      // public method for decoding
      this.decode = function(input) {
        // var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var i, o1, o2, o3, h1, h2, h3, h4, bits, ac,
          dec = '',
          arr = [];
        if (!input) {
          return input;
        }

        i = ac = 0;
        input = input.replace(new RegExp('\\' + pad, 'gi'), ''); // use '='
        //input += '';

        do { // unpack four hexets into three octets using index points in b64
          h1 = tab.indexOf(input.charAt(i += 1));
          h2 = tab.indexOf(input.charAt(i += 1));
          h3 = tab.indexOf(input.charAt(i += 1));
          h4 = tab.indexOf(input.charAt(i += 1));

          bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

          o1 = bits >> 16 & 0xff;
          o2 = bits >> 8 & 0xff;
          o3 = bits & 0xff;
          ac += 1;

          if (h3 === 64) {
            arr[ac] = String.fromCharCode(o1);
          } else if (h4 === 64) {
            arr[ac] = String.fromCharCode(o1, o2);
          } else {
            arr[ac] = String.fromCharCode(o1, o2, o3);
          }
        } while (i < input.length);

        dec = arr.join('');
        dec = (utf8) ? utf8Decode(dec) : dec;

        return dec;
      };

      // set custom pad string
      this.setPad = function(str) {
        pad = str || pad;
        return this;
      };
      // set custom tab string characters
      this.setTab = function(str) {
        tab = str || tab;
        return this;
      };
      this.setUTF8 = function(bool) {
        if (typeof bool === 'boolean') {
          utf8 = bool;
        }
        return this;
      };
    },

    /**
     * CRC-32 calculation
     * @member Hashes
     * @method CRC32
     * @static
     * @param {String} str Input String
     * @return {String}
     */
    CRC32: function(str) {
      var crc = 0,
        x = 0,
        y = 0,
        table, i, iTop;
      str = utf8Encode(str);

      table = [
        '00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 ',
        '79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 ',
        '84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F ',
        '63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD ',
        'A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC ',
        '51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 ',
        'B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 ',
        '06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 ',
        'E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 ',
        '12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 ',
        'D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 ',
        '33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 ',
        'CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 ',
        '9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E ',
        '7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D ',
        '806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 ',
        '60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA ',
        'AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 ',
        '5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 ',
        'B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 ',
        '05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 ',
        'F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA ',
        '11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 ',
        'D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F ',
        '30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E ',
        'C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D'
      ].join('');

      crc = crc ^ (-1);
      for (i = 0, iTop = str.length; i < iTop; i += 1) {
        y = (crc ^ str.charCodeAt(i)) & 0xFF;
        x = '0x' + table.substr(y * 9, 8);
        crc = (crc >>> 8) ^ x;
      }
      // always return a positive number (that's what >>> 0 does)
      return (crc ^ (-1)) >>> 0;
    },
    /**
     * @member Hashes
     * @class MD5
     * @constructor
     * @param {Object} [config]
     *
     * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
     * Digest Algorithm, as defined in RFC 1321.
     * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See <http://pajhome.org.uk/crypt/md5> for more infHashes.
     */
    MD5: function(options) {
      /**
       * Private config properties. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * See {@link Hashes.MD5#method-setUpperCase} and {@link Hashes.SHA1#method-setUpperCase}
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false, // hexadecimal output case format. false - lowercase; true - uppercase
        b64pad = (options && typeof options.pad === 'string') ? options.pad : '=', // base-64 pad character. Defaults to '=' for strict RFC compliance
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true; // enable/disable utf8 encoding

      // privileged (public) methods
      this.hex = function(s) {
        return rstr2hex(rstr(s, utf8), hexcase);
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s, utf8), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d), hexcase);
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * Enable/disable uppercase hexadecimal returned string
       * @param {Boolean}
       * @return {Object} this
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * Defines a base64 pad string
       * @param {String} Pad
       * @return {Object} this
       */
      this.setPad = function(a) {
        b64pad = a || b64pad;
        return this;
      };
      /**
       * Defines a base64 pad string
       * @param {Boolean}
       * @return {Object} [this]
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      // private methods

      /**
       * Calculate the MD5 of a raw string
       */

      function rstr(s) {
        s = (utf8) ? utf8Encode(s) : s;
        return binl2rstr(binl(rstr2binl(s), s.length * 8));
      }

      /**
       * Calculate the HMAC-MD5, of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        var bkey, ipad, opad, hash, i;

        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;
        bkey = rstr2binl(key);
        if (bkey.length > 16) {
          bkey = binl(bkey, key.length * 8);
        }

        ipad = Array(16), opad = Array(16);
        for (i = 0; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl(opad.concat(hash), 512 + 128));
      }

      /**
       * Calculate the MD5 of an array of little-endian words, and a bit length.
       */

      function binl(x, len) {
        var i, olda, oldb, oldc, oldd,
          a = 1732584193,
          b = -271733879,
          c = -1732584194,
          d = 271733878;

        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        for (i = 0; i < x.length; i += 16) {
          olda = a;
          oldb = b;
          oldc = c;
          oldd = d;

          a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
          d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
          c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
          b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
          a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
          d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
          c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
          b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
          a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
          d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
          c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
          b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
          a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
          d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
          c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
          b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

          a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
          d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
          c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
          b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
          a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
          d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
          c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
          b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
          a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
          d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
          c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
          b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
          a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
          d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
          c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
          b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

          a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
          d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
          c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
          b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
          a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
          d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
          c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
          b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
          a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
          d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
          c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
          b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
          a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
          d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
          c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
          b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

          a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
          d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
          c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
          b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
          a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
          d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
          c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
          b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
          a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
          d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
          c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
          b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
          a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
          d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
          c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
          b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

          a = safe_add(a, olda);
          b = safe_add(b, oldb);
          c = safe_add(c, oldc);
          d = safe_add(d, oldd);
        }
        return Array(a, b, c, d);
      }

      /**
       * These functions implement the four basic operations the algorithm uses.
       */

      function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
      }

      function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
      }

      function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
      }

      function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
      }

      function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
      }
    },
    /**
     * @member Hashes
     * @class Hashes.SHA1
     * @param {Object} [config]
     * @constructor
     *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined in FIPS 180-1
     * Version 2.2 Copyright Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     */
    SHA1: function(options) {
      /**
       * Private config properties. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * See {@link Hashes.MD5#method-setUpperCase} and {@link Hashes.SHA1#method-setUpperCase}
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false, // hexadecimal output case format. false - lowercase; true - uppercase
        b64pad = (options && typeof options.pad === 'string') ? options.pad : '=', // base-64 pad character. Defaults to '=' for strict RFC compliance
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true; // enable/disable utf8 encoding

      // public methods
      this.hex = function(s) {
        return rstr2hex(rstr(s, utf8), hexcase);
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s, utf8), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s, utf8), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d));
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * @description Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */
      this.setPad = function(a) {
        b64pad = a || b64pad;
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      // private methods

      /**
       * Calculate the SHA-512 of a raw string
       */

      function rstr(s) {
        s = (utf8) ? utf8Encode(s) : s;
        return binb2rstr(binb(rstr2binb(s), s.length * 8));
      }

      /**
       * Calculate the HMAC-SHA1 of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        var bkey, ipad, opad, i, hash;
        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;
        bkey = rstr2binb(key);

        if (bkey.length > 16) {
          bkey = binb(bkey, key.length * 8);
        }
        ipad = Array(16), opad = Array(16);
        for (i = 0; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binb(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
        return binb2rstr(binb(opad.concat(hash), 512 + 160));
      }

      /**
       * Calculate the SHA-1 of an array of big-endian words, and a bit length
       */

      function binb(x, len) {
        var i, j, t, olda, oldb, oldc, oldd, olde,
          w = Array(80),
          a = 1732584193,
          b = -271733879,
          c = -1732584194,
          d = 271733878,
          e = -1009589776;

        /* append padding */
        x[len >> 5] |= 0x80 << (24 - len % 32);
        x[((len + 64 >> 9) << 4) + 15] = len;

        for (i = 0; i < x.length; i += 16) {
          olda = a;
          oldb = b;
          oldc = c;
          oldd = d;
          olde = e;

          for (j = 0; j < 80; j += 1) {
            if (j < 16) {
              w[j] = x[i + j];
            } else {
              w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
            }
            t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
              safe_add(safe_add(e, w[j]), sha1_kt(j)));
            e = d;
            d = c;
            c = bit_rol(b, 30);
            b = a;
            a = t;
          }

          a = safe_add(a, olda);
          b = safe_add(b, oldb);
          c = safe_add(c, oldc);
          d = safe_add(d, oldd);
          e = safe_add(e, olde);
        }
        return Array(a, b, c, d, e);
      }

      /**
       * Perform the appropriate triplet combination function for the current
       * iteration
       */

      function sha1_ft(t, b, c, d) {
        if (t < 20) {
          return (b & c) | ((~b) & d);
        }
        if (t < 40) {
          return b ^ c ^ d;
        }
        if (t < 60) {
          return (b & c) | (b & d) | (c & d);
        }
        return b ^ c ^ d;
      }

      /**
       * Determine the appropriate additive constant for the current iteration
       */

      function sha1_kt(t) {
        return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
          (t < 60) ? -1894007588 : -899497514;
      }
    },
    /**
     * @class Hashes.SHA256
     * @param {config}
     *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined in FIPS 180-2
     * Version 2.2 Copyright Angel Marin, Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     * Also http://anmar.eu.org/projects/jssha2/
     */
    SHA256: function(options) {
      /**
       * Private properties configuration variables. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * @see this.setUpperCase() method
       * @see this.setPad() method
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false, // hexadecimal output case format. false - lowercase; true - uppercase  */
        b64pad = (options && typeof options.pad === 'string') ? options.pad : '=',
        /* base-64 pad character. Default '=' for strict RFC compliance   */
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true,
        /* enable/disable utf8 encoding */
        sha256_K;

      /* privileged (public) methods */
      this.hex = function(s) {
        return rstr2hex(rstr(s, utf8));
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s, utf8), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s, utf8), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d));
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */
      this.setPad = function(a) {
        b64pad = a || b64pad;
        return this;
      };
      /**
       * Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      // private methods

      /**
       * Calculate the SHA-512 of a raw string
       */

      function rstr(s, utf8) {
        s = (utf8) ? utf8Encode(s) : s;
        return binb2rstr(binb(rstr2binb(s), s.length * 8));
      }

      /**
       * Calculate the HMAC-sha256 of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;
        var hash, i = 0,
          bkey = rstr2binb(key),
          ipad = Array(16),
          opad = Array(16);

        if (bkey.length > 16) {
          bkey = binb(bkey, key.length * 8);
        }

        for (; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }

        hash = binb(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
        return binb2rstr(binb(opad.concat(hash), 512 + 256));
      }

      /*
       * Main sha256 function, with its support functions
       */

      function sha256_S(X, n) {
        return (X >>> n) | (X << (32 - n));
      }

      function sha256_R(X, n) {
        return (X >>> n);
      }

      function sha256_Ch(x, y, z) {
        return ((x & y) ^ ((~x) & z));
      }

      function sha256_Maj(x, y, z) {
        return ((x & y) ^ (x & z) ^ (y & z));
      }

      function sha256_Sigma0256(x) {
        return (sha256_S(x, 2) ^ sha256_S(x, 13) ^ sha256_S(x, 22));
      }

      function sha256_Sigma1256(x) {
        return (sha256_S(x, 6) ^ sha256_S(x, 11) ^ sha256_S(x, 25));
      }

      function sha256_Gamma0256(x) {
        return (sha256_S(x, 7) ^ sha256_S(x, 18) ^ sha256_R(x, 3));
      }

      function sha256_Gamma1256(x) {
        return (sha256_S(x, 17) ^ sha256_S(x, 19) ^ sha256_R(x, 10));
      }

      function sha256_Sigma0512(x) {
        return (sha256_S(x, 28) ^ sha256_S(x, 34) ^ sha256_S(x, 39));
      }

      function sha256_Sigma1512(x) {
        return (sha256_S(x, 14) ^ sha256_S(x, 18) ^ sha256_S(x, 41));
      }

      function sha256_Gamma0512(x) {
        return (sha256_S(x, 1) ^ sha256_S(x, 8) ^ sha256_R(x, 7));
      }

      function sha256_Gamma1512(x) {
        return (sha256_S(x, 19) ^ sha256_S(x, 61) ^ sha256_R(x, 6));
      }

      sha256_K = [
        1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993, -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987,
        1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522,
        264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
        113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
        1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885, -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
        430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
        1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872, -1866530822, -1538233109, -1090935817, -965641998
      ];

      function binb(m, l) {
        var HASH = [1779033703, -1150833019, 1013904242, -1521486534,
          1359893119, -1694144372, 528734635, 1541459225
        ];
        var W = new Array(64);
        var a, b, c, d, e, f, g, h;
        var i, j, T1, T2;

        /* append padding */
        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;

        for (i = 0; i < m.length; i += 16) {
          a = HASH[0];
          b = HASH[1];
          c = HASH[2];
          d = HASH[3];
          e = HASH[4];
          f = HASH[5];
          g = HASH[6];
          h = HASH[7];

          for (j = 0; j < 64; j += 1) {
            if (j < 16) {
              W[j] = m[j + i];
            } else {
              W[j] = safe_add(safe_add(safe_add(sha256_Gamma1256(W[j - 2]), W[j - 7]),
                sha256_Gamma0256(W[j - 15])), W[j - 16]);
            }

            T1 = safe_add(safe_add(safe_add(safe_add(h, sha256_Sigma1256(e)), sha256_Ch(e, f, g)),
              sha256_K[j]), W[j]);
            T2 = safe_add(sha256_Sigma0256(a), sha256_Maj(a, b, c));
            h = g;
            g = f;
            f = e;
            e = safe_add(d, T1);
            d = c;
            c = b;
            b = a;
            a = safe_add(T1, T2);
          }

          HASH[0] = safe_add(a, HASH[0]);
          HASH[1] = safe_add(b, HASH[1]);
          HASH[2] = safe_add(c, HASH[2]);
          HASH[3] = safe_add(d, HASH[3]);
          HASH[4] = safe_add(e, HASH[4]);
          HASH[5] = safe_add(f, HASH[5]);
          HASH[6] = safe_add(g, HASH[6]);
          HASH[7] = safe_add(h, HASH[7]);
        }
        return HASH;
      }

    },

    /**
     * @class Hashes.SHA512
     * @param {config}
     *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-512, as defined in FIPS 180-2
     * Version 2.2 Copyright Anonymous Contributor, Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     */
    SHA512: function(options) {
      /**
       * Private properties configuration variables. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * @see this.setUpperCase() method
       * @see this.setPad() method
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false,
        /* hexadecimal output case format. false - lowercase; true - uppercase  */
        b64pad = (options && typeof options.pad === 'string') ? options.pad : '=',
        /* base-64 pad character. Default '=' for strict RFC compliance   */
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true,
        /* enable/disable utf8 encoding */
        sha512_k;

      /* privileged (public) methods */
      this.hex = function(s) {
        return rstr2hex(rstr(s));
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d));
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * @description Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */
      this.setPad = function(a) {
        b64pad = a || b64pad;
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      /* private methods */

      /**
       * Calculate the SHA-512 of a raw string
       */

      function rstr(s) {
        s = (utf8) ? utf8Encode(s) : s;
        return binb2rstr(binb(rstr2binb(s), s.length * 8));
      }
      /*
       * Calculate the HMAC-SHA-512 of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;

        var hash, i = 0,
          bkey = rstr2binb(key),
          ipad = Array(32),
          opad = Array(32);

        if (bkey.length > 32) {
          bkey = binb(bkey, key.length * 8);
        }

        for (; i < 32; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }

        hash = binb(ipad.concat(rstr2binb(data)), 1024 + data.length * 8);
        return binb2rstr(binb(opad.concat(hash), 1024 + 512));
      }

      /**
       * Calculate the SHA-512 of an array of big-endian dwords, and a bit length
       */

      function binb(x, len) {
        var j, i, l,
          W = new Array(80),
          hash = new Array(16),
          //Initial hash values
          H = [
            new int64(0x6a09e667, -205731576),
            new int64(-1150833019, -2067093701),
            new int64(0x3c6ef372, -23791573),
            new int64(-1521486534, 0x5f1d36f1),
            new int64(0x510e527f, -1377402159),
            new int64(-1694144372, 0x2b3e6c1f),
            new int64(0x1f83d9ab, -79577749),
            new int64(0x5be0cd19, 0x137e2179)
          ],
          T1 = new int64(0, 0),
          T2 = new int64(0, 0),
          a = new int64(0, 0),
          b = new int64(0, 0),
          c = new int64(0, 0),
          d = new int64(0, 0),
          e = new int64(0, 0),
          f = new int64(0, 0),
          g = new int64(0, 0),
          h = new int64(0, 0),
          //Temporary variables not specified by the document
          s0 = new int64(0, 0),
          s1 = new int64(0, 0),
          Ch = new int64(0, 0),
          Maj = new int64(0, 0),
          r1 = new int64(0, 0),
          r2 = new int64(0, 0),
          r3 = new int64(0, 0);

        if (sha512_k === undefined) {
          //SHA512 constants
          sha512_k = [
            new int64(0x428a2f98, -685199838), new int64(0x71374491, 0x23ef65cd),
            new int64(-1245643825, -330482897), new int64(-373957723, -2121671748),
            new int64(0x3956c25b, -213338824), new int64(0x59f111f1, -1241133031),
            new int64(-1841331548, -1357295717), new int64(-1424204075, -630357736),
            new int64(-670586216, -1560083902), new int64(0x12835b01, 0x45706fbe),
            new int64(0x243185be, 0x4ee4b28c), new int64(0x550c7dc3, -704662302),
            new int64(0x72be5d74, -226784913), new int64(-2132889090, 0x3b1696b1),
            new int64(-1680079193, 0x25c71235), new int64(-1046744716, -815192428),
            new int64(-459576895, -1628353838), new int64(-272742522, 0x384f25e3),
            new int64(0xfc19dc6, -1953704523), new int64(0x240ca1cc, 0x77ac9c65),
            new int64(0x2de92c6f, 0x592b0275), new int64(0x4a7484aa, 0x6ea6e483),
            new int64(0x5cb0a9dc, -1119749164), new int64(0x76f988da, -2096016459),
            new int64(-1740746414, -295247957), new int64(-1473132947, 0x2db43210),
            new int64(-1341970488, -1728372417), new int64(-1084653625, -1091629340),
            new int64(-958395405, 0x3da88fc2), new int64(-710438585, -1828018395),
            new int64(0x6ca6351, -536640913), new int64(0x14292967, 0xa0e6e70),
            new int64(0x27b70a85, 0x46d22ffc), new int64(0x2e1b2138, 0x5c26c926),
            new int64(0x4d2c6dfc, 0x5ac42aed), new int64(0x53380d13, -1651133473),
            new int64(0x650a7354, -1951439906), new int64(0x766a0abb, 0x3c77b2a8),
            new int64(-2117940946, 0x47edaee6), new int64(-1838011259, 0x1482353b),
            new int64(-1564481375, 0x4cf10364), new int64(-1474664885, -1136513023),
            new int64(-1035236496, -789014639), new int64(-949202525, 0x654be30),
            new int64(-778901479, -688958952), new int64(-694614492, 0x5565a910),
            new int64(-200395387, 0x5771202a), new int64(0x106aa070, 0x32bbd1b8),
            new int64(0x19a4c116, -1194143544), new int64(0x1e376c08, 0x5141ab53),
            new int64(0x2748774c, -544281703), new int64(0x34b0bcb5, -509917016),
            new int64(0x391c0cb3, -976659869), new int64(0x4ed8aa4a, -482243893),
            new int64(0x5b9cca4f, 0x7763e373), new int64(0x682e6ff3, -692930397),
            new int64(0x748f82ee, 0x5defb2fc), new int64(0x78a5636f, 0x43172f60),
            new int64(-2067236844, -1578062990), new int64(-1933114872, 0x1a6439ec),
            new int64(-1866530822, 0x23631e28), new int64(-1538233109, -561857047),
            new int64(-1090935817, -1295615723), new int64(-965641998, -479046869),
            new int64(-903397682, -366583396), new int64(-779700025, 0x21c0c207),
            new int64(-354779690, -840897762), new int64(-176337025, -294727304),
            new int64(0x6f067aa, 0x72176fba), new int64(0xa637dc5, -1563912026),
            new int64(0x113f9804, -1090974290), new int64(0x1b710b35, 0x131c471b),
            new int64(0x28db77f5, 0x23047d84), new int64(0x32caab7b, 0x40c72493),
            new int64(0x3c9ebe0a, 0x15c9bebc), new int64(0x431d67c4, -1676669620),
            new int64(0x4cc5d4be, -885112138), new int64(0x597f299c, -60457430),
            new int64(0x5fcb6fab, 0x3ad6faec), new int64(0x6c44198c, 0x4a475817)
          ];
        }

        for (i = 0; i < 80; i += 1) {
          W[i] = new int64(0, 0);
        }

        // append padding to the source string. The format is described in the FIPS.
        x[len >> 5] |= 0x80 << (24 - (len & 0x1f));
        x[((len + 128 >> 10) << 5) + 31] = len;
        l = x.length;
        for (i = 0; i < l; i += 32) { //32 dwords is the block size
          int64copy(a, H[0]);
          int64copy(b, H[1]);
          int64copy(c, H[2]);
          int64copy(d, H[3]);
          int64copy(e, H[4]);
          int64copy(f, H[5]);
          int64copy(g, H[6]);
          int64copy(h, H[7]);

          for (j = 0; j < 16; j += 1) {
            W[j].h = x[i + 2 * j];
            W[j].l = x[i + 2 * j + 1];
          }

          for (j = 16; j < 80; j += 1) {
            //sigma1
            int64rrot(r1, W[j - 2], 19);
            int64revrrot(r2, W[j - 2], 29);
            int64shr(r3, W[j - 2], 6);
            s1.l = r1.l ^ r2.l ^ r3.l;
            s1.h = r1.h ^ r2.h ^ r3.h;
            //sigma0
            int64rrot(r1, W[j - 15], 1);
            int64rrot(r2, W[j - 15], 8);
            int64shr(r3, W[j - 15], 7);
            s0.l = r1.l ^ r2.l ^ r3.l;
            s0.h = r1.h ^ r2.h ^ r3.h;

            int64add4(W[j], s1, W[j - 7], s0, W[j - 16]);
          }

          for (j = 0; j < 80; j += 1) {
            //Ch
            Ch.l = (e.l & f.l) ^ (~e.l & g.l);
            Ch.h = (e.h & f.h) ^ (~e.h & g.h);

            //Sigma1
            int64rrot(r1, e, 14);
            int64rrot(r2, e, 18);
            int64revrrot(r3, e, 9);
            s1.l = r1.l ^ r2.l ^ r3.l;
            s1.h = r1.h ^ r2.h ^ r3.h;

            //Sigma0
            int64rrot(r1, a, 28);
            int64revrrot(r2, a, 2);
            int64revrrot(r3, a, 7);
            s0.l = r1.l ^ r2.l ^ r3.l;
            s0.h = r1.h ^ r2.h ^ r3.h;

            //Maj
            Maj.l = (a.l & b.l) ^ (a.l & c.l) ^ (b.l & c.l);
            Maj.h = (a.h & b.h) ^ (a.h & c.h) ^ (b.h & c.h);

            int64add5(T1, h, s1, Ch, sha512_k[j], W[j]);
            int64add(T2, s0, Maj);

            int64copy(h, g);
            int64copy(g, f);
            int64copy(f, e);
            int64add(e, d, T1);
            int64copy(d, c);
            int64copy(c, b);
            int64copy(b, a);
            int64add(a, T1, T2);
          }
          int64add(H[0], H[0], a);
          int64add(H[1], H[1], b);
          int64add(H[2], H[2], c);
          int64add(H[3], H[3], d);
          int64add(H[4], H[4], e);
          int64add(H[5], H[5], f);
          int64add(H[6], H[6], g);
          int64add(H[7], H[7], h);
        }

        //represent the hash as an array of 32-bit dwords
        for (i = 0; i < 8; i += 1) {
          hash[2 * i] = H[i].h;
          hash[2 * i + 1] = H[i].l;
        }
        return hash;
      }

      //A constructor for 64-bit numbers

      function int64(h, l) {
        this.h = h;
        this.l = l;
        //this.toString = int64toString;
      }

      //Copies src into dst, assuming both are 64-bit numbers

      function int64copy(dst, src) {
        dst.h = src.h;
        dst.l = src.l;
      }

      //Right-rotates a 64-bit number by shift
      //Won't handle cases of shift>=32
      //The function revrrot() is for that

      function int64rrot(dst, x, shift) {
        dst.l = (x.l >>> shift) | (x.h << (32 - shift));
        dst.h = (x.h >>> shift) | (x.l << (32 - shift));
      }

      //Reverses the dwords of the source and then rotates right by shift.
      //This is equivalent to rotation by 32+shift

      function int64revrrot(dst, x, shift) {
        dst.l = (x.h >>> shift) | (x.l << (32 - shift));
        dst.h = (x.l >>> shift) | (x.h << (32 - shift));
      }

      //Bitwise-shifts right a 64-bit number by shift
      //Won't handle shift>=32, but it's never needed in SHA512

      function int64shr(dst, x, shift) {
        dst.l = (x.l >>> shift) | (x.h << (32 - shift));
        dst.h = (x.h >>> shift);
      }

      //Adds two 64-bit numbers
      //Like the original implementation, does not rely on 32-bit operations

      function int64add(dst, x, y) {
        var w0 = (x.l & 0xffff) + (y.l & 0xffff);
        var w1 = (x.l >>> 16) + (y.l >>> 16) + (w0 >>> 16);
        var w2 = (x.h & 0xffff) + (y.h & 0xffff) + (w1 >>> 16);
        var w3 = (x.h >>> 16) + (y.h >>> 16) + (w2 >>> 16);
        dst.l = (w0 & 0xffff) | (w1 << 16);
        dst.h = (w2 & 0xffff) | (w3 << 16);
      }

      //Same, except with 4 addends. Works faster than adding them one by one.

      function int64add4(dst, a, b, c, d) {
        var w0 = (a.l & 0xffff) + (b.l & 0xffff) + (c.l & 0xffff) + (d.l & 0xffff);
        var w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (w0 >>> 16);
        var w2 = (a.h & 0xffff) + (b.h & 0xffff) + (c.h & 0xffff) + (d.h & 0xffff) + (w1 >>> 16);
        var w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (w2 >>> 16);
        dst.l = (w0 & 0xffff) | (w1 << 16);
        dst.h = (w2 & 0xffff) | (w3 << 16);
      }

      //Same, except with 5 addends

      function int64add5(dst, a, b, c, d, e) {
        var w0 = (a.l & 0xffff) + (b.l & 0xffff) + (c.l & 0xffff) + (d.l & 0xffff) + (e.l & 0xffff),
          w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (e.l >>> 16) + (w0 >>> 16),
          w2 = (a.h & 0xffff) + (b.h & 0xffff) + (c.h & 0xffff) + (d.h & 0xffff) + (e.h & 0xffff) + (w1 >>> 16),
          w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (e.h >>> 16) + (w2 >>> 16);
        dst.l = (w0 & 0xffff) | (w1 << 16);
        dst.h = (w2 & 0xffff) | (w3 << 16);
      }
    },
    /**
     * @class Hashes.RMD160
     * @constructor
     * @param {Object} [config]
     *
     * A JavaScript implementation of the RIPEMD-160 Algorithm
     * Version 2.2 Copyright Jeremy Lin, Paul Johnston 2000 - 2009.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * See http://pajhome.org.uk/crypt/md5 for details.
     * Also http://www.ocf.berkeley.edu/~jjlin/jsotp/
     */
    RMD160: function(options) {
      /**
       * Private properties configuration variables. You may need to tweak these to be compatible with
       * the server-side, but the defaults work in most cases.
       * @see this.setUpperCase() method
       * @see this.setPad() method
       */
      var hexcase = (options && typeof options.uppercase === 'boolean') ? options.uppercase : false,
        /* hexadecimal output case format. false - lowercase; true - uppercase  */
        b64pad = (options && typeof options.pad === 'string') ? options.pa : '=',
        /* base-64 pad character. Default '=' for strict RFC compliance   */
        utf8 = (options && typeof options.utf8 === 'boolean') ? options.utf8 : true,
        /* enable/disable utf8 encoding */
        rmd160_r1 = [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
          7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
          3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
          1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
          4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
        ],
        rmd160_r2 = [
          5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
          6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
          15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
          8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
          12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
        ],
        rmd160_s1 = [
          11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
          7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
          11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
          11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
          9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
        ],
        rmd160_s2 = [
          8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
          9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
          9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
          15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
          8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
        ];

      /* privileged (public) methods */
      this.hex = function(s) {
        return rstr2hex(rstr(s, utf8));
      };
      this.b64 = function(s) {
        return rstr2b64(rstr(s, utf8), b64pad);
      };
      this.any = function(s, e) {
        return rstr2any(rstr(s, utf8), e);
      };
      this.raw = function(s) {
        return rstr(s, utf8);
      };
      this.hex_hmac = function(k, d) {
        return rstr2hex(rstr_hmac(k, d));
      };
      this.b64_hmac = function(k, d) {
        return rstr2b64(rstr_hmac(k, d), b64pad);
      };
      this.any_hmac = function(k, d, e) {
        return rstr2any(rstr_hmac(k, d), e);
      };
      /**
       * Perform a simple self-test to see if the VM is working
       * @return {String} Hexadecimal hash sample
       * @public
       */
      this.vm_test = function() {
        return hex('abc').toLowerCase() === '900150983cd24fb0d6963f7d28e17f72';
      };
      /**
       * @description Enable/disable uppercase hexadecimal returned string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUpperCase = function(a) {
        if (typeof a === 'boolean') {
          hexcase = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {string} Pad
       * @return {Object} this
       * @public
       */
      this.setPad = function(a) {
        if (typeof a !== 'undefined') {
          b64pad = a;
        }
        return this;
      };
      /**
       * @description Defines a base64 pad string
       * @param {boolean}
       * @return {Object} this
       * @public
       */
      this.setUTF8 = function(a) {
        if (typeof a === 'boolean') {
          utf8 = a;
        }
        return this;
      };

      /* private methods */

      /**
       * Calculate the rmd160 of a raw string
       */

      function rstr(s) {
        s = (utf8) ? utf8Encode(s) : s;
        return binl2rstr(binl(rstr2binl(s), s.length * 8));
      }

      /**
       * Calculate the HMAC-rmd160 of a key and some data (raw strings)
       */

      function rstr_hmac(key, data) {
        key = (utf8) ? utf8Encode(key) : key;
        data = (utf8) ? utf8Encode(data) : data;
        var i, hash,
          bkey = rstr2binl(key),
          ipad = Array(16),
          opad = Array(16);

        if (bkey.length > 16) {
          bkey = binl(bkey, key.length * 8);
        }

        for (i = 0; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl(opad.concat(hash), 512 + 160));
      }

      /**
       * Convert an array of little-endian words to a string
       */

      function binl2rstr(input) {
        var i, output = '',
          l = input.length * 32;
        for (i = 0; i < l; i += 8) {
          output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
      }

      /**
       * Calculate the RIPE-MD160 of an array of little-endian words, and a bit length.
       */

      function binl(x, len) {
        var T, j, i, l,
          h0 = 0x67452301,
          h1 = 0xefcdab89,
          h2 = 0x98badcfe,
          h3 = 0x10325476,
          h4 = 0xc3d2e1f0,
          A1, B1, C1, D1, E1,
          A2, B2, C2, D2, E2;

        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        l = x.length;

        for (i = 0; i < l; i += 16) {
          A1 = A2 = h0;
          B1 = B2 = h1;
          C1 = C2 = h2;
          D1 = D2 = h3;
          E1 = E2 = h4;
          for (j = 0; j <= 79; j += 1) {
            T = safe_add(A1, rmd160_f(j, B1, C1, D1));
            T = safe_add(T, x[i + rmd160_r1[j]]);
            T = safe_add(T, rmd160_K1(j));
            T = safe_add(bit_rol(T, rmd160_s1[j]), E1);
            A1 = E1;
            E1 = D1;
            D1 = bit_rol(C1, 10);
            C1 = B1;
            B1 = T;
            T = safe_add(A2, rmd160_f(79 - j, B2, C2, D2));
            T = safe_add(T, x[i + rmd160_r2[j]]);
            T = safe_add(T, rmd160_K2(j));
            T = safe_add(bit_rol(T, rmd160_s2[j]), E2);
            A2 = E2;
            E2 = D2;
            D2 = bit_rol(C2, 10);
            C2 = B2;
            B2 = T;
          }

          T = safe_add(h1, safe_add(C1, D2));
          h1 = safe_add(h2, safe_add(D1, E2));
          h2 = safe_add(h3, safe_add(E1, A2));
          h3 = safe_add(h4, safe_add(A1, B2));
          h4 = safe_add(h0, safe_add(B1, C2));
          h0 = T;
        }
        return [h0, h1, h2, h3, h4];
      }

      // specific algorithm methods

      function rmd160_f(j, x, y, z) {
        return (0 <= j && j <= 15) ? (x ^ y ^ z) :
          (16 <= j && j <= 31) ? (x & y) | (~x & z) :
          (32 <= j && j <= 47) ? (x | ~y) ^ z :
          (48 <= j && j <= 63) ? (x & z) | (y & ~z) :
          (64 <= j && j <= 79) ? x ^ (y | ~z) :
          'rmd160_f: j out of range';
      }

      function rmd160_K1(j) {
        return (0 <= j && j <= 15) ? 0x00000000 :
          (16 <= j && j <= 31) ? 0x5a827999 :
          (32 <= j && j <= 47) ? 0x6ed9eba1 :
          (48 <= j && j <= 63) ? 0x8f1bbcdc :
          (64 <= j && j <= 79) ? 0xa953fd4e :
          'rmd160_K1: j out of range';
      }

      function rmd160_K2(j) {
        return (0 <= j && j <= 15) ? 0x50a28be6 :
          (16 <= j && j <= 31) ? 0x5c4dd124 :
          (32 <= j && j <= 47) ? 0x6d703ef3 :
          (48 <= j && j <= 63) ? 0x7a6d76e9 :
          (64 <= j && j <= 79) ? 0x00000000 :
          'rmd160_K2: j out of range';
      }
    }
  };

  // exposes Hashes
  (function(window, undefined) {
    var freeExports = false;
    if (true) {
      freeExports = exports;
      if (exports && typeof __webpack_require__.g === 'object' && __webpack_require__.g && __webpack_require__.g === __webpack_require__.g.global) {
        window = __webpack_require__.g;
      }
    }

    if (true) {
      // define as an anonymous module, so, through path mapping, it can be aliased
      !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
        return Hashes;
      }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
  }(this));
}()); // IIFE


/***/ }),

/***/ "./node_modules/mock-xmlhttprequest/dist/mock-xmlhttprequest.esm.js":
/*!**************************************************************************!*\
  !*** ./node_modules/mock-xmlhttprequest/dist/mock-xmlhttprequest.esm.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MockXhr": () => (/* binding */ MockXhr),
/* harmony export */   "MockXhrServer": () => (/* binding */ MockXhrServer),
/* harmony export */   "newMockXhr": () => (/* binding */ newMockXhr),
/* harmony export */   "newServer": () => (/* binding */ newServer)
/* harmony export */ });
/**
 * mock-xmlhttprequest v7.0.4
 * (c) 2021 Bertrand Guay-Paquet
 * @license ISC
 */
/**
 * XMLHttpRequest events
 */
class Event {
  /**
   * @param {string} type event type
   * @param {number} loaded loaded bytes
   * @param {number} total total bytes
   */
  constructor(type, loaded, total) {
    this.type = type;
    this.loaded = loaded !== undefined ? loaded : 0;
    if (total > 0) {
      this.total = total;
      this.lengthComputable = true;
    } else {
      this.total = 0;
      this.lengthComputable = false;
    }
  }
}

function flattenUseCaptureFlag(options) {
  if (typeof options === 'boolean') {
    return options;
  }
  return !!options.capture;
}

/**
 * An EventTarget object represents a target to which an event can be dispatched when something has
 * occurred.
 *
 * Based on https://dom.spec.whatwg.org/#interface-eventtarget
 */
class EventTarget {
  /**
   * Contructor
   *
   * @param {?object} eventContext optional "this" for event handlers
   */
  constructor(eventContext = this) {
    this._eventContext = eventContext;
    this._eventListeners = {};
  }

  /**
   * @returns {boolean} whether any event listener is registered
   */
  hasListeners() {
    return EventTarget.events.some((event) => {
      return this._eventListeners[event] || this[`on${event}`];
    });
  }

  /**
   * Add an event listener.
   * See https://dom.spec.whatwg.org/#dom-eventtarget-addeventlistener
   *
   * @param {string} type event type ('load', 'abort', etc)
   * @param {EventListener|Function} callback listener callback
   * @param {boolean|object} options options object or the useCapture flag
   */
  addEventListener(type, callback, options = false) {
    if (callback) {
      const useCapture = flattenUseCaptureFlag(options);
      const listener = {
        callback,
        useCapture,
        once: !!options.once,
      };

      this._eventListeners[type] = this._eventListeners[type] || [];

      // If eventTarget’s event listener list does not contain an event listener whose type is
      // listener’s type, callback is listener’s callback, and capture is listener’s capture, then
      // append listener to eventTarget’s event listener list.
      // See https://dom.spec.whatwg.org/#add-an-event-listener
      if (!this._eventListeners[type].some((other) => {
        return other.callback === listener.callback && other.useCapture === listener.useCapture;
      })) {
        this._eventListeners[type].push(listener);
      }
    }
  }

  /**
   * Remove an event listener.
   * See https://dom.spec.whatwg.org/#dom-eventtarget-removeeventlistener
   *
   * @param {string} type event type ('load', 'abort', etc)
   * @param {EventListener|Function} callback listener callback
   * @param {boolean|object} options options object or the useCapture flag
   */
  removeEventListener(type, callback, options = false) {
    if (this._eventListeners[type]) {
      const useCapture = flattenUseCaptureFlag(options);
      const index = this._eventListeners[type].findIndex((listener) => {
        return callback === listener.callback && useCapture === listener.useCapture;
      });
      if (index >= 0) {
        this._eventListeners[type].splice(index, 1);
      }
    }
  }

  /**
   * Calls all the listeners for the event.
   *
   * @param {object} event event
   * @returns {boolean} always true since none of the xhr event are cancelable
   */
  dispatchEvent(event) {
    // Only the event listeners registered at this point should be called. Storing them here avoids
    // problems with callbacks that add or remove listeners.
    const listeners = [];
    if (this._eventListeners[event.type]) {
      listeners.push(...this._eventListeners[event.type].map((listener) => listener.callback));

      // Remove 'once' listeners
      this._eventListeners[event.type] = this._eventListeners[event.type]
        .filter((listener) => !listener.once);
    }

    // Handle event listeners added as object properties (e.g. obj.onload = ...)
    if (EventTarget.events.includes(event.type)) {
      const listener = this[`on${event.type}`];
      if (listener) {
        listeners.push(listener);
      }
    }

    // Call the listeners
    listeners.forEach((listener) => {
      if (typeof listener === 'function') {
        listener.call(this._eventContext, event);
      } else {
        listener.handleEvent();
      }
    });
    return true;
  }
}

/**
 * XMLHttpRequest events
 */
EventTarget.events = [
  'loadstart',
  'progress',
  'abort',
  'error',
  'load',
  'timeout',
  'loadend',
];

/**
 * HTTP header container
 */
class HeadersContainer {
  /**
   * @param {object} headers initial headers
   */
  constructor(headers) {
    this._headers = new Map();
    if (headers && headers instanceof Object) {
      Object.keys(headers).forEach((key) => {
        this.addHeader(key, headers[key]);
      });
    }
  }

  /**
   * Reset the container to its empty state.
   */
  reset() {
    this._headers.clear();
  }

  /**
   * Get header value. Header names are case-insensitive.
   *
   * @param  {string} name header name
   * @returns {string|null} header value or null
   */
  getHeader(name) {
    const value = this._headers.get(name.toLowerCase());
    return value !== undefined ? value : null;
  }

  /**
   * Get all headers as a string. Each header is on its own line.
   *
   * @returns {string} concatenated headers
   */
  getAll() {
    // Sort the header names. It's not mandated by RFC 7230 but it makes assertion testing easier
    // and, most importantly, it is required by getAllResponseHeaders() of XMLHttpRequest.
    // See https://xhr.spec.whatwg.org/#the-getallresponseheaders()-method
    const headerNames = [...this._headers.keys()].sort((a, b) => {
      if (a.toUpperCase() < b.toUpperCase()) {
        return -1;
      }
      if (a.toUpperCase() > b.toUpperCase()) {
        return 1;
      }
      return 0;
    });

    // Combine the header values
    const headers = headerNames.reduce((result, name) => {
      const headerValue = this._headers.get(name);
      return `${result}${name}: ${headerValue}\r\n`;
    }, '');
    return headers;
  }

  /**
   * Get all headers as an object.
   *
   * @returns {object} headers
   */
  getHash() {
    const headers = {};
    this._headers.forEach((value, name) => {
      headers[name] = value;
    });
    return headers;
  }

  /**
   * Add a header value, combining it with any previous value for the same header name.
   *
   * @param {string} name header name
   * @param {string} value header value
   */
  addHeader(name, value) {
    name = name.toLowerCase();
    const currentValue = this._headers.get(name);
    if (currentValue) {
      value = `${currentValue}, ${value}`;
    }
    this._headers.set(name, value);
  }
}

function getBodyByteSize(body) {
  if (!body) {
    return 0;
  }

  if (typeof body === 'string') {
    return getStringByteLength(body);
  } else if ((__webpack_require__.g.FormData && body instanceof __webpack_require__.g.FormData)
    || (body.constructor && body.constructor.name === 'FormData')) {
    // A FormData has field-value pairs. This testing code only sums the individual sizes of the
    // values. The full multipart/form-data encoding also adds headers, encoding, etc. which we
    // don't reproduce here.
    return Array.from(body.values()).reduce((sum, value) => {
      const valueSize = value.size || getStringByteLength(String(value));
      return sum + valueSize;
    }, 0);
  }

  // Handles Blob and BufferSource
  return body.size || body.byteLength || 0;
}

function getStringByteLength(string) {
  // Compute the byte length of the string (which is not the same as string.length)
  return __webpack_require__.g.Blob ? new __webpack_require__.g.Blob(string).size : Buffer.byteLength(string);
}

// Disallowed request headers for setRequestHeader()
const forbiddenHeaders = [
  'Accept-Charset',
  'Accept-Encoding',
  'Access-Control-Request-Headers',
  'Access-Control-Request-Method',
  'Connection',
  'Content-Length',
  'Cookie',
  'Cookie2',
  'Date',
  'DNT',
  'Expect',
  'Host',
  'Keep-Alive',
  'Origin',
  'Referer',
  'TE',
  'Trailer',
  'Transfer-Encoding',
  'Upgrade',
  'Via',
];
const forbiddenHeaderRegEx = new RegExp(`^(${forbiddenHeaders.join('|')}|Proxy-.*|Sec-.*)$`, 'i');

/**
 * See https://fetch.spec.whatwg.org/#forbidden-header-name
 *
 * @param {string} name header name
 * @returns {boolean} whether the request header name is forbidden for XMLHttpRequest
 */
function isRequestHeaderForbidden(name) {
  return forbiddenHeaderRegEx.test(name);
}

/**
 * See https://fetch.spec.whatwg.org/#forbidden-method
 *
 * @param {string} name method name
 * @returns {boolean} whether the request method is forbidden for XMLHttpRequest
 */
function isRequestMethodForbidden(method) {
  return /^(CONNECT|TRACE|TRACK)$/i.test(method);
}

// Normalize method names as described in open()
// https://xhr.spec.whatwg.org/#the-open()-method
const upperCaseMethods = [
  'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'POST',
  'PUT',
];
const upperCaseMethodsRegEx = new RegExp(`^(${upperCaseMethods.join('|')})$`, 'i');

/**
 * See https://fetch.spec.whatwg.org/#concept-method-normalize
 *
 * @param {string} method HTTP method name
 * @returns {string} normalized method name
 */
function normalizeHTTPMethodName(method) {
  if (upperCaseMethodsRegEx.test(method)) {
    method = method.toUpperCase();
  }
  return method;
}

// Status code reason phrases from RFC 7231 §6.1, RFC 4918, RFC 5842, RFC 6585 and RFC 7538
const statusTexts = {
  100: 'Continue',
  101: 'Switching Protocols',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content', // RFC 7233
  207: 'Multi-Status', // RFC 4918
  208: 'Already Reported', // RFC 5842
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified', // RFC 7232
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect', // RFC 7538
  400: 'Bad Request',
  401: 'Unauthorized', // RFC 7235
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required', // RFC 7235
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed', // RFC 7232
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable', // RFC 7233
  417: 'Expectation Failed',
  422: 'Unprocessable Entity', // RFC 4918
  423: 'Locked', // RFC 4918
  424: 'Failed Dependency', // RFC 4918
  426: 'Upgrade Required',
  428: 'Precondition Required', // RFC 6585
  429: 'Too Many Requests', // RFC 6585
  431: 'Request Header Fields Too Large', // RFC 6585
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  507: 'Insufficient Storage', // RFC 4918
  511: 'Network Authentication Required', // RFC 6585
};

/**
 * @param {number} status HTTP status code
 * @returns {string} status text
 */
function getStatusText(status) {
  return statusTexts[status] || 'Unknown Status';
}

function throwError(type, text = '') {
  const exception = new Error(text);
  exception.name = type;
  throw exception;
}

/**
 * XMLHttpRequest mock for testing.
 * Based on https://xhr.spec.whatwg.org version '18 August 2020'.
 *
 * Supports:
 *  - events and states
 *  - open(), setRequestHeader(), send() and abort()
 *  - upload and download progress events
 *  - response status, statusText, headers and body
 *  - the timeout attribute (can be disabled) (since v4.0.0)
 *  - simulating a network error
 *  - simulating a request timeout (see MockXhr.setRequestTimeout())
 *
 * Partial support:
 *  - overrideMimeType(): throws when required, but has no other effect.
 *  - responseType: '', 'text' and 'json' are fully supported. Other responseType values can also be
 *    used, but they will return the response body given to setResponseBody() as-is in xhr.response.
 *  - responseXml: the response body is not converted to a document response. To get a document
 *    response, use it directly as the response body in setResponseBody().
 *
 * Not supported:
 * - synchronous requests (i.e. async == false)
 * - parsing the url and setting the username and password since there are no actual HTTP requests
 * - responseUrl (i.e. the final request url with redirects) is not automatically set. This can be
 *   emulated in a request handler.
 */
class MockXhr extends EventTarget {
  /**
   * Constructor
   */
  constructor() {
    super();
    this._readyState = MockXhr.UNSENT;
    this.requestHeaders = new HeadersContainer();
    this._withCredentials = false;
    this._timeout = 0;
    this._upload = new EventTarget(this);
    this._response = this._networkErrorResponse();

    // Per-instance flag to enable the effects of the timeout attribute
    this.timeoutEnabled = true;

    // Hook for XMLHttpRequest creation
    if (typeof MockXhr.onCreate === 'function') {
      MockXhr.onCreate(this);
    }
  }

  ////////////
  // States //
  ////////////

  /**
   * https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
   *
   * @returns {number} readystate attribute
   */
  get readyState() {
    return this._readyState;
  }

  /**
   * noop setter
   *
   * @param {*} value ignored value
   * @returns {number} value
   */
  set readyState(value) { return value; }

  /////////////
  // Request //
  /////////////

  /**
   * Set the request method and url.
   * https://xhr.spec.whatwg.org/#the-open()-method
   *
   * @param {string} method request HTTP method (GET, POST, etc.)
   * @param {string} url request url
   * @param {boolean} async async request flag (only true is supported)
   */
  open(method, url, async = true) {
    if (!async) {
      throw new Error('async = false is not supported.');
    }
    if (isRequestMethodForbidden(method)) {
      throwError('SecurityError', `Method "${method}" forbidden.`);
    }
    method = normalizeHTTPMethodName(method);
    // Skip parsing the url and setting the username and password

    this._terminateRequest();

    // Set variables
    this._sendFlag = false;
    this._uploadListenerFlag = false;
    this.method = method;
    this.url = url;
    this.requestHeaders.reset();
    this._response = this._networkErrorResponse();
    if (this._readyState !== MockXhr.OPENED) {
      this._readyState = MockXhr.OPENED;
      this._fireReadyStateChange();
    }
  }

  /**
   * Add a request header value.
   * https://xhr.spec.whatwg.org/#the-setrequestheader()-method
   *
   * @param {string} name header name
   * @param {string} value header value
   */
  setRequestHeader(name, value) {
    if (this._readyState !== MockXhr.OPENED || this._sendFlag) {
      throwError('InvalidStateError');
    }
    if (typeof name !== 'string' || typeof value !== 'string') {
      throw new SyntaxError();
    }

    if (!isRequestHeaderForbidden(name)) {
      // Normalize value
      value = value.trim();
      this.requestHeaders.addHeader(name, value);
    }
  }

  /**
   * https://xhr.spec.whatwg.org/#dom-xmlhttprequest-timeout
   *
   * @returns {number} timeout attribute
   */
  get timeout() {
    return this._timeout;
  }

  /**
   * https://xhr.spec.whatwg.org/#dom-xmlhttprequest-timeout
   *
   * @param {number} value timeout value
   */
  set timeout(value) {
    // Since this library is meant to run on node, skip the step involving the Window object.
    this._timeout = value;
    if (this._sendFlag && this.timeoutEnabled && this.constructor.timeoutEnabled) {
      // A fetch is active so schedule a request timeout
      this._scheduleRequestTimeout();
    }
  }

  /**
   * https://xhr.spec.whatwg.org/#dom-xmlhttprequest-withcredentials
   *
   * @returns {boolean} withCredentials attribute
   */
  get withCredentials() {
    return this._withCredentials;
  }

  /**
   * https://xhr.spec.whatwg.org/#dom-xmlhttprequest-withcredentials
   *
   * @param {boolean} value withCredentials value
   */
  set withCredentials(value) {
    if ((this._readyState !== MockXhr.UNSENT && this._readyState !== MockXhr.OPENED)
      || this._sendFlag) {
      throwError('InvalidStateError');
    }
    this._withCredentials = !!value;
  }

  /**
   * https://xhr.spec.whatwg.org/#the-upload-attribute
   *
   * @returns {EventTarget} upload attribute
   */
  get upload() {
    return this._upload;
  }

  /**
   * noop setter
   *
   * @param {*} value ignored value
   * @returns {EventTarget} value
   */
  set upload(value) { return value; }

  /**
   * Initiate the request.
   * https://xhr.spec.whatwg.org/#the-send()-method
   *
   * @param {*} body request body
   */
  send(body = null) {
    if (this._readyState !== MockXhr.OPENED || this._sendFlag) {
      throwError('InvalidStateError');
    }
    if (this.method === 'GET' || this.method === 'HEAD') {
      body = null;
    }

    if (body !== null) {
      let extractedContentType = null;

      // Document body type not supported

      // https://fetch.spec.whatwg.org/#concept-bodyinit-extract
      {
        let contentType = null;
        if (typeof body === 'string') {
          contentType = 'text/plain;charset=UTF-8';
        } else if (body.type) {
          // As specified for Blob
          contentType = body.type;
        }

        // BufferSource, FormData, etc. not handled specially
        extractedContentType = contentType;
      }

      /*
      * Skipping step "4. If author request headers contains `Content-Type`, then:"
      * Parsing mime type strings and overriding the charset to UTF-8 seems like a lot of work
      * for little gain. If I'm wrong, please open an issue or better yet a pull request.
      */

      if (this.requestHeaders.getHeader('Content-Type') === null && extractedContentType !== null) {
        this.requestHeaders.addHeader('Content-Type', extractedContentType);
      }
    }

    this._uploadListenerFlag = this._upload.hasListeners();
    this.body = body;
    this._uploadCompleteFlag = this.body === null;
    this._timedOutFlag = false;
    this._sendFlag = true;

    this._fireEvent('loadstart', 0, 0);
    if (!this._uploadCompleteFlag && this._uploadListenerFlag) {
      this._fireUploadEvent('loadstart', 0, this.getRequestBodySize());
    }

    // Other interactions are done through the mock's response methods
    if (this._readyState !== MockXhr.OPENED || !this._sendFlag) {
      return;
    }

    this._timeoutReference = Date.now();
    this._scheduleRequestTimeout();

    // Hook for XMLHttpRequest.send(). Execute in an empty callstack
    if (typeof this.onSend === 'function') {
      // Save the callback in case it changes before it has a chance to run
      const { onSend } = this;
      setTimeout(() => onSend.call(this, this), 0);
    }
    if (typeof MockXhr.onSend === 'function') {
      // Save the callback in case it changes before it has a chance to run
      const { onSend } = MockXhr;
      setTimeout(() => onSend.call(this, this), 0);
    }
  }

  /**
   * Abort the request.
   * https://xhr.spec.whatwg.org/#the-abort()-method
   */
  abort() {
    this._terminateRequest();

    if ((this._readyState === MockXhr.OPENED && this._sendFlag)
      || this._readyState === MockXhr.HEADERS_RECEIVED
      || this._readyState === MockXhr.LOADING) {
      this._requestErrorSteps('abort');
    }

    if (this._readyState === MockXhr.DONE) {
      // No readystatechange event is dispatched.
      this._readyState = MockXhr.UNSENT;
      this._response = this._networkErrorResponse();
    }
  }

  //////////////
  // Response //
  //////////////

  /**
   * https://xhr.spec.whatwg.org/#dom-xmlhttprequest-status
   *
   * @returns {number} status attribute
   */
  get status() {
    return this._response.status;
  }

  /**
   * noop setter
   *
   * @param {*} value ignored value
   * @returns {number} value
   */
  set status(value) { return value; }

  /**
   * https://xhr.spec.whatwg.org/#the-statustext-attribute
   *
   * @returns {string} statusText attribute
   */
  get statusText() {
    return this._response.statusMessage;
  }

  /**
   * noop setter
   *
   * @param {*} value ignored value
   * @returns {string} value
   */
  set statusText(value) { return value; }

  /**
   * Get a response header value.
   * https://xhr.spec.whatwg.org/#dom-xmlhttprequest-getresponseheader
   *
   * @param {string} name header name
   * @returns {string} header value
   */
  getResponseHeader(name) {
    return this._response.headers.getHeader(name);
  }

  /**
   * Get all response headers as a string.
   * https://xhr.spec.whatwg.org/#dom-xmlhttprequest-getallresponseheaders
   *
   * @returns {string} concatenated headers
   */
  getAllResponseHeaders() {
    return this._response.headers.getAll();
  }

  /**
   * https://xhr.spec.whatwg.org/#dom-xmlhttprequest-overridemimetype
   *
   * @param {string} mime MIME type
   */
  overrideMimeType(/* mime */) {
    if (this._readyState === MockXhr.LOADING || this._readyState === MockXhr.DONE) {
      throwError('InvalidStateError');
    }
    // noop
  }

  /**
   * https://xhr.spec.whatwg.org/#dom-xmlhttprequest-responsetype
   *
   * @returns {string} responseType attribute
   */
  get responseType() {
    return this._responseType || '';
  }

  /**
   * https://xhr.spec.whatwg.org/#dom-xmlhttprequest-responsetype
   *
   * @param {string} value responseType value
   */
  set responseType(value) {
    // Since this library is meant to run on node, skip the steps involving the Window object.
    if (this._readyState === MockXhr.LOADING || this._readyState === MockXhr.DONE) {
      throwError('InvalidStateError');
    }

    // The spec doesn't mandate throwing anything on invalid values since values must be of type
    // XMLHttpRequestResponseType. Observed browser behavior is to ignore invalid values.
    const responseTypes = ['', 'arraybuffer', 'blob', 'document', 'json', 'text'];
    if (responseTypes.includes(value)) {
      this._responseType = value;
    }
  }

  /**
   * https://xhr.spec.whatwg.org/#the-response-attribute
   *
   * @returns {*} response
   */
  get response() {
    if (this.responseType === '' || this.responseType === 'text') {
      if (this._readyState !== MockXhr.LOADING && this._readyState !== MockXhr.DONE) {
        return '';
      }

      // No support for charset decoding as outlined in https://xhr.spec.whatwg.org/#text-response
      return this._response.body === null ? '' : this._response.body;
    }

    if (this._readyState !== MockXhr.DONE) {
      return null;
    }

    if (this.responseType === 'json') {
      if (this._response.body === null) {
        return null;
      }
      try {
        return JSON.parse(this._response.body);
      } catch (e) {
        return null;
      }
    }

    // Other responseTypes are sent as-is. They can be given directly by setResponseBody() anyway.
    return this._response.body;
  }

  /**
   * noop setter
   *
   * @param {*} value ignored value
   * @returns {*} value
   */
  set response(value) { return value; }

  /**
   * https://xhr.spec.whatwg.org/#the-responsetext-attribute
   *
   * @returns {string} responseText attribute
   */
  get responseText() {
    if (this.responseType !== '' && this.responseType !== 'text') {
      throwError('InvalidStateError');
    }
    if (this._readyState !== MockXhr.LOADING && this._readyState !== MockXhr.DONE) {
      return '';
    }

    // No support for charset decoding as outlined in https://xhr.spec.whatwg.org/#text-response
    return this._response.body === null ? '' : this._response.body;
  }

  /**
   * noop setter
   *
   * @param {*} value ignored value
   * @returns {string} value
   */
  set responseText(value) { return value; }

  /**
   * https://xhr.spec.whatwg.org/#dom-xmlhttprequest-responsexml
   *
   * @returns {*} responseXML attribute
   */
  get responseXML() {
    if (this.responseType !== '' && this.responseType !== 'document') {
      throwError('InvalidStateError');
    }
    if (this._readyState !== MockXhr.DONE) {
      return null;
    }

    // Since this library is meant to run on node, there is no support for charset decoding as
    // outlined in https://xhr.spec.whatwg.org/#text-response
    // If needed, a document response can be given to setResponseBody() to be returned here.
    return this._response.body === null ? '' : this._response.body;
  }

  /**
   * noop setter
   *
   * @param {*} value ignored value
   * @returns {*} value
   */
  set responseXML(value) { return value; }

  ///////////////////////////
  // Mock response methods //
  ///////////////////////////

  /**
   * Note: the non-mocked body size will be larger than this for a multipart/form-data encoded
   * FormData body since it will include headers, encoding, etc. The value returned by this method
   * can therefore be seen as a floor value for the real thing that is nonetheless useful to
   * simulate upload progress events.
   *
   * @returns {number} request body's total byte size
   */
  getRequestBodySize() {
    if (!this._sendFlag) {
      throw new Error('Mock usage error detected.');
    }
    return getBodyByteSize(this.body);
  }

  /**
   * Fire a request upload progress event.
   *
   * @param {number} transmitted bytes transmitted
   */
  uploadProgress(transmitted) {
    if (!this._sendFlag || this._uploadCompleteFlag) {
      throw new Error('Mock usage error detected.');
    }
    if (this._uploadListenerFlag) {
      // If no listeners were registered before send(), no upload events should be fired.
      this._fireUploadEvent('progress', transmitted, this.getRequestBodySize());
    }
  }

  /**
   * Complete response method. Sets the response headers and body. Will set the
   * state to DONE.
   *
   * @param {?number} status response http status (default 200)
   * @param {?object} headers name-value headers (optional)
   * @param {?*} body response body (default null)
   * @param {?string} statusText response http status text (optional)
   */
  respond(status, headers, body, statusText) {
    this.setResponseHeaders(status, headers, statusText);
    this.setResponseBody(body);
  }

  /**
   * Set only the response headers. Will change the state to HEADERS_RECEIVED.
   *
   * @param {?number} status response http status (default 200)
   * @param {?object} headers name-value headers (optional)
   * @param {?string} statusText response http status text (optional)
   */
  setResponseHeaders(status, headers, statusText) {
    if (this._readyState !== MockXhr.OPENED || !this._sendFlag) {
      throw new Error('Mock usage error detected.');
    }
    if (this.body) {
      this._requestEndOfBody();
    }
    status = typeof status === 'number' ? status : 200;
    const statusMessage = statusText !== undefined ? statusText : getStatusText(status);
    this._processResponse({
      status,
      statusMessage,
      headers: new HeadersContainer(headers),
    });
  }

  /**
   * Fire a response progress event. Will set the state to LOADING.
   *
   * @param {number} transmitted transmitted bytes
   * @param {number} length total bytes
   */
  downloadProgress(transmitted, length) {
    if (this._readyState !== MockXhr.HEADERS_RECEIVED
      && this._readyState !== MockXhr.LOADING) {
      throw new Error('Mock usage error detected.');
    }

    // Useless condition but follows the spec's wording
    if (this._readyState === MockXhr.HEADERS_RECEIVED) {
      this._readyState = MockXhr.LOADING;
    }

    // As stated in https://xhr.spec.whatwg.org/#the-send()-method
    // Web compatibility is the reason readystatechange fires more often than
    // state changes.
    this._fireReadyStateChange();
    this._fireEvent('progress', transmitted, length);
  }

  /**
   * Set the response body. Will set the state to DONE.
   *
   * @param {?*} body response body (default null)
   */
  setResponseBody(body = null) {
    if (!this._sendFlag
      || (this._readyState !== MockXhr.OPENED
        && this._readyState !== MockXhr.HEADERS_RECEIVED
        && this._readyState !== MockXhr.LOADING)) {
      throw new Error('Mock usage error detected.');
    }
    if (this._readyState === MockXhr.OPENED) {
      // Default "200 - OK" response headers
      this.setResponseHeaders();
    }

    // As stated in https://xhr.spec.whatwg.org/#the-send()-method
    // Web compatibility is the reason readystatechange fires more often than
    // state changes.
    this._readyState = MockXhr.LOADING;
    this._fireReadyStateChange();

    this._response.body = body !== undefined ? body : null;
    this._handleResponseEndOfBody();
  }

  /**
   * Simulate a network error. Will set the state to DONE.
   */
  setNetworkError() {
    if (!this._sendFlag) {
      throw new Error('Mock usage error detected.');
    }
    this._processResponse(this._networkErrorResponse());
  }

  /**
   * Simulate a request timeout. Will set the state to DONE.
   */
  setRequestTimeout() {
    if (!this._sendFlag) {
      throw new Error('Mock usage error detected.');
    }
    this._terminateRequest();
    this._timedOutFlag = true;
    this._processResponse(this._networkErrorResponse());
  }

  ///////////////////////////////////
  // Request and response handling //
  ///////////////////////////////////

  /**
   * Note: the "process request body" task is in the MockXhr response methods
   * Process request end-of-body task. When the whole request is sent.
   * https://xhr.spec.whatwg.org/#the-send()-method
   */
  _requestEndOfBody() {
    this._uploadCompleteFlag = true;

    if (this._uploadListenerFlag) {
      // If no listeners were registered before send(), these steps do not run.
      const length = this.getRequestBodySize();
      const transmitted = length;
      this._fireUploadEvent('progress', transmitted, length);
      this._fireUploadEvent('load', transmitted, length);
      this._fireUploadEvent('loadend', transmitted, length);
    }
  }

  /**
   * Process response task. When the response headers are received.
   * https://xhr.spec.whatwg.org/#the-send()-method
   *
   * @param {*} response response
   */
  _processResponse(response) {
    this._response = response;
    this._handleResponseErrors();
    if (this._isNetworkErrorResponse()) {
      return;
    }
    this._readyState = MockXhr.HEADERS_RECEIVED;
    this._fireReadyStateChange();
    if (this._readyState !== MockXhr.HEADERS_RECEIVED) {
      return;
    }
    if (this._response.body === null) {
      this._handleResponseEndOfBody();
    }
    // Further steps are triggered by the MockXhr response methods
  }

  /**
   * Handle response end-of-body for response.
   * https://xhr.spec.whatwg.org/#handle-response-end-of-body
   */
  _handleResponseEndOfBody() {
    this._handleResponseErrors();
    if (this._isNetworkErrorResponse()) {
      return;
    }
    const length = this._response.body ? this._response.body.length : 0;
    this._fireEvent('progress', length, length);
    this._readyState = MockXhr.DONE;
    this._sendFlag = false;
    this._fireReadyStateChange();
    this._fireEvent('load', length, length);
    this._fireEvent('loadend', length, length);
  }

  /**
   * Handle errors for response.
   * https://xhr.spec.whatwg.org/#handle-errors
   */
  _handleResponseErrors() {
    if (!this._sendFlag) {
      return;
    }
    if (this._timedOutFlag) {
      // Timeout
      this._requestErrorSteps('timeout');
    } else if (this._isNetworkErrorResponse()) {
      // Network error
      this._requestErrorSteps('error');
    }
  }

  /**
   * The request error steps for event 'event'.
   * https://xhr.spec.whatwg.org/#request-error-steps
   *
   * @param {string} event event name
   */
  _requestErrorSteps(event) {
    this._readyState = MockXhr.DONE;
    this._sendFlag = false;
    this._response = this._networkErrorResponse();
    this._fireReadyStateChange();
    if (!this._uploadCompleteFlag) {
      this._uploadCompleteFlag = true;

      if (this._uploadListenerFlag) {
        // If no listeners were registered before send(), no upload events should be fired.
        this._fireUploadEvent(event, 0, 0);
        this._fireUploadEvent('loadend', 0, 0);
      }
    }
    this._fireEvent(event, 0, 0);
    this._fireEvent('loadend', 0, 0);
  }

  ///////////////
  // Internals //
  ///////////////

  /**
   * @returns {object} new network error response object
   */
  _networkErrorResponse() {
    return {
      type: 'error',
      status: 0,
      statusMessage: '',
      headers: new HeadersContainer(),
      body: null,
    };
  }

  _isNetworkErrorResponse() {
    return this._response.type === 'error';
  }

  _terminateRequest() {
    delete this.method;
    delete this.url;
  }

  _newEvent(name, transmitted, length) {
    return new Event(name, transmitted, length);
  }

  _fireEvent(name, transmitted, length) {
    this.dispatchEvent(this._newEvent(name, transmitted, length));
  }

  _fireUploadEvent(name, transmitted, length) {
    this._upload.dispatchEvent(this._newEvent(name, transmitted, length));
  }

  _fireReadyStateChange() {
    const event = new Event('readystatechange');
    if (this.onreadystatechange) {
      this.onreadystatechange(event);
    }
    this.dispatchEvent(event);
  }

  _scheduleRequestTimeout() {
    // Cancel any previous timeout task
    if (this._timeoutTask) {
      clearTimeout(this._timeoutTask);
    }

    if (this._timeout > 0) {
      // The timeout delay must be measured relative to the start of fetching
      // https://xhr.spec.whatwg.org/#the-timeout-attribute
      const delay = Math.max(0, this._timeout - (Date.now() - this._timeoutReference));
      this._timeoutTask = setTimeout(() => {
        if (this._sendFlag) {
          this.setRequestTimeout();
        }
        delete this._timeoutTask;
      }, delay);
    }
  }
}

// Global flag to enable the effects of the timeout attribute
MockXhr.timeoutEnabled = true;

/**
 * The client states
 * https://xhr.spec.whatwg.org/#states
 */
MockXhr.UNSENT = 0;
MockXhr.OPENED = 1;
MockXhr.HEADERS_RECEIVED = 2;
MockXhr.LOADING = 3;
MockXhr.DONE = 4;

/**
 * Mock server for responding to XMLHttpRequest mocks from the class MockXhr. Provides simple route
 * matching and request handlers to make test harness creation easier.
 */
class MockXhrServer {
  /**
   * Constructor
   *
   * @param {MockXhr} xhrMock XMLHttpRequest mock class
   * @param {?object} routes routes
   */
  constructor(xhrMock, routes = {}) {
    this.MockXhr = xhrMock;
    this._requests = [];
    this._routes = {};
    Object.keys(routes).forEach((method) => {
      const [matcher, handler] = routes[method];
      this.addHandler(method, matcher, handler);
    });
    xhrMock.onSend = (xhr) => { this._handleRequest(xhr); };

    // Setup a mock request factory for users
    this.xhrMock = xhrMock; // For backwards compatibility with < 4.1.0
    this.xhrFactory = () => new this.MockXhr();
  }

  /**
   * Install the server's XMLHttpRequest mock in the context. Revert with remove().
   *
   * @param {object?} context context object (e.g. global, window)
   * @returns {MockXhrServer} this
   */
  install(context = __webpack_require__.g) {
    this._savedXMLHttpRequest = context.XMLHttpRequest;
    this._savedContext = context;
    context.XMLHttpRequest = this.MockXhr;
    return this;
  }

  /**
   * Remove the server as the global XMLHttpRequest mock. Reverts the actions of install(global).
   */
  remove() {
    if (!this._savedContext) {
      throw new Error('remove() called without matching install(global).');
    }

    if (this._savedXMLHttpRequest !== undefined) {
      this._savedContext.XMLHttpRequest = this._savedXMLHttpRequest;
      delete this._savedXMLHttpRequest;
    } else {
      delete this._savedContext.XMLHttpRequest;
    }
    delete this._savedContext;
  }

  /**
   * Disable the effects of the timeout attribute on the XMLHttpRequest mock used by the server.
   */
  disableTimeout() {
    this.MockXhr.timeoutEnabled = false;
  }

  /**
   * Enable the effects of the timeout attribute on the XMLHttpRequest mock used by the server.
   */
  enableTimeout() {
    this.MockXhr.timeoutEnabled = true;
  }

  /**
   * Add a GET request handler.
   *
   * @param {string|RegExp|Function} matcher url matcher
   * @param {object|Function|object[]|Function[]} handler request handler
   * @returns {MockXhrServer} this
   */
  get(matcher, handler) {
    return this.addHandler('GET', matcher, handler);
  }

  /**
   * Add a POST request handler.
   *
   * @param {string|RegExp|Function} matcher url matcher
   * @param {object|Function|object[]|Function[]} handler request handler
   * @returns {MockXhrServer} this
   */
  post(matcher, handler) {
    return this.addHandler('POST', matcher, handler);
  }

  /**
   * Add a PUT request handler.
   *
   * @param {string|RegExp|Function} matcher url matcher
   * @param {object|Function|object[]|Function[]} handler request handler
   * @returns {MockXhrServer} this
   */
  put(matcher, handler) {
    return this.addHandler('PUT', matcher, handler);
  }

  /**
   * Add a DELETE request handler.
   *
   * @param {string|RegExp|Function} matcher url matcher
   * @param {object|Function|object[]|Function[]} handler request handler
   * @returns {MockXhrServer} this
   */
  delete(matcher, handler) {
    return this.addHandler('DELETE', matcher, handler);
  }

  /**
   * Add a request handler.
   *
   * @param {string} method HTTP method
   * @param {string|RegExp|Function} matcher url matcher
   * @param {object|Function|object[]|Function[]} handler request handler
   * @returns {MockXhrServer} this
   */
  addHandler(method, matcher, handler) {
    // Match the processing done in MockXHR for the method name
    method = normalizeHTTPMethodName(method);

    if (!this._routes[method]) {
      this._routes[method] = [];
    }
    this._routes[method].push({
      matcher,
      handler,
      count: 0,
    });
    return this;
  }

  /**
   * Set the default request handler for requests that don't match any route.
   *
   * @param {object|Function|object[]|Function[]} handler request handler
   * @returns {MockXhrServer} this
   */
  setDefaultHandler(handler) {
    this._defaultRoute = {
      handler,
      count: 0,
    };
    return this;
  }

  /**
   * Return 404 responses for requests that don't match any route.
   *
   * @returns {MockXhrServer} this
   */
  setDefault404() {
    return this.setDefaultHandler({ status: 404 });
  }

  /**
   * @returns {object[]} list of requests received by the server. Entries: { method, url }
   */
  getRequestLog() {
    return this._requests;
  }

  _handleRequest(xhr) {
    // Record the request for easier debugging
    this._requests.push({
      method: xhr.method,
      url: xhr.url,
      headers: xhr.requestHeaders.getHash(),
      body: xhr.body,
    });

    const route = this._findFirstMatchingRoute(xhr) || this._defaultRoute;
    if (route) {
      // Routes can have arrays of handlers. Each one is used once and the last one is used if out
      // of elements.
      let { handler } = route;
      if (Array.isArray(handler)) {
        handler = handler[Math.min(handler.length - 1, route.count)];
      }
      route.count += 1;

      if (typeof handler === 'function') {
        handler(xhr);
      } else {
        xhr.respond(handler.status, handler.headers, handler.body, handler.statusText);
      }
    }
  }

  _findFirstMatchingRoute(xhr) {
    const method = normalizeHTTPMethodName(xhr.method);
    if (!this._routes[method]) {
      return undefined;
    }

    const { url } = xhr;
    return this._routes[method].find((route) => {
      const { matcher } = route;
      if (typeof matcher === 'function') {
        return matcher(url);
      } else if (matcher instanceof RegExp) {
        return matcher.test(url);
      }
      return matcher === url;
    });
  }
}

/**
 * Create a new "local" MockXhr subclass. This makes it easier to have self-contained unit tests
 * since "global" hooks can be registered directly on the subclass. These hooks don't need to then
 * be removed after tests because they are local to the new subclass.
 *
 * @returns {MockXhr} new MockXhr subclass
 */
function newMockXhr() {
  class LocalMockXhr extends MockXhr {
    constructor() {
      super();

      // Call the local onCreate hook on the new mock instance
      if (typeof LocalMockXhr.onCreate === 'function') {
        LocalMockXhr.onCreate(this);
      }
    }

    // Override the parent method to enable the local MockXhr instance's
    // onSend() hook
    send(...args) {
      super.send(...args);

      // Execute in an empty callstack
      if (typeof LocalMockXhr.onSend === 'function') {
        // Save the callback in case it changes before it has a chance to run
        const { onSend } = LocalMockXhr;
        setTimeout(() => onSend.call(this, this), 0);
      }
    }
  }

  // Override the parent class' flag to enable the effects of the timeout attribute
  LocalMockXhr.timeoutEnabled = true;
  return LocalMockXhr;
}

/**
 * Create a new mock server using MockXhr.
 *
 * @returns {MockXhrServer} new mock server
 */
function newServer(routes) {
  return new MockXhrServer(newMockXhr(), routes);
}




/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!************************!*\
  !*** ./src/kscript.js ***!
  \************************/
/* eslint-disable no-global-assign */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-unused-vars */
window.foo = "barrr"

console.log("kscript.js injected")

const flatten = __webpack_require__(/*! flat */ "./node_modules/flat/index.js");
const Hashes = __webpack_require__(/*! jshashes */ "./node_modules/jshashes/hashes.js");
var SHA256 =  new Hashes.SHA256

const MockXMLHttpRequest = __webpack_require__(/*! mock-xmlhttprequest */ "./node_modules/mock-xmlhttprequest/dist/mock-xmlhttprequest.esm.js");
const MockXhr = MockXMLHttpRequest.newMockXhr();

function isValidJSONString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const origXMLHttpRequestSend = XMLHttpRequest.prototype.send;
const origXMLHttpRequestOpen = XMLHttpRequest.prototype.open;
const wrappedSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

// XMLHttpRequest.prototype.send = function(...args) {
//     setTimeout(function() {
//         return origXMLHttpRequestSend.apply(this, args)
//     }, 3000)
// }

function ResetXMLHttpRequest() {
    XMLHttpRequest.prototype.send = origXMLHttpRequestSend
    XMLHttpRequest.prototype.open = origXMLHttpRequestOpen
    XMLHttpRequest.prototype.setRequestHeader = wrappedSetRequestHeader
}

function RecordXMLRequests() {
    const origFetch = window.fetch;
    window.fetch = (...args) => {
        console.log("in fetch", args);
        return origFetch.apply(window, args);
    };
    // const origXMLHttpRequestSend = XMLHttpRequest.prototype.send;
    // const origXMLHttpRequestOpen = XMLHttpRequest.prototype.open;
    // const wrappedSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    // let depArr: any[] = [];
    // @ts-ignore
    XMLHttpRequest.prototype.open = function (...args) {
        console.log(args);
        // @ts-ignore
        this.requestArr = args;
        // @ts-ignore
        return origXMLHttpRequestOpen.apply(this, args);
    };
    // @ts-ignore
    XMLHttpRequest.prototype.wrappedSetRequestHeader =
        XMLHttpRequest.prototype.setRequestHeader;
    // Override the existing setRequestHeader function so that it stores the headers
    XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        // Call the wrappedSetRequestHeader function first
        // so we get exceptions if we are in an erronous state etc.
        // @ts-ignore
        wrappedSetRequestHeader.apply(this, [header, value]);
        // Create a headers map if it does not exist
        // @ts-ignore
        if (!this.headers) {
            // @ts-ignore
            this.headers = {};
            // @ts-ignore
            this.headerKeys = "";
        }
        // Create a list for the header that if it does not exist
        // @ts-ignore
        if (!this.headers[header]) {
            // @ts-ignore
            this.headers[header] = [];
        }
        // Add the value to the header
        // @ts-ignore
        this.headers[header].push(value);
        console.log(`
        
            setRequestHeader: `, header, `
            
            `)
        // @ts-ignore
        this.headerKeys += header.toLowerCase() + ',';
    };
    XMLHttpRequest.prototype.send = function (...args) {
        console.log("before xmlHttpRequest send: ", this);
        this.addEventListener("readystatechange", function (e) {
            console.log(" *** ", this.status, " ", this.response, " ", this.readyState)
            let isPushed = false
            // @ts-ignore
            if ((this.readyState == this.DONE || (this.requestArr[0] === "POST" && this.readyState === 3) || (this.readyState === 3 && this.status != 0 && this.response!=undefined )) && !isPushed ) {
                // @ts-ignore
                console.log("---", this.method, ", ", this.requestArr[0], ", ", isValidJSONString(args[0]) ? "" : args[0]);
                // @ts-ignore
                const urlArr = this.requestArr[1].split("?");
                var paramKeys = "";
                const url = urlArr[0];
                if (urlArr.length > 1) {
                    var params = urlArr[1].split("&");
                    params.forEach(function (el) {
                        paramKeys += el.split("=")[0];
                    });
                }
                let flattenJSON = (args[0] !== null && args[0] !== undefined) ? JSON.stringify(Object.keys(flatten(isValidJSONString(args[0]) ? JSON.parse(args[0]) : args[0])) ) : "";
                if(this.headerKeys ==undefined){
                    this.headerKeys = ""
                }
                if(this.headers != undefined && this.headers != null) {
                    this.headerKeys = ""
                    let headers = Object.keys(this.headers)
                    headers.forEach((headerKey) => this.headerKeys += headerKey.toLowerCase()+",")
                    if(this.headerKeys == "[]"){
                        this.headerKeys = ""
                    }
                }
                if(flattenJSON=="[]"){
                    flattenJSON = ""
                }
                // @ts-ignore
                let hashPwd = SHA256.hex(String(this.requestArr[0]).toUpperCase() + url + paramKeys + this.headerKeys + flattenJSON)
                    // .digest("hex");
                // @ts-ignore
                console.log(hashPwd, " hash of request: ", String(this.requestArr[0]).toUpperCase() + url + paramKeys + this.headerKeys + flattenJSON);
                // if( !depArr.has(hashPwd) ) {
                let storedDepArrString = sessionStorage.getItem("depArr");
                let resp
                if(this.responseType === "" || this.responseType === "text"){
                    resp = this.responseText
                } 
                else if (this.responseType === "json"){
                    resp = JSON.stringify(this.response)
                }
                else{
                    resp = this.response
                }
                isPushed = true
                if (storedDepArrString != null) {
                    let arr = JSON.parse(storedDepArrString);
                    arr.push({ [hashPwd]: {
                            status: this.status,
                            headers: getHeaders(this.getAllResponseHeaders()),
                            body: resp,
                            response_type: this.responseType
                        }
                    });
                    sessionStorage.setItem("depArr", JSON.stringify(arr));
                }
                else {
                    sessionStorage.setItem("depArr", JSON.stringify([{ [hashPwd]: {
                            status: this.status,
                            headers: getHeaders(this.getAllResponseHeaders()),
                            body: resp,
                            response_type: this.responseType
                        }
                    }]));
                }
                // }
            }
        });
        const x = origXMLHttpRequestSend.apply(this, args);
        if(this.status == 200){
            console("###")
        }
        return x;
    };
}
function getHeaders(headers) {
    // Convert the header string into an array
    // of individual headers
    const arr = headers.trim().split(/[\r\n]+/);
    // Create a map of header names to values
    const headerMap = {};
    arr.forEach(function (line) {
        const parts = line.split(": ");
        const header = parts.shift();
        const value = parts.join(": ");
        if (typeof header === typeof "string" && header !== undefined) {
            // @ts-ignore
            headerMap[header] = value;
        }
    });
    return headerMap;
}
function onRecordStop(test_name, appid) {
    if (test_name != undefined && appid != undefined && test_name != "" && appid != "") {
        fetch("http://localhost:8081/api/regression/selenium/insert", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                app_id: appid,
                test_name: test_name,
                // deps: mapToObj(depArr),
                deps: JSON.parse(sessionStorage.getItem("depArr") || "")
            }),
        }).then(res => console.log(res));
    }
}
function fetchDeps(testName, appid) {
    if (testName != undefined && appid != undefined && testName != "" && appid != "") {
        const requestDeps = new originalXMLHttpRequest()
        requestDeps.open('GET', `http://localhost:8081/api/regression/selenium/get?appid=` + appid + `&testName=` + testName, false)
        requestDeps.send(null)
        if(requestDeps.status == 200){
            const docs = JSON.parse( requestDeps.responseText )
            console.log("** ** ",requestDeps.responseText)
            sessionStorage.setItem("depArr", JSON.stringify(docs[0].deps))
        }
        // fetch(`http://localhost:8081/api/regression/selenium/get?appid=` + appid + `&testName=` + testName)
        //     .then((response) => response.json())
        //     .then((data) => {
        //     console.log(data);
        //     if (data.length == 1) {
        //         sessionStorage.setItem("depArr", JSON.stringify(data[0].deps));
        //     }
        // });
    }
}
var originalXMLHttpRequest = XMLHttpRequest;
function registerXML() {
    
    const unloadCallbackTab = new Map();
    // an object used to store things passed in from the API
    const internalStorage = {};
    const mode = sessionStorage.getItem("mode");
    if (mode != null && mode == "record") {
        RecordXMLRequests();
    }
    else if (mode != null && mode == "test") {
        // Mock JSON response
        MockXhr.onSend = (xhr) => {
            const urlArr = xhr.url.split("?");
            const url = urlArr[0];
            var paramKeys = "";
            if (urlArr.length > 1) {
                var params = urlArr[1].split("&");
                params.forEach(function (el) {
                    paramKeys += el.split("=")[0];
                });
            }
            let flattenJSON = (xhr.body !== null && xhr.body !== undefined) ? JSON.stringify( Object.keys(flatten(isValidJSONString(xhr.body) ? JSON.parse(xhr.body) : xhr.body)) ) : "";
            let headersArr = Object.keys(xhr.requestHeaders.getHash()), headerKeys = "";
            headersArr.forEach(el => headerKeys += el + ",");
            if(headerKeys == "[]"){
                headerKeys = ""
            }
            if(flattenJSON == "[]"){
                flattenJSON = []
            }
            // @ts-ignore
            let hashPwd = SHA256.hex(String(xhr.method).toUpperCase() + url + paramKeys + headerKeys + flattenJSON)

            // let hashPwd = crypto.createHash("sha256").update(xhr.method + url + paramKeys + headerKeys + flattenJSON)
            //     .digest("hex");
            console.log(hashPwd, " hash of request: ", String(xhr.method).toUpperCase() + url + paramKeys + headerKeys + flattenJSON);
            let depArr = JSON.parse(sessionStorage.getItem("depArr") || "[]");
            let responseHeaders = { 'Content-Type': 'application/json' };
            let response = '{ "message": "Success!" }';
            let status = 200, matchedDepp = false
            console.log("before depArr: ", depArr)
            depArr = depArr.filter((el) => {
                if (!el.hasOwnProperty(hashPwd) || matchedDepp) {
                    return true;
                }
                status = el[hashPwd].status
                responseHeaders = el[hashPwd].headers
                // if (el[hashPwd].response_type === "json") {
                //     el[hashPwd].body = JSON.parse(el[hashPwd].body)
                // }
                response = el[hashPwd].body
                matchedDepp = true
                return false
                // xhr.respond(el[hashPwd].status, el[hashPwd].headers, el[hashPwd].body);
            });
            // if(response == "")
            console.log("after depArr: ", depArr)
            sessionStorage.setItem("depArr", JSON.stringify(depArr));
            console.log("xhr: ", xhr);
            xhr.respond(status, responseHeaders, response);
        };
        XMLHttpRequest = MockXhr;
        // @ts-ignore
        // XMLHttpRequest = undefined;
    }
    document.addEventListener("eventMode", function (event) {
        // @ts-ignore
        const dataFromPage = event.detail;
        console.log("into webpage: ", dataFromPage, internalStorage);
        if (dataFromPage.event === "recordingStarted") {
            console.log(`
            
            recordingStarted: `, event, `
            
            `);
            RecordXMLRequests();
            sessionStorage.setItem("testName", dataFromPage.testName);
            sessionStorage.setItem("appid", dataFromPage.appid);
            sessionStorage.setItem("mode", "record");
            // unloadCallbackTab.set(dataFromPage.tabId, true)
            // window.addEventListener("beforeunload", function (e) {
            //     //     this.alert(depArr)
            //     window.addEventListener("load", function(e){
            //         console.log(" **** Redirect **** ")
            //     })
            //     onRecordStop(dataFromPage.testName, dataFromPage.appid, dataFromPage.tabId);
            //     // e.preventDefault();
            // });
            // window.onbeforeunload = function() {
            //     onRecordStop(dataFromPage.value)
            // }
        }
        else if (dataFromPage.event === "recordingStopped") {
            //     onRecordStop(dataFromPage.value)
            //     XMLHttpRequest.prototype.send = origXMLHttpRequestSend;
            //     XMLHttpRequest.prototype.open = origXMLHttpRequestOpen;
            //     XMLHttpRequest.prototype.setRequestHeader = wrappedSetRequestHeader;
        }
        else if (dataFromPage.event === "projectLoaded") {
            sessionStorage.setItem("appid", dataFromPage.appid);
        }
        else if (dataFromPage.event === "infraRecordingClose") {
            let testName = sessionStorage.getItem("testName");
            let appid = sessionStorage.getItem("appid");
            if (testName != null && appid != null) {
                onRecordStop(testName, appid);
            }
            ResetXMLHttpRequest()
            sessionStorage.clear();
        }
        else if (sessionStorage.getItem("mode") == null && dataFromPage.event === "playbackStarted") {
            console.log("playback event called in webapp: ", dataFromPage);
            sessionStorage.setItem("testName", dataFromPage.testName);
            sessionStorage.setItem("appid", dataFromPage.appid);
            sessionStorage.setItem("mode", "test");
            // fetchDeps(dataFromPage.testName, dataFromPage.appid);
            // XMLHttpRequest.addEventListener("readystatechange")
            originalXMLHttpRequest = XMLHttpRequest;
            // Mock JSON response
            MockXhr.onSend = (xhr) => {
                const urlArr = xhr.url.split("?");
                const url = urlArr[0];
                var paramKeys = "";
                if (urlArr.length > 1) {
                    var params = urlArr[1].split("&");
                    params.forEach(function (el) {
                        paramKeys += el.split("=")[0];
                    });
                }
                let flattenJSON = (xhr.body !== null && xhr.body !== undefined) ? JSON.stringify( Object.keys(flatten( isValidJSONString(xhr.body) ? JSON.parse(xhr.body) : xhr.body ))) : "";
                let headersArr = Object.keys(xhr.requestHeaders.getHash()), headerKeys = "";
                headersArr.forEach(el => headerKeys += el + ",");
                if(headerKeys == "[]"){
                    headerKeys = ""
                }
                if(flattenJSON == "[]"){
                    flattenJSON = ""
                }
                // @ts-ignore
                let hashPwd = SHA256.hex(String(xhr.method).toUpperCase() + url + paramKeys + headerKeys + flattenJSON)

                // let hashPwd = crypto.createHash("sha256").update(xhr.method + url + paramKeys + headerKeys + flattenJSON)
                //     .digest("hex");
                console.log(hashPwd, " hash of request: ", String(xhr.method).toUpperCase() + url + paramKeys + headerKeys + flattenJSON);
                let depArr = JSON.parse(sessionStorage.getItem("depArr") || "[]");
                let responseHeaders = { 'Content-Type': 'application/json' };
                let response = '{ "message": "Success!" }';
                let status = 200, matchedDepp = false
                console.log("before depArr: ", depArr)
                depArr = depArr.filter((el) => {
                    if (!el.hasOwnProperty(hashPwd) || matchedDepp) {
                        return true;
                    }
                    status = el[hashPwd].status
                    responseHeaders = el[hashPwd].headers
                    // if (el[hashPwd].response_type === "json") {
                    //     el[hashPwd].body = JSON.parse(el[hashPwd].body)
                    // }
                    response = el[hashPwd].body
                    matchedDepp = true
                    return false
                    // xhr.respond(el[hashPwd].status, el[hashPwd].headers, el[hashPwd].body);
                });
                console.log("after depArr: ", depArr)
                sessionStorage.setItem("depArr", JSON.stringify(depArr));
                console.log("xhr: ", xhr);
                xhr.respond(status, responseHeaders, response);
            };
            XMLHttpRequest = MockXhr;
            // @ts-ignore
            // XMLHttpRequest = undefined;
        }
        else if (dataFromPage.event === "playbackStopped") {
            sessionStorage.clear();
            XMLHttpRequest = originalXMLHttpRequest;
        }
        // @ts-ignore
        internalStorage[dataFromPage.testName] = [dataFromPage.event, dataFromPage.appid];
    });
}

registerXML()

exports["default"] = registerXML;

})();

/******/ })()
;
//# sourceMappingURL=kscript.js.map