var playing = false;
var numTFs = [];

/** function to initialize the fields to a random value */
function initFields(min, max) {
    min = min || 0x10;
    max = max || 0xFFF;
    var randVal = Math.floor(Math.random() * (max-min) + min);
    updateTFs(randVal);
}

/** object prototype that parses a textfield and updates others */
function NumberTF(id, rad) {
    this.elem = $( id );
    this.radix = rad;
    $( id ).change(function() {
        var num = parseInt($(this).val(), rad);
        num = isNaN(num) ? 0 : num;
        updateTFs(num)
    });
}

/** function to synchronize all fields according to their respective bases */
function updateTFs(num) {
    $.each(numTFs, function(k, v){
        v.elem.val(num.toString(v.radix).toUpperCase());
    })
}

$(document).ready(function() {
    numTFs = [
        new NumberTF("#decfield", 10),
        new NumberTF("#binfield", 2),
        new NumberTF("#octfield", 8),
        new NumberTF("#hexfield", 16)
    ];
    initFields();
//    console.log($(numTFs[0].elem).val())
});
