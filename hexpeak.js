/* DOM element selectors */
var elem = {
    countSet: ":radio[name=counting]",
    numField: "[data-radix]",
    hexField: "[data-radix='16']:first",
    trans: "#translation"
};

/* numbers are mapped to these words */
var dict = {
    zero: {card: "zero", ord: "zeroth"}
    ,
    card: ["one", "two", "three", "four", "five", "six", "seven",
        "eight", "nine", "ten", "eleven", "twelve", "draze", "eptwin", "fim"]
    ,
    ord: ["first", "second", "third", "fourth", "fifth", "sixth", "seventh",
        "eighth", "ninth", "tenth", "leventh", "twelfth", "drazeth", "eptwinth", "fimth"]
    ,
    teeks: ["oneteek", "twenteek", "thirteek", "fourteek", "fifteek", "sixteek", "sevteek",
        "eighteek", "nineteek", "tenteek", "levteek", "twelfteek", "drazeteek", "epteek", "fimteek", "umpteek"]
    ,
    texes: ["tex", "twentek", "thirtek", "fourtek", "fiftek", "sixtek", "sevtek",
        "eightek", "ninetek", "tentek", "levtek", "twelftek", "drazetek", "eptek", "fimtek"]
    ,
    0x2: "hundrek"
    ,
    0x3: "thousek"
    ,
    0x4: "millek"
    ,
    0x8: "billek"
    ,
    0xC: "trillek"
    ,
    0x10: "quadrillek"
    ,
    maxHexDigits: 13 // limitation of parseInt?
};

/* range of random numbers */
var rand = { min: 0x10, max: 0xFFFF };

/*
var colors = {
    0x0: "Black",
    0x4: "DarkRed",
    0x8: "DarkGreen",
    0xC: "DarkBlue",
    0x10: "DarkGoldenRod"
};
*/

/** initialize the fields to a zero */
function zeroFields() {
    updateTFs(0);
}

/** initialize the fields to a random value */
function randFields(min, max) {
    min = min || rand.min;
    max = max || rand.max;
    var randVal = Math.floor(Math.random() * (max-min) + min);
    updateTFs(randVal);
}

/** parse the given textfield object by its own radix and then update TFs */
function parseTF( TFobj ) {
    var num = parseInt(TFobj.text(), TFobj.attr( "data-radix" ));
    num = isNaN(num) ? 0 : num;
    updateTFs(num, TFobj );
}

/** synchronize all fields according to their respective bases */
function updateTFs( num/*, TFobj*/ ) {
    var hexString = num.toString(0x10);
    var numHexDigits = hexString.length;
    if ( numHexDigits > dict.maxHexDigits ) {
        console.warn("digits in 0x%s exceeds maximum (%d > %d)",
            hexString.toUpperCase(), numHexDigits, dict.maxHexDigits);
        num = parseInt(hexString.substr(-dict.maxHexDigits), 0x10);
    }
    elem.numField.each(function() {
//        if ($(this).get(0)==(TFobj && TFobj.get(0)) )
//            return; // no need to update self
        var text = num.toString($(this).attr( "data-radix" )).toUpperCase();
        if ( $(this).get(0).id == "hex" ) {
            location.hash = text;
        }
        $(this).html(text);
    });
    updateText();
}

/** respond to changing counting type */
function registerChangeCount() {
    elem.countSet.change(function() {
        updateText($(this));
    })
}
/** translate the number and update the text-out element */
function updateText() {
    var numText = elem.hexField.text();
    var countMode = elem.countSet.filter( ":checked" ).get(0).id; // cardinal or ordinal
    var pronounce = "";
    if ( parseInt( numText, 0x10) === 0 ) {
        pronounce = dict.zero[countMode]; // zero is a special case
    } else {
        var numLen = numText.length;
        for (var place = 0; place < numLen; place++) {
            var digit, hasTeek, newWord;
            /* predetermine the digits for every block of 4, and whether there's a teek */
            if ( place%4 === 0 ) {
                digit = [];
                for (var i = 0; i < 4; i++) {
                    digit[i] = parseInt( numText.charAt(numLen-(place+i+1)), 0x10 ) || 0;
                }
                // the teeks are 0x11 < num < 0xFF
                hasTeek = (digit[1] === 1 && digit[2] > 1);
            }

            if ( digit[place%4] === 0 && (place === 0 || place%4 != 0) )
                continue; // zeroes do not contribute to the pronunciation
            switch ( place%4 ) {
                case ( 0 ): // ones digit within block of 4
                    newWord = hasTeek ? dict.teeks : dict[countMode];
                    newWord = newWord[digit[0]-1] || "";
                    if (dict[place]) { // add space and block word, for blocks >= milleks
                        newWord += " " + dict[place];
                        if (parseInt(numText.substr(-place), 0x10) > 0xFF) { // add comma if more words >= 0x100
                            newWord += ",";
                        }
                    }
                    break;
                case ( 1 ): // texes digit within block of 4
                    if ( hasTeek ) // teeks are processed as the ones digit
                        continue;
                    newWord = dict["texes"][digit[1]-1];
                    break;
                case ( 2 ): // hundreks digit within block of 4
                    newWord = dict["card"][digit[2]-1] + " " + dict[place%4];
                    break;
                case ( 3 ): // thouseks digit within block of 4
                    newWord = dict["card"][digit[3]-1] + " " + dict[place%4];
                    if ( digit[2] > 0 ) // add comma if hundreks > 0
                        newWord += ",";
                    break;
                default:
                    newWord = "undefined"
            }

            if ( countMode === "ord" ) {
                if ( place > 0 ) {
                    newWord += "th"; // ordination suffix is unique only for ones digit, "-th" otherwise
                }
                countMode = "card"; // ordination suffix can be used no more than once
            }
            pronounce = newWord + " " + pronounce;
        }
    }
    elem.trans.text( pronounce.trim() );
}

/** initialize and return the speech object */
function initSpeech() {
    var speech = new SpeechSynthesisUtterance();
    speech.onstart = function() {
        console.log("started speaking:\n", speech.text)
    };
    speech.onend = function() {
        console.log("done speaking.")
    };
    return speech;
}

/** onload function */
$(document).ready(function() {
    $( "[contenteditable]" ).keypress(function(event) {
        var char = event.which;
        if (char == 13) { // manual update on enter key
            parseTF($(this));
            event.preventDefault();
            return;
        }
        char = String.fromCharCode(char);
        char = parseInt( char, $(this).attr( "data-radix" ));
        if (isNaN(char)) { // invalid numeral for this radix
            event.preventDefault();
        }
    }).blur(function() {
        parseTF($(this));
    });

    /* make jQuery objects out of the selectors given */
    $.each(elem, function( key, selector ) {
        elem[key] = $( selector );
    });

    //console.log("hash: %s", location.hash);
    if (!location.hash)
        randFields();
    else
        updateTFs(parseInt(location.hash.substr(1), 0x10));
    registerChangeCount();
});
