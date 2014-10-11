/**
 * Created with JetBrains WebStorm.
 * User:huangdebao
 * Date: 13-7-26
 * Time: 上午9:08
 * 对获取到的SVG文件进行基本操作，包括获取节点、属性等
 */

//创建与SVG文件中hollysys:var节点对应的内存节点
function createVarNode(name,content,link,pid,type,forGraphId){
    var varNode={
        varName : name,   //变量点名称
        varContent : content,  //变量点内容
        varLink : link,         //变量点在内存中点名
        varPid : pid,
        varType : type,
        forGrahpId : forGraphId     //关联的图形Id
    };
    return varNode;
}
//创建与SVG文件中hollysys:interactNode节点对应的内存节点
function createInteractNode(name,forGraphId,param,script){
    var interactNode = {
        name : name,
        forGraphId :forGraphId,
        param : param,
        script:script
    };
    return interactNode;
}

//创建与SVG文件中hollysys:animate动态特性节点对应的内存节点
function createAnimateNode(name,forGraphId,expression,param,map){
    var animateNode = {
        name : name,
        forGraphId : forGraphId,
        expression : expression,      
        param : param,
        pointNameMap:map        //窗口变量与点值对应表
    }
    return animateNode;
}

var hollysys = "http://www.hollysys.com/namespaces/hollysys"; //命名空间
var allVarAndPoint=new Array();  //所有变量点
function getAllVarAndPoint(){
    return  allVarAndPoint;
}
//将SVG文件中的所有变量点导入内存
function createAllVarAndPoint(){
    var allNode = document.getElementsByTagNameNS(hollysys,"var");
    var name,content,link,pid,type,forGraphId;
    for(var i= 0;i<allNode.length; i++){
        name =  allNode[i].getAttributeNS(hollysys,"varName");
        content =  allNode[i].getAttributeNS(hollysys,"varContent");
        link =  allNode[i].getAttributeNS(hollysys,"varLink");
        pid =  allNode[i].getAttributeNS(hollysys,"varPid");
        type =  allNode[i].getAttributeNS(hollysys,"varType");
        forGraphId =  allNode[i].getAttributeNS(hollysys,"forGraphId");
        allVarAndPoint.push(createVarNode(name,content,link,pid,type,forGraphId));
    }
}

var allInteract=new Array();  //所有交互点
function getAllInteract(){
    return  allInteract;
}
//将SVG文件中的所有交互点导入内存
function createAllInteract(){
    var allNode = document.getElementsByTagNameNS(hollysys,"interact");
    var name,forGraphId,param,script;
    for(var i= 0;i<allNode.length; i++){
        name =  allNode[i].getAttributeNS(hollysys,"name");
        forGraphId =  allNode[i].getAttributeNS(hollysys,"forGraphId");
        param =  allNode[i].getElementsByTagNameNS(hollysys,"param")[0];
        if(param !=null){
            param = param.textContent.split(";");
        }
        script =  allNode[i].getElementsByTagNameNS(hollysys,"script");
        allInteract.push(createInteractNode(name,forGraphId,param,script));
    }
}

var allAnimate=new Array(); //所有动画点
function getAllAnimate(){
    return  allAnimate;
}
//将SVG文件中的所有动态特性点导入内存
function createAllAnimate(){
    var allNode = document.getElementsByTagNameNS(hollysys,"animate");
    var name,forGraphId,expression,param,pointNameMap;
    for(var i= 0;i<allNode.length; i++){
        name =  allNode[i].getAttributeNS(hollysys,"name");
        forGraphId =  allNode[i].getAttributeNS(hollysys,"forGraphId");
        param =  allNode[i].getElementsByTagNameNS(hollysys,"param")[0];
        if(param !=null){
            param = param.textContent.split(";");
        }
        expression=allNode[i].getElementsByTagNameNS(hollysys,"expression")[0].textContent;
        pointNameMap=getVarNameInExpression(expression);  //从表达式中获取点名
        //expression=expression.replace(/\$W:/g,"").replace(/\$/g,"");
        allAnimate.push(createAnimateNode(name,forGraphId,expression,param,pointNameMap));
    }
}

//从SVG文件的动态特性点表达式中获取点名
 function getVarNameInExpression(expression){
     var varMap={};
     var start,end,compareString="";
     start=expression.indexOf("$W:");
      while(start !=-1){
          start=start+3;
          expression=expression.substr(start);
          end=expression.indexOf("$");
          var result=expression.substring(0,end);
          if(compareString.indexOf(result)==-1) {    //排除重名变量
              varMap[result]="";
              compareString=compareString+result+";" ;
          }
          expression=expression.substr(end+1);
          start=expression.indexOf("$W:");
      }
     return varMap;
 }
//将动态特性点中的窗口变量与内存点值相关联
function createPointValueMap(){
    for(var i=0; i<allVarAndPoint.length; i++) {
        var forGraphId =allVarAndPoint[i].forGrahpId;     //找到变量值对应的图上组件
        var varLink = allVarAndPoint[i].varLink;   //对应内存中存储的点值
        var varName= allVarAndPoint[i].varName;      //变量点名
        if(forGraphId==="") {       //如果forGraphId为空，证明变量名（varName)与内存点值（varLink)一一对应
            for(var j=0; j<allAnimate.length; j++) {
                if(allAnimate[j].pointNameMap[varName]==undefined){     //在动态特性点中找到点名一致的点
                    continue;
                }
                if(varLink=="(null)") {  //没有绑定到内存点，需要手动设置
                    allAnimate[j].pointNameMap[varName]=varName;
                    continue;
                }
                allAnimate[j].pointNameMap[varName]=varLink;
            }
        }else{   //此内存点值（varLink)与forGraphId或其下某一子节点绑定
            var idArray=[];       //
            traverseNode(forGraphId,idArray); //遍历forGraphId节点下所有子节点，将节点ID存储到idArray中返回
            for(var j=0; j<allAnimate.length; j++) {
                if(allAnimate[j].pointNameMap[varName]==undefined){     //在动态特性点中找到点名一致的点
                    continue;
                }
                for(var k=0; k<idArray.length; k++){       //在组件中找对应的节点
                    var id = idArray[k];
                    if(allAnimate[j].forGraphId==id){         //节点元素ID与内存值对应
                        allAnimate[j].pointNameMap[varName]=varLink;
                    }
                }
            }
        }
    }
}

//遍历节点ID为nodeId下的所有子节点，将节点ID存储在数组idArray中
function traverseNode(nodeId,idArray){
    idArray.push(nodeId);
    var tempNode=document.getElementById(nodeId);
    if(tempNode==null || tempNode.childNodes==null){
        return;
    }
    var childNodes=tempNode.childNodes;
    for(var i=0; i<childNodes.length; i++){       //在组件中找对应的节点
        var id = childNodes[i].id;
        if(id==null) {
            continue;
        }
        traverseNode(id,idArray);
    }
}

//初始化获取SVG图上所有变量点
function initSVG(){
    createAllAnimate();
    createAllInteract();
    createAllVarAndPoint();
    createPointValueMap();
}

//初始化数据
function initValue(valueMap){
    for(var i=0; i<allVarAndPoint.length; i++){
        if(allVarAndPoint[i].varLink !=null) {
            var num=(Math.random()*30).toFixed(2);
            valueMap[allVarAndPoint[i].varLink]=num;
        }
    }
}

//实时更新数据
function imaitateUpdate(valueMap,textFunc){
    for(var i=0; i<allAnimate.length; i++) {
        var value={};
        var pointName= allAnimate[i].pointNameMap;
        for(var varName in pointName) {
            value[varName]=valueMap[pointName[varName]];
        }
        switch (allAnimate[i].name){
            case "Text":
                if(textFunc!=null){
                    textFunc(value,allAnimate[i],allAnimate[i+1]);
                }else{
                    document.getElementById(allAnimate[i].forGraphId).textContent=value[varName];
                }
                break;
            case "Color-BK":
                colorBK(allAnimate[i].forGraphId, allAnimate[i].param, allAnimate[i].expression,value);
                break;
            case  "VerticalZoom":
                verticalZoom(allAnimate[i].forGraphId, allAnimate[i].param, allAnimate[i].expression,value);
                break;
            case  "Blink":
                blink(allAnimate[i].forGraphId, allAnimate[i].param, allAnimate[i].expression,value);
                break;
            case  "Color-Fill":
                colorFill(allAnimate[i].forGraphId, allAnimate[i].param, allAnimate[i].expression,value);
                break;
            case  "ShowHide":
                showHide(allAnimate[i].forGraphId, allAnimate[i].param, allAnimate[i].expression,value);
                break;
            case  "SelfRotate":
                selfRotate(allAnimate[i].forGraphId, allAnimate[i].param, allAnimate[i].expression,value);
                break;
            case  "Color-Text":
                colorText(allAnimate[i].forGraphId, allAnimate[i].param, allAnimate[i].expression,value);
                break;
            case  "Color-Line":
                colorLine(allAnimate[i].forGraphId, allAnimate[i].param, allAnimate[i].expression,value);
                break;
            default :
                break;
        }
 }
}
