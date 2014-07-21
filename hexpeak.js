var numTFs = [];

/** object prototype that parses a textfield and updates others */
function NumberTF(id, rad) {
    this.elem = $( id );
    this.radix = rad;
    $( id ).blur(function() {
        var num = parseInt($(this).val(), rad);
        num = isNaN(num) ? 0 : num;
        $.each(numTFs, function(k, v){
            v.elem.val(num.toString(v.radix));
        })
    });
}

$(document).ready(function() {
    numTFs = [
        new NumberTF("#decfield", 10),
        new NumberTF("#binfield", 2),
        new NumberTF("#octfield", 8),
        new NumberTF("#hexfield", 16)
    ];
});
