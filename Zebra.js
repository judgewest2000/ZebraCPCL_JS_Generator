; (function () {
    if (!window.zebra) {
        window.zebra = function () {
            var header = '! 0 200 200 %length% 1\n';

            var currentPosition = 25;

            var currentDocument = '';

            this.getDocument = function () {
                var toReturn = replaceAll('%length%', (currentPosition + 50).toString(), header);
                toReturn += currentDocument + "PRINT\n";
                return toReturn
                //return currentDocument.replace('%length%', (currentPosition + 50).toString()) + '\r\n\r\nPRINT';
            }

            this.getDocumentBase64Encoded = function () {
                var toReturn = replaceAll('%length%', (currentPosition + 50).toString(), header);
                toReturn += currentDocument + "PRINT\n";
                return Base64.encode(toReturn);
                //return currentDocument.replace('%length%', (currentPosition + 50).toString()) + '\r\n\r\nPRINT';
            }

            this.addContent = function (val) {
                var paragraph = val.split('\n');
                var newparagraph = [];
                for (var i = 0; i < paragraph.length; i++) {
                    var line = paragraph[i].split(' ');
                    var currentline = '';
                    for (var ii = 0; ii < line.length; ii++) {
                        var current = line[ii];
                        if (currentline.length + 1 + current.length > 47) {
                            newparagraph.push(currentline);
                            currentline = '';
                        }
                        if (currentline == '') {
                            currentline += current;
                        } else {
                            currentline += ' ' + current;
                        }
                    }
                    if (currentline != '') {
                        newparagraph.push(currentline)
                    }
                }
                affix(newparagraph, 22, 7, 0);
            }

            this.addWhiteSpace = function () {
                currentPosition = currentPosition + 25;
            }

            this.addBigHeading = function (val) {
                var a = [];
                a.push(val);
                affix(a, 45, 4, 0);
            }

            this.addBigHeadingTall = function (val) {
                var a = [];
                a.push(val);
                affix(a, 85, 4, 1);
            }

            this.addSmallHeading = function (val) {
                var paragraph = val.split('\n');
                var newparagraph = [];
                for (var i = 0; i < paragraph.length; i++) {
                    var line = paragraph[i].split(' ');
                    var currentline = '';
                    for (var ii = 0; ii < line.length; ii++) {
                        var current = line[ii];
                        if (currentline.length + 1 + current.length > 47) {
                            newparagraph.push(currentline);
                            currentline = '';
                        }
                        if (currentline == '') {
                            currentline += current;
                        } else {
                            currentline += ' ' + current;
                        }
                    }
                    if (currentline != '') {
                        newparagraph.push(currentline)
                    }
                }
                affix(newparagraph, 45, 7, 1);
            }

            this.clearDecks = function () {
                currentDocument = '';
                currentPosition = 25;
            }

            this.addImage = function (val) {

                imageOrCanvas = val;

                var hexLookup = {
                    '0000': '0', '0001': '1', '0010': '2', '0011': '3', '0100': '4',
                    '0101': '5', '0110': '6', '0111': '7', '1000': '8', '1001': '9',
                    '1010': 'A', '1011': 'B', '1100': 'C', '1101': 'D', '1110': 'E', '1111': 'F'
                };

                var c;
                

                if (imageOrCanvas.nodeName == undefined) {
                    return false;
                }
                else if (imageOrCanvas.nodeName != 'IMG' && imageOrCanvas.nodeName != 'CANVAS') {
                    return false;
                } else if (imageOrCanvas.nodeName == "IMG") {
                    c = document.createElement('canvas');
                    var img = imageOrCanvas;
                    c.width = img.width;
                    c.height = img.height;
                    ctx = c.getContext('2d');
                    ctx.drawImage(img, 0, 0, c.width, c.height);
                } else if (imageOrCanvas.nodeName == "CANVAS") {
                    c = imageOrCanvas;
                    ctx = c.getContext('2d');
                }


                if (c.width % 8 != 0) {
                    var c2 = document.createElement('canvas');
                    var ctx2 = c2.getContext('2d');
                    c2.height = c.height;
                    c2.width = c.width + (8 - (c.width % 8));
                    ctx2.drawImage(c, 0, 0, c.width, c.height);
                    //c.width = c.width + (8 - (c.width % 8));
                    c = c2;
                }


                //var maxWidth = 800;
                //var curWidth = c.width;
                //var divideMargin = maxWidth / curWidth;

                //var c2 = document.createElement('canvas');
                //var ctx2 = c2.getContext('2d');
                //c2.width = maxWidth;
                //c2.height = c.height * divideMargin;
                //ctx2.drawImage(c, 0, 0, c2.width, c2.height);

                //c = c2;


                var toReturn = "EG " + (c.width / 8).toFixed(0) + ' ' + c.height + ' 0 ' + currentPosition + ' ';
                var binary = '';
                var imageInfo = ctx.getImageData(0, 0, c.width, c.height);

                for (var i = 0; i < imageInfo.data.length; i += 4) {
                    var colour = { red: imageInfo.data[i], green: imageInfo.data[i + 1], blue: imageInfo.data[i + 2], alpha: imageInfo[i + 3] };
                    var intensity = (colour.red + colour.green + colour.blue);

                    if (intensity >= 90)
                        binary = binary + '1';
                    else
                        binary = binary + '0';
                }

                var hex = '';

                for (var i = 0; i < binary.length; i += 4) {
                    var current = binary[i] + binary[i + 1] + binary[i + 2] + binary[i + 3];
                    hex = hex + hexLookup[current];
                }

                currentDocument += toReturn + hex + '\n';

                currentPosition = currentPosition + c.height + 5;

            }

            var affix = function (val, nextLineDistance, font, size) {
                for (var i = 0; i < val.length; i++) {
                    var cur = val[i];
                    currentDocument += 'T ' + font + ' ' + size + ' 1 ' + currentPosition.toString() + ' ' + cur + '\n';
                    currentPosition = currentPosition + nextLineDistance;
                }
            }

            var Base64 = {

                // private property
                _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

                // public method for encoding
                encode: function (input) {
                    var output = "";
                    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                    var i = 0;

                    input = Base64._utf8_encode(input);

                    while (i < input.length) {

                        chr1 = input.charCodeAt(i++);
                        chr2 = input.charCodeAt(i++);
                        chr3 = input.charCodeAt(i++);

                        enc1 = chr1 >> 2;
                        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                        enc4 = chr3 & 63;

                        if (isNaN(chr2)) {
                            enc3 = enc4 = 64;
                        } else if (isNaN(chr3)) {
                            enc4 = 64;
                        }

                        output = output +
                        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

                    }

                    return output;
                },

                // public method for decoding
                decode: function (input) {
                    var output = "";
                    var chr1, chr2, chr3;
                    var enc1, enc2, enc3, enc4;
                    var i = 0;

                    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                    while (i < input.length) {

                        enc1 = this._keyStr.indexOf(input.charAt(i++));
                        enc2 = this._keyStr.indexOf(input.charAt(i++));
                        enc3 = this._keyStr.indexOf(input.charAt(i++));
                        enc4 = this._keyStr.indexOf(input.charAt(i++));

                        chr1 = (enc1 << 2) | (enc2 >> 4);
                        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                        chr3 = ((enc3 & 3) << 6) | enc4;

                        output = output + String.fromCharCode(chr1);

                        if (enc3 != 64) {
                            output = output + String.fromCharCode(chr2);
                        }
                        if (enc4 != 64) {
                            output = output + String.fromCharCode(chr3);
                        }

                    }

                    output = Base64._utf8_decode(output);

                    return output;

                },

                // private method for UTF-8 encoding
                _utf8_encode: function (string) {
                    string = string.replace(/\r\n/g, "\n");
                    var utftext = "";

                    for (var n = 0; n < string.length; n++) {

                        var c = string.charCodeAt(n);

                        if (c < 128) {
                            utftext += String.fromCharCode(c);
                        }
                        else if ((c > 127) && (c < 2048)) {
                            utftext += String.fromCharCode((c >> 6) | 192);
                            utftext += String.fromCharCode((c & 63) | 128);
                        }
                        else {
                            utftext += String.fromCharCode((c >> 12) | 224);
                            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                            utftext += String.fromCharCode((c & 63) | 128);
                        }

                    }

                    return utftext;
                },

                // private method for UTF-8 decoding
                _utf8_decode: function (utftext) {
                    var string = "";
                    var i = 0;
                    var c = c1 = c2 = 0;

                    while (i < utftext.length) {

                        c = utftext.charCodeAt(i);

                        if (c < 128) {
                            string += String.fromCharCode(c);
                            i++;
                        }
                        else if ((c > 191) && (c < 224)) {
                            c2 = utftext.charCodeAt(i + 1);
                            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                            i += 2;
                        }
                        else {
                            c2 = utftext.charCodeAt(i + 1);
                            c3 = utftext.charCodeAt(i + 2);
                            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                            i += 3;
                        }

                    }

                    return string;
                }

            }

            var replaceAll = function (find, replace, str) {
                return str.replace(new RegExp(find, 'g'), replace);
            }

            
        }
    }
})();
