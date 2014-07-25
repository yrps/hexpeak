var playing;
var numberTFs = [["#decfield", 10], ["#binfield", 2], ["#octfield", 8], ["#hexfield", 0x10]];
var countSet = ":radio[name=counting]";

var dict = {
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
    max: Math.pow(2, 4 * 0x14) // using Math.pow because << maxes out at 32-bit
};

var zero = {card: "zero", ord: "zeroth"};

/** initialize the fields to a random value */
function initFields(min, max) {
    min = min || 0x10;
    max = max || 0xFFF;
    var randVal = Math.floor(Math.random() * (max-min) + min);
    updateTFs(randVal);
}

/** synchronize all fields according to their respective bases */
function updateTFs(num) {
    $(numberTFs).each(function(k, v){
        if (num >= dict.max) {
            console.warn("overflow: 0x%s >= 0x%s",
                num.toString(0x10).toUpperCase(), (dict.max).toString(0x10).toUpperCase());
            num = num & dict.max;
        }
        v.text(num.toString(v.radix).toUpperCase());
    });
    updateText()
}

/** translate the number and update the text-out element */
function updateText() {
    var num = numberTFs[numberTFs.length-1].text();
    var countMode = countSet.filter(":checked").get(0).id; // cardinal or ordinal
    var pronounce = "";
    if ( parseInt(num, 0x10) === 0 ) {
        pronounce = zero[countMode]; // zero is a special case
    } else {
        var isTeek = parseInt(num.slice(-2), 0x10) % 0xFF; // the teeks are 0x11 < num < 0xFF
        if (!(isTeek > 0x10 && isTeek < 0x20)) isTeek = false;
        for (var nDigit = num.length; nDigit > 0; nDigit--) {
            var digit = parseInt(num.charAt(nDigit - 1), 0x10);
            var newWord;

            if ( digit === 0 || (isTeek && nDigit === num.length) )
                continue; // zeroes do not contribute to the pronunciation
            switch (nDigit) {
                case ( num.length ): // ones digit
                    newWord = dict[countMode];
                    newWord = newWord[digit-1];
                    break;
                case ( num.length - 1 ): // texes digit
                    newWord = isTeek ? dict.teeks : dict.texes;
                    if (isTeek) digit = isTeek % 0x10;
                    newWord = newWord[digit-1];
                    break;
                case ( num.length - 2 ): // hundreks digit
                case ( num.length - 3 ): // thouseks digit
                case ( num.length - 4 ): // milleks digit
                    newWord = dict["card"][digit-1] + " " + dict[num.length - nDigit];
                    if (parseInt(num.slice(-num.length + nDigit), 0x10) > 0xFF) newWord += ", ";
                    break;
                default:
                    newWord = "undefined"
            }

            if (countMode === "ord" && nDigit < num.length) {
                newWord += "th"; // suffix is always the same for non-ones digit
            }
            countMode = undefined; // ordination suffix can be used no more than once
            //console.log(nDigit, digit);
            pronounce = newWord + " " + pronounce;
        }
    }
    $( "#translation" ).text(pronounce);
}

/** respond to changing counting type */
function registerChangeCount() {
    countSet.change(function() {
        updateText();
    })
}

/** onload function */
$(document).ready(function() {
    playing = false;

    /* destructively iterate over the array of selectors & radices,
    replacing with jQuery objects corresponding to DOM elements*/
    $(numberTFs).each(function(k, v){
        var radix = v[1];
        numberTFs[k] = $(v[0]); // change from simple array to jQuery object
        numberTFs[k].radix = radix;
        numberTFs[k].blur(function() {
            var num = parseInt(numberTFs[k].text(), radix);
            num = isNaN(num) ? 0 : num;
            updateTFs(num)
        });
    });

    countSet = $( countSet );

    initFields();
    registerChangeCount();
    console.log("Maximum parseable is 0x%s - 1", dict.max.toString(0x10));
});
