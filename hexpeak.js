var playing;
var numberTFs = [["#decfield", 10], ["#binfield", 2], ["#octfield", 8], ["#hexfield", 0x10]];
var countSet = ":radio[name=counting]";

var dict = {
    card: ["zero", "one", "two", "three", "four", "five", "six", "seven",
        "eight", "nine", "ten", "eleven", "twelve", "draze", "eptwin", "fim"]
    ,
    ord: ["zeroth", "first", "second", "third", "fourth", "fifth", "sixth", "seventh",
        "eighth", "ninth", "tenth", "eleventh", "twelfth", "drazeth", "eptwinth", "fimth"]
    ,
    teeks: ["tex", "oneteek", "twenteek", "thirteek", "fourteek", "fifteek", "sixteek", "sevteek",
        "eighteek", "nineteek", "tenteek", "levteek", "twelfteek", "drazeteek", "epteek", "fimteek", "umpteek"]
    ,
    texes: ["?", "?", "twentek", "thirtek", "fourtek", "fiftek", "sixtek", "sevtek",
        "eightek", "ninetek", "tentek", "levtek", "twelftek", "drazetek", "eptek", "fimtek"]
};

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
        v.val(num.toString(v.radix).toUpperCase());
    });
    updateText(num)
}

/** translate and update the text-out element */
function updateText(num) {
    var pronounce = "zero";
    var digitCount = 0;
    var digitsRemain = num > 0;
    while (digitsRemain) {
        var nextDigit = num % 0x10;
        digitCount ++;
        console.log(countSet.filter(":checked").get(0).id, digitCount, nextDigit.toString(0x10));
        num = (num / 0x10 >> 0); // >> 0 as alternative to Math.floor
        digitsRemain = num > 0;
    }
    $( "#translation").text(pronounce);
}

/** respond to changing counting type */
function registerChangeCount() {
    countSet.change(function() {
        updateText($("#decfield").val());
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
        numberTFs[k].change(function() {
            var num = parseInt(numberTFs[k].val(), radix);
            num = isNaN(num) ? 0 : num;
            updateTFs(num)
        });
    });

    countSet = $( countSet );

    initFields();
    registerChangeCount();
});
