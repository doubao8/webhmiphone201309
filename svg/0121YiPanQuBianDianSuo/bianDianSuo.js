/**
 * Created with JetBrains WebStorm.
 * User: huangdebao
 * Date: 13-8-13
 * Time: 下午1:40
 * To change this template use File | Settings | File Templates.
 */
//初始化变电所数据值   ---针对变电所定制
var valueMap={};
var initValueMap={};//保存电流、电压的初始值，更新电流时，在此值的+5以内变化
var allVarAndPoint;
function initValueBDS(valueMap){
    allVarAndPoint=getAllVarAndPoint();
    for(var i=0; i<allVarAndPoint.length; i++){
        var link = allVarAndPoint[i].varLink;
        var num;
        if(link !=null && link !="(null)") {
            if(link.indexOf("1101:GYKG")!=-1 && link.indexOf("AIWZ")!=-1){
                var rand=[0,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2];
                var index=(Math.random()*19).toFixed(0);
                num=rand[index].toString();
            }else if(link.indexOf("AIIA")!=-1){
                num=(Math.random()*47).toFixed(2);
                initValueMap[link]=num;
            }else if(link.indexOf("AIUA")!=-1){
                num=((Math.random()*300+6000)/1000).toFixed(2);
                initValueMap[link]=num;
            }else{
                num="";
            }
            valueMap[link]=num;
        }
    }
}

//更新变电所文本值，使值在小范围内变动 ---针对变电所定制
function updateValueBDS1(valueMap){
    var newValue;
    for(var varName in valueMap){
        if(valueMap[varName]=="0" || valueMap[varName]=="1" || valueMap[varName]=="2"){
            continue;
        }
        if(varName.indexOf("AIUA")!=-1){
            newValue=Math.random()*0.15+parseFloat(initValueMap[varName]);
            if(newValue>6.3){
                newValue=newValue-0.151;
            }
            newValue=newValue.toFixed(2);
        }else if(varName.indexOf("AIIA")!=-1){
            newValue=(Math.random()*3+parseFloat(initValueMap[varName])).toFixed(2)
        }else{
            continue;
        }
        valueMap[varName]=newValue;
    }
    for(var varName in valueMap){
        if(varName.indexOf("AIYP")!=-1){
            var AIIA=varName.replace(/AIYP/,"AIIA");
            var AIUA=varName.replace(/AIYP/,"AIUA");
            newValue=(1.73*0.9*parseFloat(valueMap[AIIA])*parseFloat(valueMap[AIUA])).toFixed(2);
        }else if(varName.indexOf("AIWP")!=-1){
            var AIIA=varName.replace(/AIWP/,"AIIA");
            var AIUA=varName.replace(/AIWP/,"AIUA");
            newValue=(1.73*0.3*parseFloat(valueMap[AIIA])*parseFloat(valueMap[AIUA])).toFixed(2);
        }else{
            continue;
        }
        valueMap[varName]=newValue;
    }
}
//更新变电所开关值值  ---针对变电所定制
function updateValueBDS2(valueMap){
    for(var varName in valueMap){
        if(valueMap[varName]=="0" || valueMap[varName]=="1" || valueMap[varName]=="2"){
            var rand=[0,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2];
            var index=(Math.random()*19).toFixed(0);
            num=rand[index].toString();
            valueMap[varName]=num;
        }
    }
}

function textFunc(value,animate,animateNext){
    var pointName= animate.pointNameMap;
    for(var varName in pointName){
        if(valueMap[animateNext.pointNameMap["intAIWZ"]]==2){
            document.getElementById(animate.forGraphId).textContent=value[varName];
        }else{
            document.getElementById(animate.forGraphId).textContent="0.00";
        }
    }
}
window.onload=function(){
    initSVG();
    initValueBDS(valueMap);
    setInterval(function(){
        updateValueBDS1(valueMap);
    },2000);
    setInterval(function(){
        updateValueBDS2(valueMap);
    },60000);
    setInterval(function(){
        imaitateUpdate(valueMap,textFunc);
    },2000);
}
