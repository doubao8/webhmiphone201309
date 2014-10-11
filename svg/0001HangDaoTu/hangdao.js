
//模拟图上元素变量值
var valueMap={"1113:AJCG20004.AICL.value":5,"1113:AJCG21002.AICL.value":2,"1113:AJCG20001.AICL.value":4,
    "1113:AJCG20002.AICL.value":1,"1113:AJCG20003.AICL.value":4,"1113:AJCG20803.AICL.value":4,
    "1113:AJCG20801.AICL.value":2,"1113:AJCG20806.AICL.value":5,"1113:AJCG20802.AICL.value":4};

var tempSSValue={"1113:AJCG20004.AISZ.value":4,"1113:AJCG21002.AISZ.value":0.5,"1113:AJCG20001.AISZ.value":24,
    "1113:AJCG20002.AISZ.value":0.1, "1113:AJCG20003.AISZ.value":24,"1113:AJCG20803.AISZ.value":24,
    "1113:AJCG20801.AISZ.value":0.5, "1113:AJCG20806.AISZ.value":4,"1113:AJCG20802.AISZ.value":24};

var tempGZMValue={"1113:AJCG20004.AICZ.value":1,"1113:AJCG21002.AICZ.value":1,"1113:AJCG20001.AICZ.value":1,
    "1113:AJCG20002.AICZ.value":1, "1113:AJCG20003.AICZ.value":1,"1113:AJCG20803.AICZ.value":1,
    "1113:AJCG20801.AICZ.value":1, "1113:AJCG20806.AICZ.value":1,"1113:AJCG20802.AICZ.value":1};

function initValueHang(){
    for(var value in tempSSValue){
        valueMap[value]=(Math.random()*tempSSValue[value]/3+tempSSValue[value]/2).toFixed(2);
    }
    valueMap["1113:AJCG20004.AISZ.value"] =(tempSSValue["1113:AJCG20004.AISZ.value"]*Math.random()+18).toFixed(2);
    valueMap["1113:AJCG20806.AISZ.value"] =(tempSSValue["1113:AJCG20806.AISZ.value"]*Math.random()+18).toFixed(2);
}
function updateGAMValue(){
    for(var value in tempGZMValue){
        var rand=[1,1,1,1,1,1,2,1,1,1,1,1,3,1,1,1,1,1,1,1];
        var index=(Math.random()*19).toFixed(0);
        valueMap[value]=rand[index];
    }
}

function textFunc(value,animate,animateNext){
    var pointName= animate.pointNameMap;
    for(var varName in pointName){
        var name=pointName[varName].replace(/AISZ/,"AICZ");
        if(valueMap[name]==2){
            document.getElementById(animate.forGraphId).textContent="";
        }else{
            document.getElementById(animate.forGraphId).textContent=value[varName];
        }
    }
}
window.onload=function(){
    initSVG();
    initValueHang();
    updateGAMValue();
    setInterval(function(){
        initValueHang();
    },2000);
    setInterval(function(){
        updateGAMValue();
    },10000);
    setInterval(function(){
        imaitateUpdate(valueMap,textFunc);
    },2000);
}

//下面是按钮功能
function rydwgj(buttonID) {
    var button = document.getElementById(buttonID);
    if (!button) {
        return;
    }
    var display = "#00ff00";
    var hide = "#ff0000";
    if (hide == button.style.fill) {
        return;
    } else {
        button.style.fill = hide;
    }
    var x = [95000.00];
    var y = [14500.00];
    for (var i = 0; i <= 135; i++) {
        x[i + 1] = x[i] - 312.5;
        y[i + 1] = y[i] + 208.5;
    }
    for (var i = 136; i <= 247; i++) {
        x[i + 1] = x[i] - 312.5;
        y[i + 1] = y[i] - 130;
    }

    var image = document.getElementById("Image0001_ElId_43");
    var name = document.getElementById("Text0010_ElId_44");
    var index = 0;
    function move() {
        if (index < 248) {
            var currentX = x[index]/100.00;
            var currentY = y[index]/100.00;
            image.setAttribute("x", currentX);
            image.setAttribute("y", currentY);
            name.setAttribute("x", (currentX-5));
            name.setAttribute("y", (currentY-2));
            index++;
            setTimeout(move, 300);
        } else {
            button.style.fill = display;
        }
    }
    move();
}

function toggle_layer(buttonID, layerID) {
    var button = document.getElementById(buttonID);
    if (!button) {
        return;
    }
    var layer = document.getElementById(layerID);
    if (!layer) {
        return;
    }
    var display = "#00ff00";
    var hide = "#ff0000";
    if (display == button.style.fill) {
        button.style.fill = hide;
        layer.style.display = "none";
    } else if (hide == button.style.fill) {
        button.style.fill = display;
        layer.style.display = "";
    }
}