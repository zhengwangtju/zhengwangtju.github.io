$(document).ready(function(){
    var now = "tab1";
    $(".tab").click(function(){
        var index = $(this).attr("name");
        if(index!=now){
            $("."+now).removeClass("line");
            $("."+index).addClass("line");

            
            $("."+now + "-content").addClass("none");
            $("."+index + "-content").removeClass("none");
            
            now = index;
        }
    })
});