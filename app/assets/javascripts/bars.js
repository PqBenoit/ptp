
function open_rate_box(){

    var $star = $(".star"),
        $rateInput = $("#comment_rate"),
        $rateContainer = $('#new-rate');

    $rateContainer.css({
        top: -($(window).height()/2-220)
    })



    $star.on("click",function(){
        var rate = $(this).data('value');
        $star.each(function(index){
            if(index<rate){
                $(this).css({
                    opacity:1
                });
            }
            else{
                $(this).css({
                    opacity:0.5
                });
            }
        })

        $rateInput.val(rate);
        console.log(rateInput);
    })

    $('#rate').on('click', function(){
        var $newRate = $('#new-rate');
        $newRate.fadeIn();
    })
}

function close_rate_box(){
    var $newRate = $('#new-rate'),
        $close =   $('#close-btn');
    console.log($close);

    $close.on('click', function(){
        $newRate.fadeOut();
    })
}

function showRate() {
    var rateShow = $('#rate-c').data('rate'),
        $divStar = $('.rate-s');
    console.log($divStar);

    $divStar.each(function(index){
        console.log(index);
        if(index<rateShow){
            $(this).css({
                opacity:1
            });
        }
        else{
            $(this).css({
                opacity:0.5
             });
        }
    })
    console.log(rateShow);

}