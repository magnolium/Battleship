
if (document.createStyleSheet) {
    document.createStyleSheet('bsx.css');
}

$(document).ready(function () {
    //console.log("Browser ready");

    gUser = localStorage.getItem("game_user");

    hubConnection = new signalR.HubConnectionBuilder()
        //.withUrl("http://stiletto.ddns.net:5000/BattleHub")
        .withUrl(domain+":5000/BattleHub")
        .build();
    
    hubConnection.on("send", data => {
        console.log("ID:", gUser, data);
        localStorage.setItem("client_id", data);
        clientId = data;
    });

    hubConnection.on("UpdateGameBoard", data => {
        //console.log("JV-UpdateGameBoard:", gUser, gRemoteUser, data);
        //console.log("UpdateGameBoard:", data);
        clientId = data;
        getStatus();        
    });

    hubConnection.on("UpdateUserList", data => {
        last_list = "";
        images_data = [];
        LoadUserList();
    });


    hubConnection.on("NewGame", data => {

        var datax = JSON.parse(data);
        
        //console.log("NewGame:", datax);

        Polling = false;

        clearGameboard();
        
        getStatus();   
    });

    hubConnection.on("ClearMonitor", data => {
        var datax = JSON.parse(data);
        //console.log("*** CLEAR GAME ***", datax.gameid +" : "+gUser);
        if(datax.gameid.indexOf(gUser) != -1)
        {
            ShowPlayAgainModal();
        }
    });

    if(hubConnection.connectionState>0)
        $("#online-img")[0].src = "images/online.png";
    else
        $("#online-img")[0].src = "images/offline.png";

    hubConnection.start().then(() => hubConnection.invoke("PlayerSetup", gUser))
    .then(datax => {
        console.log("SYSTEM-READY:", datax);
      
        Initialize();

        LoadUserList();
    })
})

function Initialize()
 {
    var url = window.location.href;

    aud1 = document.getElementById("sound-effects-1");
    aud2 = document.getElementById("sound-effects-2");
    aud3 = document.getElementById("sound-effects-3");
    aud4 = document.getElementById("sound-effects-4");
    aud1.src = "audio/ping.mp3";
    aud2.src = "audio/exp1.mp3";
    aud3.src = "audio/exp2.mp3";
    aud4.src = "audio/splash.mp3";

    var results = new RegExp('[\\?&]siteid=([^&#]*)').exec(url);
    if (!results) { 
        siteid = "ops";
    }
    else
        siteid = results[1];

    bIsLoading = true;

    if (typeof window.orientation !== 'undefined')
        device_mode = "MOB";
    else
        device_mode = "PC";
    
    window.mobilecheck = function() {
      var check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      if(check);
        device_mode = "MOB";
    };

    window.mobileAndTabletcheck = function() {
      var check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      if(check);
        device_mode = "TAB";
    };

    if(device_mode !== "PC")
        OFFSET_FLT = 0;

    gUser = localStorage.getItem("game_user");
    gPswd = localStorage.getItem("game_pswd");
    //console.log("game_user", gUser);

    $('#id_local').addClass("active");

    if(gUser === null)
    {
        pauseClock = true;

        //btn.style.visibility = "visible";

        var modal = document.getElementById('loginModal');
        var modalFrm = document.getElementById('loginForm');
        
        modalFrm.onclick = function(event) {
            //modal.style.display = "none";
            //modalFrm.style.display = "none";
        }
        // When the user clicks anywhere outside of the modal, close it
        modal.onclick = function(event) {
            //modal.style.display = "none";
        }

        modal.style.display = "block";    
        $('#btn-end-game').addClass('disable')  
    }
    else
    {
        $("#hdr-cfg-local").html(gUser);
        $("#hdr-cfg-remote").html(gRemoteUser);

        getStatus();

        $('#btn-reset').addClass('disable')
        $('#btn-request').addClass('disable')
        $('#btn-play-again').addClass('disable')
        $('#btn-end-game').addClass('disable')        
    }
}

//var myApp = angular.module('myApp', ['ngRoute','ngResource']);

var hubConnection;
var clientId;

//D STUFF
var root = -1;
var HeaderText = "";
var bSV = false;
var bIsLoading = false;
var lastTab = "local";
var device_mode = "XX";
// globals
var myVar;
var angRefresh;
var processing = true;
var gUser = "";
var gPswd = "";
var gRemoteUser = "";
var domain = "http://localhost";
//var domain = "http://stiletto.ddns.net";
var apiroot = domain+"/battleshipapi/api/";
var imgroot = domain+"/battleship/images";
// var apiroot = domain+"/battleshipapi/api/";
// var imgroot = domain+"/battleship/images";
var norefresh = false;
var pauseClock = false;
var username =  getQueryVariable("username");
var root = -1;
var dragging = 0;
var siteid = "";
var isType = "";
var barwidth = 400;
var barheight = 20;
var defaultGuid = "";
var cfg = null;
var myVar;
var sptcfg = null;
var s_profile = "";
var views_data = [];
var images_data = [];
var fadein_duration = 500;
var fadeout_duration = 500;
var strokew = 0.1;
var cell_strokew = 1;
var cell_stroke_opacity = 1;
var cell_stroke_colour = "#eee";
var svyid = "";
var idx = 0;
var offsetX = 10;
var offsetY = 0;
var s_barHeight = 20;
var cell_size = 40;
var rows = 13;
var columns = 14;
var game_id = "royfagon|caitlan";
var PLAY_MODE = false;
var PENDING_REQUEST = true;
var REQUEST_MODE = false;
var TURN_CHANGE = false;
var YOURTURN = false;
var ENDGAME = false;
var PING = 1;
var isRequested = false;
var myStatus = "";
var isIssuer = "";
var hitcount = 0;
var localHitcount = 0;
var percentage = 0;
var sunk = 0;
var lastHit = 0;
var current_status = null;
var OFFSET_FLT = 600;
var OFFSET_HIT = 0;
var last_data = null;
var enable_sound = true;
var last_list;
var last_list_2;
var aud1 = null;
var aud2 = null;
var aud3 = null;
var aud4 = null;
var idx = 0;

function SetSelect()
{
    var e = document.getElementById("company-item");
    var q = e.options[e.selectedIndex].value;
    var idd = "#company-item-button";
    $(idd).find('span').html(q);
}

function ClearCookies() {
    if (ctrlKey == 1)
    {
        localStorage.clear();
    }
}

function showLabel(txt){
  var retval = txt;
  return retval;
}


function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

function DragEnd(){
  dragging = 0;
}

function getStyle(style, node)
{
  if(style != null)
  {
      //console.log("getStyle --->", style.toString());
      var arr = style.split(";"); 
      $.each(arr, function (i, obj)  //loop through all the nodes held in vectAxis0
      {
        var prop = obj.split(":"); 
        //console.log(prop);
        if(prop[0] == "fill")node.style("fill", prop[1]);
        if(prop[0] == "stroke")node.style("stroke", prop[1]);
        if(prop[0] == "stroke-opacity")node.style("stroke-opacity", prop[1]);
        if(prop[0] == "stroke-width")node.style("stroke-width", prop[1]);
      });
      
  }
}

function Test(evt)
{
    GetImage(gUser, "#profile-image");
}

function HideHitList(b_hide)
{
    //console.log("HideHitList", b_hide);
    
    var ctl = document.getElementById('data');
    var local = "", remote = "", request = "";

    //$("#request-tab").hide();
    

    if(b_hide)
    {
        local = "hidden";
        remote = "visible";
        $("#data").addClass("remote");
        $("#data").removeClass("local");
    }
    else
    {
        local = "visible";
        remote = "hidden";
        $("#data").addClass("local");
        $("#data").removeClass("remote");
    }
    if(device_mode !== "PC")
    {
        svg.selectAll("image.hdr").attr("visibility", "visible");
        svg.selectAll("text.txt").attr("visibility", "visible");
        svg.selectAll("image.sea").attr("visibility", local);
        svg.selectAll("image.hit").attr("visibility", remote);
    }
} 

function HideTheGameboards()
{
    //$("#request-tab").show();

    var ctl = document.getElementById('data');
    var local = "", remote = "", request = "";
    if(device_mode !== "PC")
    {
        svg.selectAll("image.hdr").attr("visibility", "hidden");
        svg.selectAll("image.sea").attr("visibility", "hidden");
        svg.selectAll("image.hit").attr("visibility", "hidden");
        svg.selectAll("text.txt").attr("visibility", "hidden");
    }
} 


function OnSelectedTab(tabView){
    
    //console.log("OnSelectedTab["+tabView+"]["+lastTab+"]");

    lastTab = tabView;

    if(tabView==="remote")
    {
        $("#data").show();
        $('.header-btn').show();
        $("#request-tab").hide();
        $("#game-tab").hide();
        $("#users-tab").hide();
        $("#help-tab").hide();
        $("#online").hide();
        HideHitList(true);
    }
    if(tabView==="local")
    {
        $("#data").show();
        $('.header-btn').show();
        
        $("#request-tab").hide();
        $("#users-tab").hide();
        $("#help-tab").hide();
        $("#game-tab").hide();
        $("#online").hide();
        HideHitList(false);
    }
    if(tabView==="request")
    {
        $('.header-btn').hide();
        $("#data").hide();
        $("#request-tab").show();
        $("#users-tab").hide();
        $("#help-tab").hide();
        $("#game-tab").hide();
        $("#online").hide();
        $("#sound-img").hide();
        HideTheGameboards();
    }
    if(tabView==="active-game")
    {
        $("#data").hide();
        $('.header-btn').hide();
        $("#users-tab").hide();
        $("#request-tab").hide();
        $("#help-tab").hide();
        $("#game-tab").show();
        $("#online").hide();
        HideTheGameboards();
    }    
    if(tabView==="users")
    {
        //console.log("users selected");
        $('.header-btn').hide();
        $("#users-tab").show();
        $("#active-tab").hide();
        $("#request-tab").hide();
        $("#help-tab").hide();
        $("#game-tab").show();
        $("#data").hide();
        $("#online").hide();
        HideTheGameboards();
    }    

    if(tabView==="help")
    {
        //console.log("Help selected");
        $("#online").hide();
        $('.header-btn').hide();
        $("#help-tab").show();
        $("#users-tab").hide();
        $("#active-tab").hide();
        $("#request-tab").hide();
        $("#game-tab").hide();
        $("#data").hide();
        HideTheGameboards();
    }    
}

function objKeydown()
{
    console.log("objKeydown ");
    
}


function buildHitZones(mode) {
    //console.log("buildHitZones");

    var nodes = tree.nodes(root);
    var height = Math.max(850, nodes.length * barHeight + margin.top + margin.bottom);

    for(x =0; x<columns; x++)
    {
        for(y =0; y<rows; y++)
        {
            createSVGObject(x, y, 0);
        }
    }
    svg.selectAll("circle").remove();
    createSVGExplosion();
}


function createSVGObject(x, y, cell_color) {
    //console.log("createSVGObject");

    var origY = y;
    var line = "";
    var clr = "#fff";

    if (cell_color === 0)
        clr = "#3299CC";
    else if (cell_color === 1)
        clr = "#cfcfcf";
    else if (cell_color === 2)
        clr = "#e0dfe3";
    else if (cell_color === 3)
        clr = "#fff";

    if(x === 0 || y === 0)
        clr = "#3299CC";
    else
        clr = "#03B4C8";

    var hdrClr = "";
    var img = "";
    var cls = "sea ";
    var hdrRC = false;
    var hdr_offset = 0;

    if(x > 0 && y > 0)
    {
        hdr_offset = OFFSET_FLT;
        hdrRC = false;
        cls = "sea ";
        hdrClr = "cell_"+x+"_"+y;
        img = imgroot+"/bs_sea.png";
    }
    else
    {
        hdr_offset = OFFSET_FLT;
        hdrRC = true;
        cls = "hdr ";
        img = imgroot+"/bs_hdr.png";
    }

    var xx = (x * (cell_size + 1)) + offsetX;
    var yy = (y * (cell_size + 1)) + offsetY;

    current_obj = svg.insert("image", "img.battleship")
        .attr("xlink:href", img)
        .attr("class", cls + hdrClr)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr('x', xx+OFFSET_FLT)
        .attr('y', yy)
        .attr("idx", "cell_"+x+"_"+y)
        .attr('width', cell_size)
        .attr('height', cell_size)
        .attr("visibility", "visible")
        .attr("hit", "X")
        .attr("isship", "0")
        .style("fill", clr)
        .on('keypress', objKeydown)
        .on("click", OnGameboardClick)   
        .on("mouseover", function (d)
        {
            tooltip.transition()        
                .duration(2000)     
                .style("opacity", .9);

            tooltip.html('<H1>' + "cell_"+x+"_"+y + '</H1>')
                .style("width", "200px")
                //.style("height",  "20px")
                .style("left", "100px")
                .style("top", "680px")
                .attr("y", "20px");            
        })        
        .on("mouseout", function(d) 
        {       
            tooltip.transition().duration(500).style("opacity", 0); 
        })        
        .style("stroke", cell_stroke_colour)
        .style("stroke-opacity", cell_stroke_opacity)
        .style("stroke-width", cell_strokew);
        //current_idx = idx;

    if(x > 0 && y > 0)
    {
        hdr_offset = OFFSET_HIT;
        hdrRC = false;
        cls = "hit ";
        hdrClr = "cell_"+x+"_"+y;
        img = imgroot+"/bs_bak.png";
    }
    else
    {
        hdr_offset = OFFSET_HIT;
        hdrRC = true;
        cls = "hdr ";
        img = imgroot+"/bs_hdr.png";
    }

     current_obj = svg.insert("image", "img.battleship")
            .attr("xlink:href", img)
            .attr("latent_img", img)
            .attr("class", cls + hdrClr)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr('x', xx+OFFSET_HIT)
            .attr('y', yy)
            .attr("idx", "hit_"+x+"_"+y)
            .attr('width', cell_size)
            .attr('height', cell_size)
            .attr("visibility", "visible")
            .attr("hit", "X")
            .attr("isship", "0")
            .style("fill", clr)
            .on('keypress', objKeydown)
            .on("click", OnGameboardClick)   
            .on("mouseover", function (d)
            {
                tooltip.transition()        
                    .duration(2000)     
                    .style("opacity", .9);

                tooltip.html('<H1>' + "cell_"+x+"_"+y + '</H1>')
                    .style("width", "200px")
                    //.style("height",  "20px")
                    .style("left", "100px")
                    .style("top", "680px")
                    .attr("y", "20px");            
            })        
            .on("mouseout", function(d) 
            {       
                tooltip.transition().duration(500).style("opacity", 0); 
            })              
            .style("stroke", cell_stroke_colour)
            .style("stroke-opacity", cell_stroke_opacity)
            .style("stroke-width", cell_strokew);

   // }
   
    var title = "";
    if(x === 0)
        title = String.fromCharCode(64+y);
    if(y === 0)
        title = x;
    if(x === 0 && y === 0)
        title = "";

    var txTop = svg.insert("text")
        .attr("class", "txt ")
        .attr('font-family', 'Arial Unicode MS')
        .attr('font-size', 20)
        .attr('x', xx+12+OFFSET_HIT)
        .attr('y', yy+25)
        .attr('xx', x)
        .attr('yy', y)
        .attr("idx", "txt0_" + x + "_" + y)
        .style("fill", "black") 
        .attr("visibility", "visible")
        .text(title);

    var txTop = svg.insert("text")
        .attr("class", "txt ")
        .attr('font-family', 'Arial Unicode MS')
        .attr('font-size', 20)
        .attr('x', xx+12+OFFSET_FLT)
        .attr('y', yy+25)
        .attr('xx', x)
        .attr('yy', y)
        .attr("idx", "txt1_" + x + "_" + y)
        .style("fill", "black") 
        .attr("visibility", "visible")
        .text(title);
}

function createSVGExplosion() {
    current_obj = svg.append("circle")
        .attr("class", "explosion")
        .attr("cx", 0)
        .attr("cy", 0)    
        .attr("r", 0)        
        .style("fill", "#0000ff")
        .style("opacity", .5)
        .style("stroke-width", "5px")
        .attr("idx", "cell_exp")
        .style("stroke", "#cc0")
        .on("mouseover", mouseOverCell)
        .attr("visibility", "visible");
    return current_obj;
}

function mouseOverCell()
{
}

function setCenter() {
    var node = svg.selectAll(".explosion");
    var x = Number(node[0][0].getAttribute("x"));
    var y = Number(node[0][0].getAttribute("y"));
    var wd = 40;
    var ht = 40;
    var cx = x + wd/2;
    var cy = y + ht/2;
    //console.log(cx,cy, );
    return {"x" : cx, "y" : cy };
}  

function object_click(){

    $('.nav-tabs a[href="#remote"]').tab('show')    

    let idd = this.getAttribute("idd");

}

function put_Horizontally(quietly, parts, index)
{
    var img = imgroot+"/bs_red.png";

    //Get random ship size from 3 to 5
    let bOK = true;
    while(bOK)
    {
        var initialRandomColumn = Math.floor((Math.random() * (columns-1)) + 1);
        var initialRandomRow = Math.floor((Math.random() * (rows-1)) + 1);
        
        let bDone = true;
        var ship_len = 0;

        while(bDone)
        {
            ship_len = Math.floor((Math.random() * 5) + 1);
            if(ship_len === parts)
                bDone = false;
        }

        //Random cell selection withing range
        var idd = ".cell_"+initialRandomColumn+"_"+initialRandomRow;
        var node = svg.selectAll(idd);

        bDone = true;
        var pos = 0;
        while(bDone)
        {
            pos = initialRandomColumn + ship_len;
            if(pos < columns)
                bDone = false;
            else
            {
                initialRandomColumn = Math.floor((Math.random() * (columns-1)) + 1);
            }
        }
        idd = ".cell_"+initialRandomColumn+"_"+initialRandomRow;
 
        bOK = false;    //turned off for collision test
        for ( i = 0; i < ship_len; i++)
        {
            var idd = ".cell_"+(initialRandomColumn + i)+"_"+initialRandomRow;
            var node = svg.selectAll(idd);
            if(node[0][0].getAttribute("isship") === "1")
            {
                bOK = true; //Try again
                break;
            }
        }

        if(!bOK)
        {
            for ( i = 0; i < ship_len; i++)
            {
                var idd = ".cell_"+(initialRandomColumn + i)+"_"+initialRandomRow;
                var node = svg.selectAll(idd);

                if(ship_len === 3)
                {
                    if(i==0)img = imgroot+"/bs_5_0_h.png";
                    if(i==1)img = imgroot+"/bs_5_1_h.png";
                    if(i==2)img = imgroot+"/bs_5_4_h.png";
                }
                if(ship_len === 4)
                {
                    if(i==0)img = imgroot+"/bs_5_0_h.png";
                    if(i==1)img = imgroot+"/bs_5_1_h.png";
                    if(i==2)img = imgroot+"/bs_5_2_h.png";
                    if(i==3)img = imgroot+"/bs_5_4_h.png";
                }
                if(ship_len === 5)
                {
                    if(i==0)img = imgroot+"/bs_5_0_h.png";
                    if(i==1)img = imgroot+"/bs_5_1_h.png";
                    if(i==2)img = imgroot+"/bs_5_2_h.png";
                    if(i==3)img = imgroot+"/bs_5_3_h.png";
                    if(i==4)img = imgroot+"/bs_5_4_h.png";
                }

                node[0][0].setAttribute("ship_part", index+"_"+i+"_"+ship_len);
                node[0][0].setAttribute("href", img);
                node[0][0].setAttribute("isship", "1");
                node[0][0].setAttribute("style", "fill: rgb(196,196,196)");
            }
        }
    }   
}

function put_Vertically(quietly, parts, index)
{
    var img = imgroot+"/bs_red.png";

    let bOK = true;
    while(bOK)
    {
        var initialRandomColumn = Math.floor((Math.random() * (columns-1)) + 1);
        var initialRandomRow = Math.floor((Math.random() * (rows-1)) + 1);

        //Get random ship size from 3 to 5
        let bDone = true;
        var ship_len = 0;

        while(bDone)
        {
            ship_len = Math.floor((Math.random() * 5) + 1);
            if(ship_len === parts)
                bDone = false;
        }

        bDone = true;
        var pos = 0;
        while(bDone)
        {
            pos = initialRandomRow + ship_len;
            if(pos < rows)
                bDone = false;
            else
            {
                initialRandomRow = Math.floor((Math.random() * (rows-1)) + 1);
            }
        }
        idd = ".cell_"+initialRandomColumn+"_"+initialRandomRow;

        bOK = false;    //turned off for collision test
        for ( i = 0; i < ship_len; i++)
        {
            var idd = ".cell_"+initialRandomColumn+"_"+(initialRandomRow+i);
            var node = svg.selectAll(idd);
            if(node[0][0].getAttribute("isship") === "1")
            {
                bOK = true; //Try again
                break;
            }
        }

        if(!bOK)
        {
            for ( i = 0; i < ship_len; i++)
            {
                var idd = ".cell_"+initialRandomColumn+"_"+(initialRandomRow+i);
                var node = svg.selectAll(idd);

                if(ship_len === 3)
                {
                    if(i==0)img = imgroot+"/bs_5_4_v.png";
                    if(i==1)img = imgroot+"/bs_5_1_v.png";
                    if(i==2)img = imgroot+"/bs_5_0_v.png";
                }
                if(ship_len === 4)
                {
                    if(i==0)img = imgroot+"/bs_5_4_v.png";
                    if(i==1)img = imgroot+"/bs_5_2_v.png";
                    if(i==2)img = imgroot+"/bs_5_1_v.png";
                    if(i==3)img = imgroot+"/bs_5_0_v.png";
                }
                if(ship_len === 5)
                {
                    if(i==0)img = imgroot+"/bs_5_4_v.png";
                    if(i==1)img = imgroot+"/bs_5_3_v.png";
                    if(i==2)img = imgroot+"/bs_5_2_v.png";
                    if(i==3)img = imgroot+"/bs_5_1_v.png";
                    if(i==4)img = imgroot+"/bs_5_0_v.png";
                }

                node[0][0].setAttribute("ship_part", index+"_"+i+"_"+ship_len);
                node[0][0].setAttribute("href", img);
                node[0][0].setAttribute("isship", "1");
                node[0][0].setAttribute("style", "fill: rgb(196,196,196)");
            }
        }
    }
}

function generateAircraftCarrier(quietly, parts, index) // 5 = Aircraft Carrier
{
    var choice = Math.floor((Math.random() * 2) );

    if (choice === 0)
        put_Horizontally(quietly, parts, index);
    else
        put_Vertically(quietly, parts, index);
}

function BuildTheFleet(quietly) // 
{
    //console.log("BuildTheFleet", REQUEST_MODE);

    if(REQUEST_MODE)
        return;

    svg.selectAll("image").remove();
    svg.selectAll("text").remove();   
 
    for(x =0; x<columns; x++)
    {
        for(y =0; y<rows; y++)
        {
            createSVGObject(x, y, 0);
        }
    }

    createSVGExplosion();
    
    //Generate 4 5
    generateAircraftCarrier(quietly, 5, 0);
    generateAircraftCarrier(quietly, 5, 1);
    generateAircraftCarrier(quietly, 5, 2);
    generateAircraftCarrier(quietly, 5, 3);

    //Generate 1 4
    generateAircraftCarrier(quietly, 4, 4);

    //Generate 2 3
    generateAircraftCarrier(quietly, 3, 5);
    generateAircraftCarrier(quietly, 3, 6);
    generateAircraftCarrier(quietly, 3, 7);
    
    generateAircraftCarrier(quietly, 4, 8);
}

function btnRequest(mode, userid) // 
{
    //console.log("btnRequest", mode, userid, REQUEST_MODE, PLAY_MODE);
    if(REQUEST_MODE)
        return;
    
    if(PLAY_MODE)
    {
        console.log("GAME-IN-PLAY");
        return;
    }

    //console.log("selected:",userid);

    gRemoteUser = userid;
    localStorage.setItem("remote_user", gRemoteUser);    
    
    $("#hdr-cfg-local").html(gUser);
    $("#hdr-cfg-remote").html(gRemoteUser);    
    //console.log("Building LOCAL fleet");

    var hasShips = false;
    var nodes = svg.selectAll(".sea");
    $.each(nodes[0], function (i, obj)
    {
        if( obj.getAttribute("isship") === "1")
            hasShips = true;
    });  

    var jx = buildFleetJSON();
    
    if(!hasShips)
    {
        //console.log("NO SHIPS SELECTED!");
        BuildTheFleet();
        btnRequest(mode, userid); //Run again
        return;
    }
    else
        console.log("SHIPS SELECTED!");

    var status = "";
    

    if(hubConnection.connectionState>0)
    {
        hubConnection.invoke("RequestSubmit", jx)
        .then(datax => {
            var data = JSON.parse(datax);
            // you can access your data here
            //console.log("HUB Response:", data)
            //console.log('COMPLETED', data);
            postApiAction("FETCHGAMEBOARD");
            
            gotoGameboard();        
        })
    }
}

function btnPlayGame() // 
{
    if(PLAY_MODE)
    {
        //console.log("GAME-IN-PLAY");
        return;
    }
}

function btnEndGame() // 
{
    if(isIssuer===gUser || ENDGAME)
    {
        PLAY_MODE = false;
        REQUEST_MODE = false;
        //console.log("END-THE-GAME");
        postApiAction("ENDGAME");
        
    }
}

function validateLogin(type){
    //console.log( "validateLogin", $("#login-username").val() );
    var validatedUser = false;
    var validatedPswd = false;
    $("#login-username").each(function () {
        validatedUser =  true;
        if(this.value.length < 8)
            validatedUser = false;

        if(/\s/.test(this.value))
        {
            //console.log("login-username failed");
            validatedUser = false;
        }
    }); 

    $("#login-password").each(function () {
        validatedPswd =  true;
        if(this.value.length < 8)
            validatedPswd = false;
       if(!/\d/.test(this.value))
            validatedPswd = false;
        if(!/[a-z]/.test(this.value))
            validatedPswd = false;
        if(!/[A-Z]/.test(this.value))
            validatedPswd = false;
        if(/[^0-9a-zA-Z]/.test(this.value))
            validatedPswd = false;
    });     

    if(!validatedUser || !validatedPswd)
    {
        if(!validatedUser)
            $("#messageid").html("Invalid Username");
        else
            if(!validatedPswd)
                $("#messageid").html("Invalid Password");
    }
    else
    {
        var json = "{ \"user\" : \"" + $("#login-username").val() + "\", \"password\" : \"" + $("#login-password").val() + "\", \"type\" : \"" + type + "\"}";
            
        var status = "";

        if(hubConnection.connectionState>0)
        {
            hubConnection.invoke("ValidateLogin", json)
            .then(datax=> {

                var data = JSON.parse(datax);
                // you can access your data here
                //console.log("ValidateLogin2:", data)
                
                status = data.response;

                if(status === "OK" || status === "PRESENT")
                {
                    localStorage.setItem("game_user", $("#login-username").val());           
                    localStorage.setItem("game_pswd", $("#login-password").val());           
                    
                    gUser = $("#login-username").val();

                    var modal = document.getElementById('loginModal');
                    var modalFrm = document.getElementById('loginForm');

                    //console.log('STYLES:', modal.style.display);

                    modal.style.display = "none";
                    modalFrm.style.display = "none";

                    //Need to check if we have a game-in-progress (GIP)
                    buildHitZones(0);

                    $("#hdr-cfg-local").html(gUser);
                    $("#hdr-cfg-remote").html(gRemoteUser);
                    //console.log("PAUSE OFF");
                    pauseClock = false;        
                }
                else
                {
                    //console.log('STATUS:', status);
                    if(status=="USEREXISTS")$("#messageid").html("That username already exists");
                    if(status=="PSWDFAIL")$("#messageid").html("Incorrect password");
                }

                $("#hdr-cfg-profile").html($("#login-username").val());

            })
        }
    }    
}


function playGame(user){
    //console.log("playGame", user);
    
    gRemoteUser = user;

    var json = '{\"user1\":\"'+gRemoteUser+'\",\"user2\":\"'+gUser+'\"}';

    if(hubConnection.connectionState>0)
    {
        hubConnection.invoke("StartGame", json)
        .then(datax => {
            var data = JSON.parse(datax);
            // you can access your data here
            //console.log("playGame:", data)
            postApiAction("ISPLAYING");
        })
    }
 
}

function continueGame(user){
    //console.log("playGame", user);
    
    gRemoteUser = user;

    selectRemoteUser(user);
}

function postApiAction(cmd, info=""){
    $("#wait").show(); 
    //See if you're playing with that user. If you are then load the gameboard for that session
    var json = '{\"command\":\"'+cmd+'\",\"user1\":\"'+gUser+'\",\"user2\":\"'+gRemoteUser+'\"}';
    if(ENDGAME)
    {
        if(isIssuer === gUser)
            json = '{\"command\":\"'+cmd+'\",\"user1\":\"'+gUser+'\",\"user2\":\"'+gRemoteUser+'\"}';
        else
            json = '{\"command\":\"'+cmd+'\",\"user1\":\"'+gRemoteUser+'\",\"user2\":\"'+gUser+'\"}';
        ENDGAME = false;
    }

    if(info.length>0)
        json = '{\"command\":\"'+cmd+'\",\"user1\":\"'+gUser+'\",\"user2\":\"'+gRemoteUser+'\", '+info+'}';

    //console.log("postApiAction", json);

    var retValue;


    if(hubConnection.connectionState>0)
    {
        hubConnection.invoke("PostApiAction", json)
        .then(datax => {
            //console.log("DATAX:", datax);
            var dataz = JSON.parse(datax);
            //console.log("postApiActionX-XXXX:", dataz)

            retValue = dataz;

            //PLAY_MODE = false;
            if(dataz.action === "ISPLAYING" && dataz.response === "YES")
            {//If no fleet deployed then deploy it
                //console.log("postApiAction-XXXX", retValue.details);
                
                if( retValue.details.ships_remote.length === 0 )
                {
                    //console.log("postApiAction-ZZZZ");
                    
                    clearGameboard();
                    //REQUEST_MODE = false;

                    BuildTheFleet();   
                    
                    hasShips = true;

                    var jx = buildFleetJSON(false);
                    postApiAction("UPDATEGAMEBOARD", jx);
                    //console.log("postApiAction-FETCHGAMEBOARD-1");
                    hitcount = 0;
                    localHitcount = 0;
                    getStatus();
                }
                else
                {
                    //console.log("postApiAction-FETCHGAMEBOARD-2");
                    //Get the ships data and load into gameboard
                    //postApiAction("FETCHGAMEBOARD");
                    //PLAY_MODE = true;
                    gotoGameboard();
                    RefreshUserList();
                    getStatus();
                }
            }
            else
            {
                //Clear the gameboard
                //console.log("Clear the board @1128 with action/command:", dataz.action, cmd);

                if(dataz.action != "REQ" && 
                    dataz.action != "WAIT" && 
                    dataz.action != "PLAY" && 
                    cmd != "UPDATEHITLIST" && 
                    cmd != "GETREMOTEGAMEBOARD")
                {
                    //clearGameboard();
                }
            }

            if(cmd === "ENDGAME")
            {
                isIssuer = "";
                localStorage.setItem("remote_user", "");
                gRemoteUser = "";    
                console.log("*** END GAME ***");
                UpdateField("ship_down_for", "@@@@", "string");
                UpdateField("winner", "@@@@", "string"); 
                //console.log("-----------------------------");
                clearGameboard();     
                if(isIssuer!==gUser)
                    $('#btn-end-game').addClass('disable')
                getStatus();        
                pauseClock = false;
            }

            if(cmd === "UPDATEGAMEBOARD")
            {
                //console.log("postApiAction-FETCHGAMEBOARD-3", dataz.ships);
                
                getuserinfo();
                //getuserinfo(true);

                var idd = "#id_"+lastTab;
                //console.log("remove active from", idd);
                
                $(idd).removeClass("active");
                $('#id_local').addClass("active");

                OnSelectedTab("local");

                //Populate the gameboard
                
                if(isIssuer === gUser)
                {
                    //console.log("postApiAction-ISSUER", dataz);
                    $.each(dataz.ships, function (i, obj)
                    {
                        var node = svg.selectAll((".sea."+obj.cell));
                        node[0][0].setAttribute("href", obj.img);
                    });           

                    //Populate the gameboard
                    $.each(dataz.ships, function (i, obj)
                    {
                        var node = svg.selectAll((".hit."+obj.cell));
                        node[0][0].setAttribute("latent_img", obj.img);
                        node[0][0].setAttribute("isship", obj.isship);
                    });    

                }
                else
                {
                    //console.log("postApiAction-REQUESTED", dataz);
                    $.each(dataz.ships_remote, function (i, obj)
                    {
                        var node = svg.selectAll((".sea."+obj.cell));
                        node[0][0].setAttribute("href", obj.img);
                    });           

                    //Populate the gameboard
                    $.each(dataz.ships_remote, function (i, obj)
                    {
                        var node = svg.selectAll((".hit."+obj.cell));
                        node[0][0].setAttribute("latent_img", obj.img);
                        node[0][0].setAttribute("isship", obj.isship);
                    });                 
                }
            }
            $("#wait").hide(); 
        }).catch(err => console.error(err.toString()));
    }
}

function buildFleetJSON(HASBRACKETS=true){
    //console.log("buildFleetJSON", HASBRACKETS);

    var jx = "";
    var ship = "\"ships\" : [";
    var hits = "\"hits\" : [";
    var json = "";

    if(HASBRACKETS)
        json = json + "{";    

    json = json + "\"action\":\"REQ\",";        
    json = json + "\"local_user\":\""+gUser+"\",";
    json = json + "\"remote_user\":\""+gRemoteUser+"\",";
    json = json + "\"game_id\":\""+gUser+"|"+gRemoteUser+"\",";
    json = json + "\"columns\" : " + columns+",";
    json = json + "\"rows\" : " + rows+",";

    var nodes = svg.selectAll(".sea");
    $.each(nodes[0], function (i, obj)
    {
        var sunk_img = obj.getAttribute("href").replace(".png", "_h.png");
        //var sunk_img = imgroot+"/fire_512.gif";
        if( obj.getAttribute("isship") === "1")
            ship = ship + "{ \"cell\" : \"" +  obj.getAttribute("idx") + "\", \"isship\" : \"" + obj.getAttribute("isship") + "\", \"img\" : \"" + obj.getAttribute("href") + "\",\"sunk_img\" : \"" + sunk_img + "\",\"ship_part\" : \"" + obj.getAttribute("ship_part") + "\",\"hit\" : \"N\",\"sunk\" : \"N\"},";

        if( obj.getAttribute("hit") === "H" || obj.getAttribute("hit") === "M"  )
            hits = hits + "{ \"cell\" : \"" +  obj.getAttribute("idx") + "\", \"hit\" : \"" + obj.getAttribute("hit") + "\"},";
    });  

    ship = ship + "]";
    hits = hits + "]";

    json = json +  ship;
    json = json + ",";
    json = json + hits;

    var jx = ""
    if(HASBRACKETS)
        json = json = json + "}";    

    jx = json.replace("},]","}] ");    
    //console.log(json);
    return jx;
}

function UpdateHitlistJSON(cell){
    //console.log("UpdateHitlistJSON");

    var json = "{";    
    json = json + "\"command\":\"HIT\",";        
    json = json + "\"user1\":\""+gUser+"\",";
    json = json + "\"user2\":\""+gRemoteUser+"\",";
    json = json + "\"columns\" : " + columns+",";
    json = json + "\"rows\" : " + rows +",";
    json = json + "\"cell\" : \"" + cell + "\"}";
    
    if(hubConnection.connectionState>0)
    {
        hubConnection.invoke("UpdateHitList", json)
        .then(datax => {
            var data = JSON.parse(datax);

            retValue = data;
            
            //console.log("Update done:", retValue);
            TURN_CHANGE = true;

            hubConnection.invoke("UpdateGameBoard", gUser, gRemoteUser);

            getStatus();

            //Reconcile the gameboard from the hitlist
            pauseClock = false;

        })
    }    
}

function clearGameboard(){
    //Clear the gameboard
    //console.log("clearGameboard");

    buildHitZones(0);
    
    var img = imgroot+"/bs_sea.png";
    var imgh = imgroot+"/bs_bak.png";

    sunk = 0;

    svg.selectAll(".sea").attr("isship", "0").attr("hit", "X").attr("sunk", "N").attr("href", img); 
    svg.selectAll(".hit").attr("isship", "0").attr("hit", "X").attr("sunk", "N").attr("href", imgh); 

    var btn = document.getElementById('btn-status');
    btn.style.color = "#009900";
    $("#userturn")[0].innerHTML = "Not Playing";

    PLAY_MODE = false;
    REQUEST_MODE = false;

    $("#percid").removeClass("win");
    $("#percid").removeClass("lose");
    $("#percid")[0].innerHTML = 0;

    $("#hdr-cfg-local").html(gUser);
    $("#hdr-cfg-remote").html(gRemoteUser);            

}

function gotoHitlist(){
    var idd = "#id_"+lastTab;
    $(idd).removeClass("active");
    $('#id_remote').addClass("active");
    OnSelectedTab("remote");
}

function gotoGameboard(){
    var idd = "#id_"+lastTab;
    $(idd).removeClass("active");
    $('#id_local').addClass("active");
    OnSelectedTab("local");
}

function selectRemoteUser(user="")
{
    //console.log('selectRemoteUser');
    if(user.length==0)
    {
        var e = document.getElementById("gamer-item");
        gRemoteUser = e.options[e.selectedIndex].value;
    }

    localStorage.setItem("remote_user", gRemoteUser);    
    
    clearGameboard();

    $("#hdr-cfg-local").html(gUser);
    $("#hdr-cfg-remote").html(gRemoteUser);

    //See if you're playing with that user. If you are then load the gameboard for that session
    postApiAction("ISPLAYING");
}

function getStatus(){
    isRequested = false;

    //console.log('getStatus');
    var json = '{';
    if(isIssuer !== gUser)
        json = json + "\"game_id\":\""+gUser+"|"+gRemoteUser+"\",\"user_id\":\""+gUser+"\",\"type\":\"status\"";
    else
        json = json + "\"game_id\":\""+gRemoteUser+"|"+gUser+"\",\"user_id\":\""+gUser+"\",\"type\":\"status\"";
    json = json + "}";
    
    if(hubConnection.connectionState>0)
    {
        if(lastTab==="remote" || lastTab==="local")
        {
            $("#online-img")[0].src = "images/online.png";
            $("#online").show();
        }

        hubConnection.invoke("GetStatus", json)
        .then(datax => {
            var data = JSON.parse(datax);
            // you can access your data here
            //if(data.requests.length === 1 )
            //    return;

            var requests = data.requests.find(function(element, index) {
                element.index = index;
                return ( ( element.user_1 === gUser ) && ( element.user_2 === gRemoteUser ) ) || ( (element.user_2 === gUser ) &&  ( element.user_1 === gRemoteUser) );
            }); 

            idx = 0;

            if(requests !== undefined  )
            {
                //console.log("GetStatus["+gUser+"]["+gRemoteUser+"]", requests.game_id, requests.index);
                idx = requests.index;
            }

            if( gRemoteUser === "" || gRemoteUser === undefined)
            {

            }

            var q = 0;
            var k = 0;
            $("#request-tab").html("");
            $("#game-tab").html("");
            
            //console.log("getStatus", data.requests.length);
            if(data.requests != undefined)
            {
                if(data.requests.length === 0)  //Clear the board
                {
                    //console.log("No gameboard activity detected");
                    $("#requestX")[0].innerHTML = "Requests";
                    $("#activeX")[0].innerHTML = "Active Games";
                    clearGameboard();
                    $('#action_wait').hide();
                    return;
                }
                else
                {
                    //console.log("getStatus", data.requests[idx].action);
                    var btn = document.getElementById('btn-status');


                    if(last_data===null)
                        last_data = data;

                    //DO COMAPRE
                    //Previous status check
                    if(current_status != null && PLAY_MODE )
                    {
                        
                        //var shiplen = 0;
                        if(isIssuer === gUser)
                        {
                            //console.log("YOU ARE THE ISSUER");
                            pHit = data.requests[idx].hits_remote;
                            pShp = data.requests[idx].ships_remote;
                            vHit = data.requests[idx].hits;
                            vShp = data.requests[idx].ships;

                            prvpHit = last_data.requests[idx].hits_remote;
                            prvpShp = last_data.requests[idx].ships_remote;
                            prvHit = last_data.requests[idx].hits;
                            prvShp = last_data.requests[idx].ships;
                        }
                        else
                        {
                            //console.log("YOU ARE NOT THE ISSUER");
                            pHit = data.requests[idx].hits;   
                            pShp = data.requests[idx].ships;   
                            vHit = data.requests[idx].hits_remote;   
                            vShp = data.requests[idx].ships_remote;   
                            
                            prvpHit = last_data.requests[idx].hits;
                            prvpShp = last_data.requests[idx].ships;
                            prvHit = last_data.requests[idx].hits_remote;
                            prvShp = last_data.requests[idx].ships_remote;
                        }

                        //AUDIO NOTIFICATION CONTROL FOR OPPOSITION
                        
                        $.each(pShp, function (i, obj) //search my hits against opponent and update the hitboard
                        {
                            var prvObj = prvpShp[i];
                            if(obj.hit==="Y")
                            {
                                if(prvObj.hit==="N")
                                {
                                    console.log("**HIT**");
                                    hit();
                                }
                                var imgMiss = imgroot+"/bs_hit.png";
                                let idd = obj.cell;
                                var nodeLocal = svg.selectAll(".hit."+ idd);
                                nodeLocal.attr("xlink:href", imgMiss );              
                            }
                        });

                        if(pHit.length>prvpHit.length)
                            splash();

                        if(vHit.length>prvHit.length)
                            splash();

                        last_data = data;
                    }

                    ////////////////////// GET USER INFO //////////////////
                    getuserinfo();
                    ///////////////////////////////////////////////////////

                    if(TURN_CHANGE)
                    {
                        TURN_CHANGE = false;

                        if(PING === 0)
                            PING = 1;
                        //console.log("TURN_CHANGE");
                    }
                }
            }
            else
            {
                if(data.user==="NOTFOUND");
                {
                    pauseClock = true;

                    localStorage.setItem("game_user", "");
                    localStorage.setItem("game_pswd", "");
                    gUser = "";
                    gRemoteUser = "";

                    $("#span-submit-1").html("Apply");
                    var btn = document.getElementById('btn-submit-2');
                    btn.style.visibility = "hidden";

                    $("#hdr-cfg-local").html(gUser);
                    $("#hdr-cfg-remote").html(gRemoteUser);

                    $('#id_local').addClass("active");

                    var modal = document.getElementById('loginModal');
                    var modalFrm = document.getElementById('loginForm');
                    
                        modalFrm.onclick = function(event) {
                        //modal.style.display = "none";
                        //modalFrm.style.display = "none";
                    }
                    // When the user clicks anywhere outside of the modal, close it
                    modal.onclick = function(event) {
                        //modal.style.display = "none";
                    }

                    modal.style.display = "block";    
                }
                return;
            }

            $.each(data.requests, function (i, obj)
            {
                if(obj.user_2 === gUser && obj.action==="REQ")
                {
                    q++;
                    var tddata = '<div id="btn-' + obj.user_1 + '" class="block select-group publish-play-btn"  onclick="javascript:playGame(\''+ obj.user_1 + '\');"><span class="publish-span-btn" >' + obj.user_1 + '</span><div class="profile-pic-req"><img id="req_'+obj.user_1+'" class="profile-pic" border="0" src="" alt="ZZZ" height="100"/></div></div>';
                    $("#request-tab").append(tddata);
                    GetImageList(obj.user_1, "#req_"+obj.user_1);                    
                }
                
                if( (obj.user_1 === gUser || obj.user_2 === gUser ) && ( obj.action==="PLAY" || obj.action==="WAIT"))
                {
                    k++;
                    var tddata = "";
                    var userid;
                    if(gUser === obj.user_1)
                    {
                        userid = obj.user_2;
                        tddata = '<div id="btx-' + obj.user_2 + '" class="block select-group publish-playing-btn"  onclick="javascript:continueGame(\''+ obj.user_2 + '\');"><span class="publish-span-btn" >' + obj.user_2 + '</span><div class="profile-pic-act"><img id="img_'+obj.user_2+'" class="profile-pic" border="0" src="" alt="XXX" height="100"/></div></div>';
                    }
                    else
                    {
                        userid = obj.user_1;
                        tddata = '<div id="btx-' + obj.user_1 + '" class="block select-group publish-playing-btn"  onclick="javascript:continueGame(\''+ obj.user_1 + '\');"><span class="publish-span-btn" >' + obj.user_1 + '</span><div class="profile-pic-act"><img id="img_'+obj.user_1+'" class="profile-pic" border="0" src="" alt="YYY" height="100"/></div></div>';
                    }

                    $("#game-tab").append(tddata);

                    GetImageList(userid, "#img_"+userid);
                }
                
                //console.log(gUser+" status is "+obj.action, PLAY_MODE, obj.issuer);
                //console.log("ACTION: ", obj.issuer);

                isIssuer = obj.issuer;

                myStatus = obj.action;

                if(obj.action==="REQ")
                {
                    if(isIssuer === gUser)
                        REQUEST_MODE = true;
                    else
                        REQUEST_MODE = false;
                }

                //console.log("GS: ", obj.next_player, gUser);
                if(obj.next_player!==gUser)
                {
                    REQUEST_MODE = false;
                    PLAY_MODE = true;
                    YOURTURN = false;
                    $("#userturn")[0].innerHTML = "THEIR TURN";
                    $("#userturn").addClass("disable");
                }
                
                if(obj.next_player===gUser && gRemoteUser !== "")
                {
                    REQUEST_MODE = false;
                    PLAY_MODE = true;
                    YOURTURN = true;
                    $("#userturn").removeClass("disable");
                    $("#userturn")[0].innerHTML = "YOUR TURN";
                    
                    if(PING)
                    {
                        ping();
                        PING = 0;
                    }                    
                }
            });
      
            last_list_2 = JSON.stringify( data.requests );

            GetImageList(gUser, "#profile-image");

            if(q>0)
                $("#requestX")[0].innerHTML = "Requests ("+q+")";
            else
                $("#requestX")[0].innerHTML = "Requests";

            if(k>0)
                $("#activeX")[0].innerHTML = "Active Games ("+k+")";
            else
                $("#activeX")[0].innerHTML = "Active Games";

            //console.log("getStatus-isIssuer", isIssuer, );

            if(REQUEST_MODE)    //Disable buttons
            {
                $('#btn-reset').addClass('disable')
                $('#btn-request').addClass('disable')
                $('#btn-play-again').addClass('disable')
                if(myStatus !== "REQ")
                    if(isIssuer!==gUser)
                        $('#btn-end-game').addClass('disable')
            }
            else if(PLAY_MODE)    //Disable buttons
            {
                $('#btn-reset').addClass('disable')
                $('#btn-request').addClass('disable')
                $('#btn-play-again').addClass('disable')
                if(myStatus !== "WAIT" || myStatus !== "PLAY")
                {
                    if(isIssuer!==gUser)
                        $('#btn-end-game').addClass('disable')
                    else
                        $('#btn-end-game').removeClass('disable')
                }
            }
            else
            {
                //console.log("** ENABLE BUTTONS **")
                $('#btn-reset').removeClass('disable')
                $('#btn-request').removeClass('disable')
                $('#btn-play-again').removeClass('disable')

                if(isIssuer !== "")
                    if(isIssuer!==gUser)
                        $('#btn-end-game').addClass('disable')
            }
        })
    }
    else
    {
        if(lastTab==="remote" || lastTab==="local")
        {
            $("#online-img")[0].src = "images/offline.png";
        }
        console.log("*** DISCONNECT FROM BATTLEHUB ***");
    }
}

function getuserinfo(fromRemote=false){
    //console.log("getuserinfo");

    if(gRemoteUser.length===0)
        return;

    var json = "{";
    json = json + "\"command\":\"GETUSERINFO\",";     
    if(isIssuer !== gUser)
        json = json + "\"game_id\":\""+gRemoteUser+"|"+gUser+"\",\"user_id\":\""+gUser+"\",\"type\":\"info\"";
    else
        json = json + "\"game_id\":\""+gUser+"|"+gRemoteUser+"\",\"user_id\":\""+gUser+"\",\"type\":\"info\"";
    json = json + "}";

    hubConnection.invoke("GetUserInfo", json)
    .then(datax => {
        var dataz = JSON.parse(datax);
        // you can access your data here
        //console.log("getuserinfo:", dataz)

        if(dataz.requests.length===0)
            return;

        var ship_arr = new Array;
        var pHit = new Array;
        var pShp = new Array;
        var pHitOp = new Array;
        var pShpOp = new Array;
        var prvHit = new Array;
        var prvShp = new Array;
        var prvpHit = new Array;
        var prvpShp = new Array;

        var vHit = new Array;
        var vShp = new Array;
        var vHitOp = new Array;
        var vShpOp = new Array;
        
        //Previous status check
        if(current_status != null && PLAY_MODE)
        {
            
            //var shiplen = 0;
            if(isIssuer === gUser)
            {
                //console.log("YOU ARE THE ISSUER");
                pHit = dataz.requests[idx].hits_remote;
                pShp = dataz.requests[idx].ships_remote;
                vHit = dataz.requests[idx].hits;
                vShp = dataz.requests[idx].ships;
                prvShp = current_status.requests[idx].ships;
                prvHit = current_status.requests[idx].hits;
                prvpShp = current_status.requests[idx].ships_remote;
                prvpHit = current_status.requests[idx].hits_remote;
            }
            else
            {
                //console.log("YOU ARE NOT THE ISSUER");
                pHit = dataz.requests[idx].hits;   
                pShp = dataz.requests[idx].ships;   
                vHit = dataz.requests[idx].hits_remote;   
                vShp = dataz.requests[idx].ships_remote;   
                prvShp = current_status.requests[idx].ships_remote;
                prvHit = current_status.requests[idx].hits_remote;
                prvpShp = current_status.requests[idx].ships;
                prvpHit = current_status.requests[idx].hits;
            }
        }

        sunk = 0;

        //SHOW YOUR FLEET
        $.each(vShp, function (i, obj)
        {
            let idd = obj.cell;
            var nodeLocal = svg.selectAll(".sea."+ idd);
            if(obj.isship==="1")
            {
                if(obj.hit==="N" )
                    nodeLocal.attr("xlink:href", obj.img );    
                else if(obj.sunk==="Y" )
                    nodeLocal.attr("xlink:href", imgroot+"/bs_sea.png" );    
                else
                    nodeLocal.attr("xlink:href", obj.sunk_img );    
            }
            else
                nodeLocal.attr("xlink:href", imgSea );    
        });

        //Clear hits
        svg.selectAll(".hit").attr("xlink:href", imgroot+"/bs_bak.png" )

        //OVERLAY HITS
        $.each(vHit, function (i, obj) //search my hits against opponent and update the hitboard
        {
            var imgMiss = imgroot+"/bs_miss.png";
            let idd = obj.cell;
            var nodeLocal = svg.selectAll(".sea."+ idd);
            nodeLocal.attr("xlink:href", imgMiss );              
        });
        
        //OVERLAY YOUR MISSES ON YOUR BOARD
        $.each(pHit, function (i, obj) //search my hits against opponent and update the hitboard
        {
            var imgMiss = imgroot+"/bs_miss.png";
            let idd = obj.cell;
            var nodeLocal = svg.selectAll(".hit."+ idd);
            nodeLocal.attr("xlink:href", imgMiss );              
        });
        
        //OVERLAY YOUR HITS ON YOUR BOARD
        $.each(pShp, function (i, obj) //search my hits against opponent and update the hitboard
        {
            if(obj.hit==="Y")
            {
                sunk = sunk + 1;
                var imgMiss = imgroot+"/bs_hit.png";

                let idd = obj.cell;
                var nodeLocal = svg.selectAll(".hit."+ idd);

                if(obj.sunk==="Y")
                {
                    nodeLocal.attr("xlink:href", obj.sunk_img ).attr("opacity", .15);
                }
                else
                    nodeLocal.attr("xlink:href", imgMiss );              
            }
        });
    
        if(gUser !== isIssuer)
            $('#btn-end-game').addClass('disable')
        else   
            $('#btn-end-game').removeClass('disable') 
        
        current_status = dataz;
        /////////////////////////////////
        
        $("#percid").removeClass("win");
        $("#percid").removeClass("lose");
        $("#percid")[0].innerHTML = (sunk + " of " + vShp.length);        

        if(dataz.requests[idx].winner === gUser )
        {
            if(dataz.requests[idx].ship_down_for === "@@CLEARBOARD@@")
            {
                UpdateField("ship_down_for", "@@@@", "string");
                UpdateField("winner", "@@@@", "string");
                clearGameboard();
            }            

            $("#percid").addClass("win");
            $("#percid")[0].innerHTML = "YOU WIN";
            PLAY_MODE = false;

            if(gUser === isIssuer)
            {
                $('#btn-end-game').removeClass('disable')            
                $('#btn-play-again').addClass('disable')
            }
            else
                $('#btn-play-again').removeClass('disable')
        }
        else
        {
            if(dataz.requests[idx].winner != "@@@@")
            {
                $("#percid").addClass("lose");
                $("#percid")[0].innerHTML = "YOU LOSE";
                
                if(gUser === isIssuer)
                    $('#btn-end-game').removeClass('disable') 
                else   
                    $('#btn-end-game').addClass('disable') 

                if(gUser !== isIssuer)
                    $('#btn-play-again').removeClass('disable')
                else
                    $('#btn-play-again').addClass('disable')

                PLAY_MODE = false;
            }
        }

        if(dataz.requests[idx].ship_down_for !== "@@@@" && dataz.requests[idx].ship_down_for !== "@@CLEARBOARD@@" && dataz.requests[idx].ship_down_for !== "@@PLAYAGAIN@@")
        {
            boom();
        }

        if(dataz.requests[idx].ship_down_for === gUser)
        {
            var cell = dataz.requests[idx].ship_cell;
            var nodeLocal = svg.selectAll(".sea."+ cell);
            var x = Number(nodeLocal.attr("x"))+20;
            var y = Number(nodeLocal.attr("y"))+20;

            //console.log("HIT-AREA", x, y);

            svg.selectAll("circle").remove();
            var ex = createSVGExplosion();
            ex.attr("cx", x).attr("cy", y).transition().duration(1000).attr("r", "100").transition().duration(1000).attr("r", "0");

            boom();
            BattleshipDown(true);
            SinkTheShip(cell);
        }        


    })
}

function hitCount(hits){
    let h = 0;
    $.each(hits, function (i, obj)
    {
        if(obj.hit==="H")
            h = h + 1;
    });
    return h;
}


function OnGameboardClick(){
    //console.log("OnGameboardClick", this);
    if(this.getAttribute("class").indexOf("sea") != -1)
    {
        btnTest(this);
        return;
    }

    if(device_mode !== "PC")
      if(lastTab != "remote")
        return;

    if(!PLAY_MODE || !YOURTURN || gRemoteUser==="")
        return;
    
    if(pauseClock)
        return;

    pauseClock = true;

    let idd = this.getAttribute("idx").replace("hit_", "cell_");;
    //console.log("idd:", idd );  

    UpdateHitlistJSON(idd);
}

function BattleshipDown(reset){
    //console.log("BattleshipDown");

    var json = "{";    
    json = json + "\"user_1\":\""+isIssuer+"\",";
    
    if(isIssuer !== gUser)
        json = json + "\"user_2\":\""+gUser+"\",";
    else
        json = json + "\"user_2\":\""+gRemoteUser+"\",";
    
    json = json + "\"user_down\":\"@@@@\"";

    json = json + "}";


    hubConnection.invoke("BattleshipDown", json)
    .then(datax => {
        var data = JSON.parse(datax);
        //console.log("BattleshipDown:", data)
        pauseClock = false;
    })
}

function ping(){
    if(!enable_sound)
        return;
    var playPromise = aud1.play(); 
    if (playPromise !== undefined) {
      playPromise.then(function() {
        // Automatic playback started!
      }).catch(function(error) {
        console.log("play-error-ping", error);
      });
    }
}
function hit(){
    if(!enable_sound)
        return;
    var playPromise = aud2.play(); 
    if (playPromise !== undefined) {
      playPromise.then(function() {
        // Automatic playback started!
      }).catch(function(error) {
        console.log("play-error-hit", error);
      });
    }
}

function boom(){
    if(!enable_sound)
        return;
    var playPromise = aud3.play(); 
    if (playPromise !== undefined) {
      playPromise.then(function() {
        // Automatic playback started!
      }).catch(function(error) {
        console.log("play-error-boom", error);
      });
    }
}

function splash(){
    if(!enable_sound)
        return;
    var playPromise = aud4.play(); 
    if (playPromise !== undefined) {
      playPromise.then(function() {
        // Automatic playback started!
      }).catch(function(error) {
        console.log("play-error-splash", error);
      });
    }
}

function btnPlayAgain(reset){
    if(current_status !== null)
    {
        var json = "{\"gameid\": \""+gUser+"\",\"issuer\": \""+isIssuer+"\"}";
        hubConnection.invoke("PlayAgain", json)
        .then(datax => {
        })
    }
}

function confirm(answer){
    if(answer==="YES")
    {
        PlayAgain();
    }
    else
    {
        ENDGAME = true;
        btnEndGame();
    }

    var modal = document.getElementById('playAgainModal');
    var modalFrm = document.getElementById('playAgainForm');
    modal.style.display = "none";
    modalFrm.style.display = "none";    

    pauseClock = false;
}

function PlayAgain(){
    //console.log("PlayAgain", current_status);
    BuildTheFleet(true);
    var jx_them = buildFleetJSON();

    BuildTheFleet();
    var jx_you = buildFleetJSON();

    var json_them = JSON.stringify( JSON.parse(jx_them).ships);
    var json_you = JSON.stringify(  JSON.parse(jx_you).ships);
    
    var json = "{";    
    json = json + "\"user\": \""+gUser+"\",";
    json = json + "\"user_remote\": \""+gRemoteUser+"\",";
    json = json + "\"game_id\":\""+current_status.requests[idx].game_id+"\",";
    if(isIssuer !== gUser)  //Not issuer
    {
        json = json + "\"ships_remote\": "+json_you+",";
        json = json + "\"ships\": "+json_them;
    }
    else
    {
        json = json + "\"ships\": "+json_you+",";
        json = json + "\"ships_remote\": "+json_them;
    }
    json = json + "}";

    hubConnection.invoke("RestartGame", json)
    .then(datax => {
    })
}

function UpdateField(fieldname, value, value_type)
{
    clearGameboard();

    BuildTheFleet(true);

    BuildTheFleet();

    if(current_status === null)
        return;

    var json = "{";    
    json = json + "\"game_id\":\""+current_status.requests[idx].game_id+"\",";
        json = json + "\"field\": \""+fieldname+"\",";
        json = json + "\"value\": \""+value+"\",";
        json = json + "\"value_type\": \""+value_type+"\"";
    json = json + "}";


    hubConnection.invoke("UpdateField", json)
    .then(datax => {})
}

function LoadUserList(){
    //console.log("Angular_loadUserList");
    gUser = localStorage.getItem("game_user");
    
    var jx = "{\"userid\" : \""+gUser+"\",\"remoteid\" : \""+gRemoteUser+"\"}";
    
    if(hubConnection.connectionState>0)
    {
        hubConnection.invoke("LoadUserList", jx)
        .then(data => {
            SuccessCallback(data);
        })
    }
}

function SuccessCallback(data){
    //console.log("SuccessCallback");
    var js = JSON.parse(data);

    if(last_list != JSON.stringify( js.data.gamers))
    {
        $("#user-list").html("");
        //console.log("SuccessCallback");

        $.each(js.data.gamers, function (i, obj)
        {
            if(obj.game_id !== gUser)
            {
                //console.log("GAMERS:", obj);
                var tddata = '<div id="btn-' + obj.game_id + '" class="select-group publish-play-btn block" onmouseover="javascript:HighlightOn(this.id)" onmouseout="javascript:HighlightOff(this.id)" onclick="javascript:RequestUser(\''+ obj.game_id + '\');"><div class="user-play">' + obj.game_id + '</div><div class="profile-pic-usr"><img id="usr_'+obj.game_id+'"  border="0" src="" alt="" height="100"/></div></div>';
                $("#user-list").append(tddata);
            }
            GetImage(obj.game_id, "#usr_"+obj.game_id, obj.image_type);
        });
    }
    last_list = JSON.stringify(js.data.gamers);

    filterGamers();

    if(norefresh)
    {
        //console.log("norefresh", $rootScope.categories);
        return;
    }

    $("#wait").hide();   
    buildHitZones(0);
    myVar = setInterval(myTimer, 5000);
    RefreshUserList();
}

function myTimer()
{
    //console.log("myTimer");
    if (!processing)
        console.log('Polling Stopped');
    else
        if(!pauseClock)
            getStatus();
}   

function RefreshUserList(){
    //console.log("RefreshUserList", "U:"+gUser, "I:"+isIssuer, "R:"+gRemoteUser);
    angRefresh = setInterval(userTimer, 10000);
}

function userTimer()
{
    //console.log("Polling list", "U:"+gUser, "I:"+isIssuer, "R:"+gRemoteUser);
    norefresh = true;
    LoadUserList();
}

function RequestUser(userid)
{
    gRemoteUser = userid;
    localStorage.setItem("remote_user", gRemoteUser);    

    if(hubConnection.connectionState>0)
    {
        hubConnection.invoke("AngularStart", gUser, userid)
        .then(datax => {
            var data = JSON.parse(datax);
            // you can access your data here
            //console.log("RequestUser:", data)
            btnRequest('REQ', userid);
        })        
    }
}

function SinkTheShip(){
    pauseClock = true;
    //var ship_list = current_status.requests[idx].ships.sort(function(a, b){return b.ship_part > a.ship_part;});
    var ship_list = current_status.requests[idx].ship_hits;
    //filter the ship from the fleet
    //console.log("SinkTheShip:");

    if(ship_list != undefined)
    {
        $.each(ship_list, function (i, obj) 
        {
            var nodeLocal = svg.selectAll(".sea."+ obj);
            var img = nodeLocal.attr("xlink:href");
            var img_sea = imgroot+"/bs_sea.png";
            nodeLocal.attr("xlink:href", img_sea);
        });
    }
}

function toggleSound(){
    if( $("#sound-img")[0].src.indexOf("sound_on") != -1)
    {
        $("#sound-img")[0].src = imgroot+"/sound_off.png";
        enable_sound = false;
    }
    else
    {
        $("#sound-img")[0].src = imgroot+"/sound_on.png";
        enable_sound = true;
    }
}

function ClearMonitorForNewGame(){
    //console.log("ClearMonitorForNewGame");
    UpdateField("ship_down_for", "@@@@", "string");
    UpdateField("winner", "@@@@", "string");   
    clearGameboard();     
    getStatus();        
    pauseClock = false;    
}

function ShowPlayAgainModal(){
    pauseClock = true;

    var modal = document.getElementById('playAgainModal');
    var modalFrm = document.getElementById('playAgainForm');
    
    modalFrm.onclick = function(event) {
        modal.style.display = "none";
        modalFrm.style.display = "none";
    }
    // When the user clicks anywhere outside of the modal, close it
    modal.onclick = function(event) {
        modal.style.display = "none";
    }

    modal.style.display = "block";    
    modalFrm.style.display = "block";    
}

function HighlightOn(item)
{
    var id = "#"+item;
    $(id).addClass("highlight");
}

function HighlightOff(item)
{
    var id = "#"+item;
    $(id).removeClass("highlight");
}

function filterGamers()
{
    //console.log("filterGamers");

    $(".select-group").each(function (i, objx)
    {
        var iddx = '#' + objx.id;
        var idd = objx.id.toUpperCase();
        var txt = document.getElementById("gamer-filter");
        var flt = txt.value.toUpperCase();
        //console.log(idd, txt.value.toUpperCase());
        
        if(idd.substring(4).indexOf(flt) === -1)
        {
            $(iddx).addClass("hide-user-name");
        }
        else
        {
            $(iddx).removeClass("hide-user-name");
        }
    });
}

function UploadAvatar(evt){
    //$('#file-input').trigger('click'); 
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => { 

       // getting a hold of the file reference
       var file = e.target.files[0]; 
       
       

       // setting up the reader
       var reader = new FileReader();
       reader.readAsArrayBuffer(file);


        //console.log(file.name);
       // here we tell the reader what to do when it's done reading...
       reader.onload = readerEvent => {
            var result, n, aByte, max_size;
            var page_array = [];
            var content = reader.result; // this is the content!
            //console.log("Blob length:", content.byteLength);
            var ix = new Uint8Array(content);
            max_size = ix.length;
            
            if (max_size > 1000000 )    //1M Images max
            {
                alert("Image to big. Must be >= 1K and <= 1M");
                return;
            }
            if (max_size < 1000 )    //10K Images max
            {
                alert("Image to small. Must be >= 1K and <= 1000K");
                return;
            }            

            var range = 1000;
            var q = max_size % range;
            var iX = max_size-q;
            var pages = iX /range;
            //console.log(q, iX, pages);

            var s, e;
            for(var page=0; page<pages; page++)
            {
                var qx = new Uint8Array(range);
                s = (page * range);
                e = s + range - 1;

                var x = 0;
                for(var i=s; i<=e; i++)
                {
                    qx[x] = ix[i];
                    x++;
                }

                SendData(page, qx, s, e, gUser, range, max_size, file.type, range);
            }

            if((e + q) > 0)
            {
                var qx = new Uint8Array(q);

                s = (e + 1);
                e = s + q;
                
                var x = 0;
                for(var i=s; i<=e; i++)
                {
                    qx[x] = ix[i];
                    x++;
                }

                SendData((pages + 1), qx, s, e, gUser, q, max_size, file.type, range);
            }
       }
    }    
    input.click();    
}

function SendData(page, arr, s, e, filename, size, max_size, type, range){
    if(hubConnection.connectionState>0)
    {
        hubConnection.invoke("Avatar", page, arr, s, e , filename, size, max_size, type, range)
        .then(datax => {
            //var data = JSON.stringify(datax);
            //console.log("Avatar:", data);
        })
    }    
}

function GetImageList(user, id)
{
    //console.log("GetImageList", images_data, user);
    var item = images_data.find(function(element) {
        return element.user === user;
    }); 

    if(item !== undefined  )
    {
        if($(id)[0] !== undefined)
        {
            $(id)[0].src = item.src;
        }           
        //console.log("GetImageList-ID", user, id, item.src);
    }
    //console.log("GetImageList", item, user);  
}

function GetImage(user, id, type)
{
    if(type === undefined)
        return;

    //console.log("GetImage", type);
    var img = "";

    if (type == "image/jpeg")
        img = domain+"/avatars/"+user+".jpg";
    if (type == "image/png")
        img = domain+"/avatars/"+user+".png";
    if (type == "image/bmp")
        img = domain+"/avatars/"+user+".bmp";
    if (type == "image/gif")
        img = domain+"/avatars/"+user+".gif";

    var json = { user : user, src : img };
    //console.log(json);
    images_data.push(json);

    if($(id)[0] !== undefined)
    {
        $(id)[0].src = img;
    }        
    
    /*
    if(hubConnection.connectionState>0)
    {
        hubConnection.invoke("RetrieveImage", file)
        .then(datax => {
            var img = "data:image/jpeg;base64," + datax;
            if($(id)[0] !== undefined)
            {
                $(id)[0].src = img;
            }
        })
    } 
    */
}
