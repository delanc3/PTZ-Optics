let arrowKeys = ['up', 'down', 'left', 'right', 'esc'];
let numKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
let sliderKeys = ['q', 'a', 'w', 's'];
let slideKeyNums = [1000, 0, 1000, 0];
let activePreset;

requirejs(['jquery', 'mousetrap.min'], function   ($, Mousetrap) {  
    
    
    arrowKeys.forEach(function(x) {
        Mousetrap.bind(x, function(e) {
           $(`#${x}`).addClass('pressed');
        }, 'keydown');
        Mousetrap.bind(x, function(e){
            $(`#${x}`).removeClass('pressed');
        }, 'keyup');
    });
    
    numKeys.forEach(function(x) {
        Mousetrap.bind(x, function(e) {
            $(`#pst${x}`).focus();
            activePreset = $(`#pst${x}`).html();
            $('#camTitle').html(`Active Preset: ${activePreset}`);
        });
    });
    
    sliderKeys.forEach(function(x, i) {
        Mousetrap.bind(x, function(e) {
            $(`.${x}`).val(slideKeyNums[i]);
        }, 'keydown');
        Mousetrap.bind(x, function(e) {
            $(`.${x}`).val(500);
        }, 'keyup');
    });
    
    $('.btn').click(function(e) {
        activePreset = $(this).html();
        $('#camTitle').html(`Active Preset: ${activePreset}`);
    })
});

function preview(e) {
    number = $(e).html();
    $('#camTitle').html(`Preset Preview: ${number}`);
}

function reset() {
    $('#camTitle').html(`Active Preset: ${activePreset}`);
}