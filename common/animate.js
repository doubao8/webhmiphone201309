function evalExpression(expression, valueMap) {
    var evalExp = expression;
    for(var variable in valueMap) {
        evalExp = evalExp.replace(new RegExp("\\$W:" + variable + "\\$", "g"), valueMap[variable] ? valueMap[variable]:20);
    }
    evalExp = evalExp.replace(/[^><]=/g, '$&=');
    evalExp = evalExp.replace(/and/g, '&& ');
    evalExp = evalExp.replace(/or/g, '|| ');
    evalExp = evalExp.replace(/<>/g, '!=');
    return eval(evalExp);
}

function parseVariblesFromExpression(expression) {
    var variables = {};
    var begin = -1;
    do {
        begin = expression.indexOf('$', begin+1);
        if (begin > -1) {
            begin = expression.indexOf(':', begin+1);
            var end = expression.indexOf('$', begin+1)
            var variable = expression.substring(begin+1, end);
            if (!(variable in variables)) {
                variables[variable] = true;
            }
            begin = end;
        }
    } while(begin > -1);
    var retValue = [];
    for(var a in variables) {
        retValue.push(a);
    }
    return retValue;
}
function colorBK(groupID, paramArray, expression, valueMap) {
    var specificFunc = function(group, color) {
        group.style.fill = color;
    }
    _colorBase(groupID, paramArray, expression, valueMap, specificFunc);
}

function colorLine(groupID, paramArray, expression, valueMap) {
    var specificFunc = function(group, color) {
        group.style.stroke = color;
    }
    _colorBase(groupID, paramArray, expression, valueMap, specificFunc);
}

function colorText(groupID, paramArray, expression, valueMap) {
    var specificFunc = function(group, color) {
        group.style.fill = color;
    }
    _colorBase(groupID, paramArray, expression, valueMap, specificFunc);
}

function _colorBase(groupID, paramArray, expression, valueMap, specificFunc) {
    var group = document.getElementById(groupID);
    /*1;3;(#ff0000,0,0);(#808080,0,1);(#c0c0c0,0,2);*/
    if (paramArray.length < 2) {
        return;
    }
    var variables = parseVariblesFromExpression(expression);
    if (variables.length != 1) {
        return;
    }
    var paramCount =  parseInt(paramArray[1]);
    var begin = 2;
    while (paramCount > 0) {
        var colorRule = paramArray[begin++]; //(#ff0000,0,0)
        colorRule = colorRule.substr(1, colorRule.length-2);
        var colorRuleArray = colorRule.split(",");
        var color = colorRuleArray[0];
        var type = parseInt(colorRuleArray[1]);
        var condition = parseInt(colorRuleArray[2]);
        var value = valueMap[variables[0]];
        if (!value) {
            return;
        }
        if ((type == 0 && value == condition)      //等于
            || (type == 1 && value < condition)    //小于
            || (type == 2 && value > condition)    //大于
            || (type == 3 && value <= condition)   //小于等于
            || (type == 4 && value >= condition)) {//大于等于
            specificFunc(group, color);
            break;
        }
        paramCount--;
    }
}


function verticalZoom(groupID, paramArray, expression, valueMap) {
    var group = document.getElementById(groupID);

    /*param: 1;0.000000;200.000000;0;0;100;22;0*/
    if (paramArray.length < 3) {
        return;
    }
    var variables = parseVariblesFromExpression(expression);
    if (variables.length != 1) {
        return;
    }
    var value = valueMap[variables[0]];
    if (!value) {
        return;
    }
    _setHeightAndY(group, paramArray, value);
}

function colorFill(groupID, paramArray, expression, valueMap) {
    var group = document.getElementById(groupID);

    /*param: 1;0.000000;165.000000;0;100;1;#00ff00*/
    if (paramArray.length < 7) {
        return;
    }
    var variables = parseVariblesFromExpression(expression);
    if (variables.length != 1) {
        return;
    }
    var value = valueMap[variables[0]];
    if (value == undefined) {
        return;
    }
    _setHeightAndY(group, paramArray, value);
    group.style.fill = paramArray[6];
}

function _setHeightAndY(group, paramArray, value) {
    var range = parseFloat(paramArray[2]);
    var initHeight = group.getAttribute("init-height");
    if (initHeight == undefined) {
        initHeight = group.getAttribute("height");
        group.setAttribute("init-height", initHeight);
    }
    var initY = group.getAttribute("init-y");
    if (initY == undefined) {
        initY = group.getAttribute("y");
        group.setAttribute("init-y", initY);
    }

    var newHeight = value*initHeight/range;
    var newY = (parseInt(initY) + parseInt(initHeight)) - parseInt(newHeight);
    group.setAttribute("height", newHeight);
    group.setAttribute("y", newY);
}

function _cleanAnimate(group, animateType) {
    var children = group.childNodes;
    for (var i = children.length; i > 0; i--) {
        var child = children[i-1];
        if (child) {
            var nodeName = child.nodeName;
            if (nodeName && nodeName == animateType) {
                group.removeChild(child);
            }
        }
    }
}

function _exitsAnimate(group, animateType) {
    var children = group.childNodes;
    for (var i = children.length; i > 0; i--) {
        var child = children[i-1];
        if (child) {
            var nodeName = child.nodeName;
            if (nodeName && nodeName == animateType) {
                return true;
            }
        }
    }
    return false;
}

function blink(groupID, paramArray, expression, valueMap) {
    var group = document.getElementById(groupID);

    var result = evalExpression(expression, valueMap);
    if (result) {
        if (!_exitsAnimate(group, "animate")) {
            var animation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animation.setAttributeNS(null, 'attributeName', 'fill-opacity');
            animation.setAttributeNS(null, 'repeatCount', 'indefinite');
            animation.setAttributeNS(null, 'calcMode', 'discrete');
            animation.setAttributeNS(null, 'to', 0);
            animation.setAttributeNS(null, 'dur', 0.5);
            group.appendChild(animation);
            animation.beginElement();
        }
    } else {
        _cleanAnimate(group, "animate");
    }
}

function showHide(groupID, paramArray, expression, valueMap) {
    var group = document.getElementById(groupID);

    if (paramArray.length < 1) {
        return;
    }

    var show = parseInt(paramArray[0]) == 1 ? true : false;
    var result = evalExpression(expression, valueMap);
    if (show == result) {
        group.removeAttribute("display");
    } else {
        group.setAttribute("display", "none");
    }
}

function selfRotate(groupID, paramArray, expression, valueMap) {
    var group = document.getElementById(groupID);

    var result = evalExpression(expression, valueMap);
    if (result) {
        if (!_exitsAnimate(group, "animateTransform")) {
            var animation = document.createElementNS('http://www.w3.org/2000/svg', "animateTransform");
            var bb = group.getBBox();
            var cx = bb.x + bb.width/2;
            var cy = bb.y + bb.height/2;
            animation.setAttributeNS(null, "attributeName", "transform");
            animation.setAttributeNS(null, "attributeType", "XML");
            animation.setAttributeNS(null, "type", "rotate");
            animation.setAttributeNS(null, "dur", "2s");
            animation.setAttributeNS(null, "repeatCount", "indefinite");
            animation.setAttributeNS(null, "from", "0 "+cx+" "+cy);
            animation.setAttributeNS(null, "to", 360+" "+cx+" "+cy);
            group.appendChild(animation);
            animation.beginElement();
        }
    } else {
        _cleanAnimate(group, "animateTransform");
    }
}
