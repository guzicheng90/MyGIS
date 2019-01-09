function WebGIS() {
    var webMap;
    var webTiledLayer;
    var webDyLayer;
    var _tiledUrl;
    var _dylayerUrl;
    var _mapDivID;

    var _mapLoadHandler = null;

    //地址定位相关
    var _locateSymbolsArray;
    var _locateSymbolsHoverArray;
    var _tempLocateArray;

    //导航控件相关
    var _navTool;
    //一般查询显示图层
    var addressLocateLayer;
    var addressLocateOverLayer;
    var showGraphicsLayer;

    //图层维护操作
    var layerdatashowLayer;
    var layerdataeditLayer;

    //画图相关
    var drawToolBar;
    var editToolBar;

    //默认样式
    var defaultsms;//点
    var defaultsls;//线
    var defaultsfs;//面
    var $that = this;

    //遥感图层
    var sfTiledLayerYG;

    var defaultOpenLayer = ['街道乡镇', '街道乡镇色块'];
    WebGIS.prototype.doIniLoad = function () { 
        dojo.require("esri.map"); 
        dojo.require("esri.renderers.UniqueValueRenderer");
        dojo.require("esri.renderers.ScaleDependentRenderer");
        dojo.require("esri.symbols.TextSymbol"); 
        dojo.require("esri.symbols.Font");
        dojo.require("esri.dijit.HomeButton");
        dojo.require("esri.geometry.Polygon");
        dojo.require("esri.tasks.BufferParameters");
        dojo.require("esri.layers.agstiled");
        dojo.require("esri.layers.agsdynamic");
        dojo.require("esri.tasks.query");
        dojo.require("esri.layers.graphics");
        dojo.require("esri.graphic");
        dojo.require("esri.Color");
        dojo.require("esri.toolbars.draw");
        dojo.require("esri.toolbars.edit");
        dojo.require("esri.toolbars.navigation");
        dojo.require("esri.InfoTemplate");
        dojo.require("esri.dijit.InfoWindowLite");
        dojo.require("esri.dijit.InfoWindow"); 
        dojo.require("esri.renderers.ScaleDependentRenderer"); 
        dojo.require("esri.tasks.LengthsParameters");
        dojo.require("esri.tasks.AreasAndLengthsParameters");
        dojo.require("dojo.on");
        dojo.require("dojo._base.Deferred"); 
        _tiledUrl = arguments[0];
        _dylayerUrl = arguments[1];
        _mapDivID = arguments[2];
        if (arguments.length == 4) {
            _mapLoadHandler = arguments[3];
        }
        _locateSymbolsArray = new Array();
        _locateSymbolsHoverArray = new Array();

        dojo.addOnLoad(webInit);
        
        addRemote(_mapDivID)
    };
    //c初始化方法
    function webInit() {
        var options = { logo: false, slider: true };
        webMap = new esri.Map(_mapDivID, options);
        if (_tiledUrl != null && _tiledUrl != "") {
        	webTiledLayer = new esri.layers.ArcGISTiledMapServiceLayer(_tiledUrl);
            webMap.addLayer(webTiledLayer);
            
        }

        
        //加载遥感
        sfTiledLayerYG = new esri.layers.ArcGISTiledMapServiceLayer(CityGIS.LayerSettings.arcgisYGUrl);
        webMap.addLayer(sfTiledLayerYG);
        sfTiledLayerYG.hide();


        if (_dylayerUrl != "") {
            webDyLayer = new esri.layers.ArcGISDynamicMapServiceLayer(_dylayerUrl, { opacity: 0.8 });
            webMap.addLayer(webDyLayer);
        	
            //dojo.connect(webDyLayer, "onLoad", webDyLayerLoad);
        }
        //定位相关图层
        addressLocateLayer = new esri.layers.GraphicsLayer();
        webMap.addLayer(addressLocateLayer);


        addressLocateOverLayer = new esri.layers.GraphicsLayer();
        webMap.addLayer(addressLocateOverLayer);

        dojo.connect(addressLocateLayer, "onMouseOver", addressLocateOverLayerGraphicMouseOver);
        dojo.connect(addressLocateLayer, "onMouseOut", addressLocateOverLayerMouseOut);


        showGraphicsLayer = new esri.layers.GraphicsLayer();
        webMap.addLayer(showGraphicsLayer);
        //图层维护相关图层
        layerdatashowLayer = new esri.layers.GraphicsLayer();
        webMap.addLayer(layerdatashowLayer);

        layerdataeditLayer = new esri.layers.GraphicsLayer();
        webMap.addLayer(layerdataeditLayer);

        //监听地图加载情况
        if (_mapLoadHandler != null) {
        	//webMap.on("load", eval(_mapLoadHandler));
            if (_dylayerUrl != "") {
                if (webDyLayer.loaded == true)
                {
                    eval(_mapLoadHandler);
                }
                else
                {
                    dojo.connect(webDyLayer, "onLoad", _mapLoadHandler);
                }
            }
            else {
                dojo.connect(webMap, "onLoad", _mapLoadHandler);
            }
        }
        else {
            dojo.connect(webMap, "onLoad", mymapLoadHandler);
        }

        for (var i = 0; i < 10; i++) {
            var locatesymbol = new esri.symbol.PictureMarkerSymbol(globalWebPath+"assets/imgs/locate/" + (i + 1).toString() + ".png", 20, 25);
            var locateHoverSymbol = new esri.symbol.PictureMarkerSymbol(globalWebPath + "assets/imgs/locate/" + (i + 1).toString() + "_over.png", 20, 25);
            _locateSymbolsArray[i] = locatesymbol;
            _locateSymbolsHoverArray[i] = locateHoverSymbol;
        }

        //设置样式
        defaultsms = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10,
            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
            new esri.Color([255, 0, 0]), 1),
            new esri.Color([0, 255, 0, 0.25]));

        defaultsls = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([0, 255, 0]), 2);

        defaultsfs = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT,
            new esri.Color([255, 0, 0]), 2), new esri.Color([255, 255, 0, 0.25])); 
    	//autoRecenter(webMap);
        
    };

    function addressLocateOverLayerGraphicMouseOver(evt) {
        var graphic = evt.graphic;
        var graphicAttri = graphic.attributes;
        var showTipStr = "" + graphicAttri["PoiName"] + "&nbsp" + graphicAttri["PoiAddress"];
        var screenPoint = evt.screenPoint;
        doShowToolTips(showTipStr, screenPoint);
    };

    function autoRecenter(map) {
        var resizeDelay = 650;
        dojo.on(map, 'load', function (map) {
            dojo.on(window, 'resize', map, map.resize);
        });
        dojo.on(map, 'resize', function (extent, width, height) {
            map.__resizeCenter = map.extent.getCenter();
            //setTimeout(function () {
            //    if (_useAutoCenter) {
            //        map.centerAt(map.__resizeCenter);
            //    }
            //}, resizeDelay);
        });
    }
    //显示tooltip
    WebGIS.prototype.doShowLayerToolTips = function (tipstr, locateScreenPt) {
        doShowToolTips(tipstr, locateScreenPt);
    };

    WebGIS.prototype.doHideLayerToolTips = function () {
        $(".myToolTip").hide();
    };

    function addressLocateOverLayerMouseOut(evt) {
        $(".myToolTip").hide();
    };

    function doShowToolTips(tiostr, locatept) {
        $(".myToolTip").find("#div_toolcontent").html(tiostr);
        $(".myToolTip").css("top", locatept.y);
        $(".myToolTip").css("left", locatept.x);
        $(".myToolTip").show();
    };


    function mymapLoadHandler() {
        _navTool = new esri.toolbars.Navigation(webMap);
        dojo.connect(_navTool, "onExtentHistoryChange", extentHistoryChangeHandler);

        drawToolBar = new esri.toolbars.Draw(webMap, {
            tooltipOffset: 20,
            drawTime: 90
        });

        editToolBar = new esri.toolbars.Edit(webMap, {
            allowAddVertices: true,
            allowDeleteVertices: true
        });
        dojo.connect(layerdataeditLayer, "onClick", editlayerClickHandler);
    };

    WebGIS.prototype.doIniLoaded = function () {
        _navTool = new esri.toolbars.Navigation(webMap);
        dojo.connect(_navTool, "onExtentHistoryChange", extentHistoryChangeHandler);

        drawToolBar = new esri.toolbars.Draw(webMap, {
            tooltipOffset: 20,
            drawTime: 90
        });

        editToolBar = new esri.toolbars.Edit(webMap, {
            allowAddVertices: true,
            allowDeleteVertices: true
        });

        dojo.connect(layerdataeditLayer, "onClick", editlayerClickHandler);
    };

    //放大显示至某点
    //参数为 x  x坐标
    //y y坐标
    WebGIS.prototype.doZoomPoint = function (xvalue, yvalue) {
        var coordx = parseFloat(xvalue);
        var coordy = parseFloat(yvalue);
        var extent = new esri.geometry.Extent(coordx - 100, coordy - 100, coordx + 100, coordy + 100, webMap.spatialReference);
        webMap.setExtent(extent);
    };



    WebGIS.prototype.doZoomPointDIY = function (xvalue, yvalue, len) {
        var coordx = parseFloat(xvalue);
        var coordy = parseFloat(yvalue);
        var extent = new esri.geometry.Extent(coordx - len, coordy - len, coordx + len, coordy + len, webMap.spatialReference);
        webMap.setExtent(extent);
    };

    WebGIS.prototype.doShowAllCBD = function (cbdArray) {
        showGraphicsLayer.clear();

        var infoTemplate = new esri.InfoTemplate("${RESERVE_NAME}", "储备地址: ${RESERVE_ADDRESS}" +
           " <br/>所属街镇: ${STREETNAME}" +
            " <br/> 所属单位: ${SSDW}" +
            " <br/>联系人: ${LXR}" +
            " <br/>联系电话: ${LXDH}" +
            " <br/>手机号码: ${SJHM}" +
            "<br/>");
        showGraphicsLayer.setInfoTemplate(infoTemplate);
        var picSms = new esri.symbol.PictureMarkerSymbol("../assets/imgs/wz/Locate.png", 15, 15);
        if (cbdArray.length > 0) {
            for (var i = 0; i < cbdArray.length; i++) {
                var pt = new esri.geometry.Point(parseFloat(cbdArray[i]["COORDX"]), parseFloat(cbdArray[i]["COORDY"]));
                var cbdGraphic = new esri.Graphic(pt, picSms, cbdArray[i]);
                showGraphicsLayer.add(cbdGraphic);
            }
        }
    };


    //添加graphicslayer
    //参数说明:layerid 为图层唯一标识,一个页面调用时不能重复
    //第二个参数为图层点击触发事件
    WebGIS.prototype.doAddGraphicsLayer = function () {
        var layerid = arguments[0];
        var glayer = new esri.layers.GraphicsLayer({ id: layerid });
        webMap.addLayer(glayer);
        if (arguments.length == 2) {
            var layerclick = arguments[1];
            dojo.connect(glayer, "onClick", layerclick);
        }
        if (arguments.length == 4) {
            var layerclick = arguments[1];
            dojo.connect(glayer, "onClick", layerclick);
            var $layerOverFuc = arguments[2];
            var $layerOutFuc = arguments[3];
            dojo.connect(glayer, "onMouseOver", $glayerOverFuc);
            dojo.connect(glayer, "onMouseOut", $glayerOutFuc);
        }
        if (arguments.length == 3) {
            var $layerOverFuc = arguments[1];
            var $layerOutFuc = arguments[2];
            dojo.connect(glayer, "onMouseOver", $glayerOverFuc);
            dojo.connect(glayer, "onMouseOut", $glayerOutFuc);
        }

    };

    //清空指定的graphicslayer
    //参数说明:layerid 为图层唯一标识
    WebGIS.prototype.doClearGraphicsLayer = function (layerid) {
        var glayer = webMap.getLayer(layerid);
        glayer.clear();
    };

    //根据ID获取图层
    WebGIS.prototype.doGetGraphicsLayer = function (layerid) {
        var glayer = webMap.getLayer(layerid);
        return glayer;
    };
    //添加单个graphic进图层
    WebGIS.prototype.doGraphic2Layer = function (layerid, graphic, symbol) {
        var glayer = webMap.getLayer(layerid);
        graphic.setSymbol(symbol);
        glayer.add(graphic);
        return glayer;
    };

    //定位至图层某个graphic
    WebGIS.prototype.doLocatePointGraphicInLayer = function (layerid, field, fieldvalue, extentWidth) {
        var glayer = webMap.getLayer(layerid);
        var graphicArray = glayer.graphics;
        if (graphicArray.length > 0) {
            var currentgraphic = null;
            for (var i = 0; i < graphicArray.length; i++) {
                if (graphicArray[i].attributes[field] == fieldvalue) {
                    currentgraphic = graphicArray[i];
                    break;
                }
            }
            if (currentgraphic != null) {
                var geopt = currentgraphic.geometry;
                var extent = new esri.geometry.Extent(geopt.x - extentWidth, geopt.y - extentWidth, geopt.x + extentWidth, geopt.y + extentWidth, webMap.spatialReference);
                webMap.setExtent(extent);
            }
            return currentgraphic;
        }
        else {
            return null;
        }
    }


    //查询街镇信息
    //X、Y、回调函数,callfunc回调函数传回(status,streetcode,streetname)
    var $streetCallFunc;
    WebGIS.prototype.doQueryStreetInfo = function (x, y, callfunc) {
        $streetCallFunc = callfunc;
        $.ajax({
            type: "Post",
            url: "../ajaxHandler/yjzy/yjzyAjax.ashx",
            data: { PostMethod: 'getStreetInfo', RouterPage: 'webgis', COORDX: x, COORDY: y },
            success: function (res) {
                var streetInfo = JSON.parse(res);
                if (streetInfo.state == "True") {
                    $streetCallFunc(streetInfo.state, streetInfo.streetcode, streetInfo.streetname, streetInfo.communitycode, streetInfo.communityname);
                }
                else {
                    $streetCallFunc("false", "-1", "未在区内", "-1", "未在区内");
                }
            },
            error: function (xmlReq, err, c) {
                console.log("地址解析错误！");
            }
        });

        //var layerid = this.doGetLayerIDByName("街道乡镇");
        //var layerUrl = _dylayerUrl + "/" + layerid.toString();
        //$streetCallFunc = callfunc;
        //var queryTask = new esri.tasks.QueryTask(layerUrl);

        //var query = new esri.tasks.Query();
        //query.where = "1=1";
        //query.outSpatialReference = webMap.spatialReference;
        //query.returnGeometry = true;
        //query.outFields = ["*"];
        //query.geometry = new esri.geometry.Point(x, y, webMap.spatialReference);

        //queryTask.execute(query, function (resultSet) {
        //    if (resultSet.features.length > 0) {
        //        var graphic = resultSet.features[0];
        //        var status = "true";
        //        var streetcode = graphic.attributes["街道代码"];
        //        var streetname = graphic.attributes["街道名称"];
        //        $streetCallFunc(status, streetcode, streetname);
        //    }
        //    else {
        //        $streetCallFunc("false", "-1", "未在区内");
        //    }
        //}, function (resultError) {
        //    $streetCallFunc("false", "-1", "未在区内");
        //});


        //callfunc("true", "1210", "华漕镇");
    };


    //根据某个字段值显示出不同的点状数据
    //参数说明:layerid  图层ID名
    //layersymbol 图层样式
    //uniquefield 值字段名
    //uniqueRenders 根据字段显示样式集合
    //xfield  X字段
    //yfield  Y字段
    //layertemplate 显示info窗模版 可为空
    WebGIS.prototype.doShowPointsDataUniqueRenderer = function () {
        var layerid = arguments[0];
        var layerdata = arguments[1];
        var uniquefield = arguments[2];
        var uniqueRenders = arguments[3];
        var xfield = arguments[4];
        var yfield = arguments[5];
        var layertemplate = arguments[6];



        var glayer = webMap.getLayer(layerid);
        glayer.clear();

        if (layerdata.length > 0) {
            for (var i = 0; i < layerdata.length; i++) {
                var geopt = new esri.geometry.Point(parseFloat(layerdata[i][xfield]), parseFloat(layerdata[i][yfield]), webMap.spatialReference);
                var tempsymbol = defaultsms;
                for (var j = 0; j < uniqueRenders.length; j++) {
                    if (layerdata[i][uniquefield] == uniqueRenders[j]["VALUE"]) {
                        tempsymbol = uniqueRenders[j]["SYMBOL"];
                        break;
                    }
                }
                var graphic = new esri.Graphic(geopt, tempsymbol, layerdata[i]);
                glayer.add(graphic);
            }

            if (layertemplate != "") {
                var infoTemplate = new esri.InfoTemplate("信息显示", layertemplate);
                glayer.setInfoTemplate(infoTemplate);
            }
        }

        if (arguments.length > 7) {
            $glayerOverFuc = arguments[7];
            $glayerOutFuc = arguments[8];

            dojo.connect(glayer, "onMouseOver", $glayerOverFuc);
            dojo.connect(glayer, "onMouseOut", $glayerOutFuc);
        }
    };


    WebGIS.prototype.doShowPointsDataScaleRenderer = function () {
        var layerid = arguments[0];
        var layerdata = arguments[1];
        var xfield = arguments[2];
        var yfield = arguments[3];
        var scaleRenderer = arguments[4];
        var layertemplate = arguments[5];
        var scaleField = arguments[6];

        var glayer = webMap.getLayer(layerid);
        glayer.clear();

        if (layerdata.length > 0) {
            for (var i = 0; i < layerdata.length; i++) {
                var geopt = new esri.geometry.Point(parseFloat(layerdata[i][xfield]), parseFloat(layerdata[i][yfield]), webMap.spatialReference);
                var graphic = new esri.Graphic(geopt,null, layerdata[i]);
                glayer.add(graphic);
            }

            if (layertemplate != "") {
                var infoTemplate = new esri.InfoTemplate("信息显示", layertemplate);
                glayer.setInfoTemplate(infoTemplate);
            }

            //var myextent = esri.graphicsExtent(glayer.graphics);
            //webMap.setExtent(myextent.expand(1.5));
        }

        glayer.setRenderer(scaleRenderer);

        if (arguments.length > 7) {
            $glayerOverFuc = arguments[7];
            $glayerOutFuc = arguments[8];

            dojo.connect(glayer, "onMouseOver", $glayerOverFuc);
            dojo.connect(glayer, "onMouseOut", $glayerOutFuc);
        }
    };

    //显示点状数据
    //参数说明:layerid  图层ID名
    //layersymbol 图层样式
    //xfield  X字段
    //yfield  Y字段
    //layertemplate 显示info窗模版 可为空
    WebGIS.prototype.doShowPointsData = function (layerid, layerdata, layersymbol, xfield, yfield, layertemplate) {
        var layerid = arguments[0];
        var layerdata = arguments[1];
        var layersymbol = arguments[2];
        var xfield = arguments[3];
        var yfield = arguments[4];
        var layertemplate = arguments[5];



        var glayer = webMap.getLayer(layerid);
        glayer.clear();

        if (layerdata.length > 0) {
            for (var i = 0; i < layerdata.length; i++) {
                var geopt = new esri.geometry.Point(parseFloat(layerdata[i][xfield]), parseFloat(layerdata[i][yfield]), webMap.spatialReference);
                var graphic = new esri.Graphic(geopt, layersymbol, layerdata[i]);
                glayer.add(graphic);
            }

            if (layertemplate != "") {
                var infoTemplate = new esri.InfoTemplate("信息显示", layertemplate);
                glayer.setInfoTemplate(infoTemplate);
            }

            var myextent = esri.graphicsExtent(glayer.graphics);
            if ((myextent.xmax == myextent.xmin) || (myextent.ymax == myextent.ymin)) {
                myextent.xmax += 100;
                myextent.xmin -= 100;
                myextent.ymax += 100;
                myextent.ymin -= 100;
            } 
             webMap.setExtent(myextent.expand(1.5)); 
           
        }

        if (arguments.length > 6) {
            $glayerOverFuc = arguments[6];
            $glayerOutFuc = arguments[7];

            dojo.connect(glayer, "onMouseOver", $glayerOverFuc);
            dojo.connect(glayer, "onMouseOut", $glayerOutFuc);
        }
    }

    //设置graphicslayer是否显示
    WebGIS.prototype.doSetGraphicsLayerVisible = function (layerid, visiblevalue) {
        var glayer = webMap.getLayer(layerid);
        glayer.setVisibility(visiblevalue);
        glayer.redraw();
    };

    //初始化数据管理 
    WebGIS.prototype.doInitDataManage = function () {
        _navTool = new esri.toolbars.Navigation(webMap);
        dojo.connect(_navTool, "onExtentHistoryChange", extentHistoryChangeHandler);

        drawToolBar = new esri.toolbars.Draw(webMap, {
            tooltipOffset: 20,
            drawTime: 90
        });

        editToolBar = new esri.toolbars.Edit(webMap, {
            allowAddVertices: true,
            allowDeleteVertices: true
        });

        dojo.connect(layerdataeditLayer, "onClick", editlayerClickHandler);
    };

    function editlayerClickHandler(evt) {

    };

    //获取map对象
    WebGIS.prototype.GetMap = function () {
        return webMap;
    };

    WebGIS.prototype.GetTiledLayer = function () {
        return webTiledLayer;
    };
	//获取spa
    WebGIS.prototype.GetWebMapSpatialReference = function () {
    	return webTiledLayer.spatialReference;
    };

    WebGIS.prototype.GetTiledLayerYG = function () {
    	return sfTiledLayerYG;
    };

    WebGIS.prototype.GetDyLayer = function () {
        return webDyLayer;
    };


    WebGIS.prototype.doStartDataDraw = function (datatype) {
        if (datatype == "point") {
            drawToolBar.activate(esri.toolbars.Draw.POINT);
        }
        else if (datatype == "polyline") {
            drawToolBar.activate(esri.toolbars.Draw.POLYLINE);
        }
        else if (datatype == "polygon") {
            drawToolBar.activate(esri.toolbars.Draw.POLYGON);
        }
        else if (datatype == "rectangle") {
            drawToolBar.activate(esri.toolbars.Draw.RECTANGLE);
        }
    };

    //开始绘制图形
    //参数:用一个函数作为参数
    WebGIS.prototype.doInitDraw = function (drawCompleteEvt) {
        drawToolBar = new esri.toolbars.Draw(webMap, {
            tooltipOffset: 20,
            drawTime: 90
        });

        dojo.connect(drawToolBar, "onDrawComplete", drawCompleteEvt);
    };

    //初始化编辑
    //参数:graphic对象进行编辑
    WebGIS.prototype.doInitEdit = function (graphic) {
        editToolBar = new esri.toolbars.Edit(webMap, {
            allowAddVertices: true,
            allowDeleteVertices: true
        });

        editToolBar.activate(esri.toolbars.Edit.EDIT_VERTICES | esri.toolbars.Edit.MOVE, graphic, {
            allowAddVertices: true,
            allowDeleteVertices: true
        });
    };

    //结束编辑图形 
    WebGIS.prototype.doStopEdit = function () {
        editToolBar.deactivate();
    };

    //清空图层数据
    WebGIS.prototype.doClearDataLayer = function () {
        layerdatashowLayer.clear();
        layerdataeditLayer.clear();
    };

    //结束画图
    WebGIS.prototype.doEndDraw = function () {
        drawToolBar.deactivate();
    };

    WebGIS.prototype.doAddData2Layer = function (geo, datatype) {
        layerdatashowLayer.clear();
        var graphic;
        if (datatype == "point") {
            graphic = new esri.Graphic(geo, defaultsms);
        }
        else if (datatype == "polyline") {
            graphic = new esri.Graphic(geo, defaultsls);
        }
        else if (datatype == "polygon") {
            graphic = new esri.Graphic(geo, defaultsfs);
        }
        layerdatashowLayer.add(graphic);
    };

    WebGIS.prototype.doShowLayerData = function () {
        this.doClearDataLayer();
        var layerdata;
        var layerdatatype;
        var layersymbol;
        if (arguments.length == 2) {
            layerdata = arguments[0];
            layerdatatype = arguments[1];
            if (layerdatatype == "point") {
                layersymbol = defaultsms;
            }
            else if (layerdatatype == "polyline") {
                layersymbol = defaultsls;
            }
            else if (layerdatatype == "polygon") {
                layersymbol = defaultsfs;
            }
        }
        else if (arguments.length == 3) {
            layerdata = arguments[0];
            layerdatatype = arguments[1];
            var layerstyleobj = arguments[2];
            if (layerstyleobj["SYMTYPE"] == "SimpleMarkerSymbol") {
                var outlinestyle = layerstyleobj["OUTLINE_STYLE"];
                var outlinecolor = layerstyleobj["OUTLINE_COLOR"];
                var outlinewidth = layerstyleobj["OUTLINE_WIDTH"];
                var outline = BuildSlsByInfo(outlinestyle, outlinecolor, outlinewidth);
                layersymbol = BuildSmsByInfo(layerstyleobj["SMS_STYLE"], layerstyleobj["SMS_SIZE"], layerstyleobj["SMS_COLOR"], outline);
            }
            else if (layerstyleobj["SYMTYPE"] == "PictureMarkerSymbol") {
                var picurl = layerstyleobj["PMS_PICURL"];
                var picwidth = layerstyleobj["PMS_WIDTH"];
                var picheight = layerstyleobj["PMS_HEIGHT"];
                layersymbol = BuildPmsByInfo(picurl, picwidth, picheight);
            }
            else if (layerstyleobj["SYMTYPE"] == "SimpleLineSymbol") {
                var linestyle = layerstyleobj["SLS_STYLE"];
                var linecolor = layerstyleobj["SLS_COLOR"];
                var linewidth = layerstyleobj["SLS_WIDTH"];
                layersymbol = BuildSlsByInfo(linestyle, linecolor, linewidth);
            }
            else if (layerstyleobj["SYMTYPE"] == "SimpleFillSymbol") {
                var outlinestyle = layerstyleobj["OUTLINE_STYLE"];
                var outlinecolor = layerstyleobj["OUTLINE_COLOR"];
                var outlinewidth = layerstyleobj["OUTLINE_WIDTH"];
                var outline = BuildSlsByInfo(outlinestyle, outlinecolor, outlinewidth);
                layersymbol = BuildSfsByInfo(layerstyleobj["SFS_STYLE"], layerstyleobj["SFS_COLOR"], outline);
            }
        }

        if (layerdata.length > 0) {
            for (var i = 0; i < layerdata.length; i++) {
                var geo;
                if (layerdatatype == "point") {
                    var layergeo = $.parseJSON(layerdata[i]["GEOMETRY_JSON"]);
                    geo = new esri.geometry.Point(layergeo);
                }
                else if (layerdatatype == "polyline") {
                    geo = new esri.geometry.Polyline($.parseJSON(layerdata[i]["GEOMETRY_JSON"]));
                }
                else if (layerdatatype == "polygon") {
                    geo = new esri.geometry.Polygon($.parseJSON(layerdata[i]["GEOMETRY_JSON"]));
                }

                var graphic = new esri.Graphic(geo, layersymbol, layerdata[i]);
                layerdataeditLayer.add(graphic);
            }
        }


    };

    WebGIS.prototype.doShowInfoWindow = function (info_content, info_title, win_width, win_height, geopt) {
        webMap.infoWindow.hide();
        webMap.infoWindow.setContent(info_content);
        webMap.infoWindow.setTitle(info_title);
        webMap.infoWindow.resize(win_width, win_height);
        webMap.infoWindow.show(geopt);
    };

    WebGIS.prototype.hidesInfoWindow = function () {
        webMap.infoWindow.hide();
    };


    WebGIS.prototype.doShowInfoWindowByXY = function (info_content, info_title, win_width, win_height, coordx, coordy) {
        var geopt = new esri.geometry.Point(parseFloat(coordx), parseFloat(coordy));
        this.doShowInfoWindow(info_content, info_title, win_width, win_height, geopt);
    };





    //隐藏infowindow框
    WebGIS.prototype.doHideInfoWindow = function () {
        webMap.infoWindow.hide();
    };
    //通过名称获取图层ID
    WebGIS.prototype.doGetLayerIDByName = function (layername) {
        var layerid = -1;
        for (var i = 0; i < webDyLayer.layerInfos.length; i++) {
            if (webDyLayer.layerInfos[i]["name"] == layername) {
                layerid = webDyLayer.layerInfos[i]["id"];
                break;
            }
        }
        return layerid;
    };
    //通过ID数组，控制图层显示
    WebGIS.prototype.doSetLayerVisibleByIDArray = function (idsArray) {
        if (idsArray.length == 1)
            idsArray.push(-1);

        webDyLayer.setVisibleLayers(idsArray);
    };
    //通过名称数组，控制图层显示
    WebGIS.prototype.doSetLayerVisibleByNameArray = function (namesArray) {
        var idsarray = new Array();
        if (namesArray !== defaultOpenLayer) {
            namesArray = namesArray.concat(defaultOpenLayer);
        }
        for (var j = 0; j < namesArray.length; j++) {
            var layerid = -1;
            for (var i = 0; i < webDyLayer.layerInfos.length; i++) {


                if (webDyLayer.layerInfos[i]["name"] == namesArray[j]) {
                    layerid = webDyLayer.layerInfos[i]["id"];
                    break;
                }

            }
            if (layerid != -1)
                idsarray.push(layerid);
        }
            
        this.doSetLayerVisibleByIDArray(idsarray);
    };


    //构建图片样式
    WebGIS.prototype.BuildPmsByInfo = function (picurl, syswidth, sysheight) {
        var pms = new esri.symbol.PictureMarkerSymbol(picurl, parseInt(syswidth), parseInt(sysheight));
        return pms;
    };
    //构建基本点样式
    WebGIS.prototype.BuildSmsByInfo = function (smsstyle, smssize, smscolor, outline) {
        var smssymbol;
        var size = parseInt(smssize);
        var color = new esri.Color(smscolor);

        if (smsstyle == "STYLE_CIRCLE") {
            smssymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, size, outline, color);
        }
        else if (smsstyle == "STYLE_CROSS") {
            smssymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CROSS, size, outline, color);
        }
        else if (smsstyle == "STYLE_DIAMOND") {
            smssymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND, size, outline, color);
        }
        else if (smsstyle == "STYLE_PATH") {
            smssymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_PATH, size, outline, color);
        }
        else if (smsstyle == "STYLE_SQUARE") {
            smssymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, size, outline, color);
        }
        else if (smsstyle == "STYLE_X") {
            smssymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_X, size, outline, color);
        }

        return smssymbol;
    };
    //构建基本线样式
    WebGIS.prototype.BuildSlsByInfo = function (slsstyle, slscolor, slswidth) {
        var slssymbol;
        if (slswidth == "")
            slswidth = "2";
        var wd = parseInt(slswidth);
        var color;
        if (slscolor != "")
            color = new esri.Color(slscolor);
        else
            color = new esri.Color("#FF0000");
        if (slsstyle == "STYLE_DASH") {
            slssymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, color, wd);
        }
        else if (slsstyle == "STYLE_DASHDOT") {
            slssymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, color, wd);
        }
        else if (slsstyle == "STYLE_DASHDOTDOT") {
            slssymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOTDOT, color, wd);
        }
        else if (slsstyle == "STYLE_DOT") {
            slssymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DOT, color, wd);
        }
        else if (slsstyle == "STYLE_LONGDASHDOT") {
            slssymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_LONGDASHDOT, color, wd);
        }
        else if (slsstyle == "STYLE_NULL") {
            slssymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL, color, wd);
        }
        else if (slsstyle == "STYLE_SHORTDASH") {
            slssymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SHORTDASH, color, wd);
        }
        else if (slsstyle == "STYLE_SHORTDASHDOT") {
            slssymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SHORTDASHDOT, color, wd);
        }
        else if (slsstyle == "STYLE_SHORTDASHDOTDOT") {
            slssymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SHORTDASHDOTDOT, color, wd);
        }
        else if (slsstyle == "STYLE_SHORTDOT") {
            slssymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SHORTDOT, color, wd);
        }
        else if (slsstyle == "STYLE_SOLID") {
            slssymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, color, wd);
        }

        return slssymbol;
    };
    //构建基本面样式
    WebGIS.prototype.BuildSfsByInfo = function (sfsstyle, sfscolor, outline) {
        var sfssymbol;
        var color = new esri.Color(sfscolor);

        if (sfsstyle == "STYLE_BACKWARD_DIAGONAL") {
            sfssymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_BACKWARD_DIAGONAL, outline, sfscolor);
        }
        else if (sfsstyle == "STYLE_CROSS") {
            sfssymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_CROSS, outline, sfscolor);
        }
        else if (sfsstyle == "STYLE_DIAGONAL_CROSS") {
            sfssymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_DIAGONAL_CROSS, outline, sfscolor);
        }
        else if (sfsstyle == "STYLE_FORWARD_DIAGONAL") {
            sfssymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_FORWARD_DIAGONAL, outline, sfscolor);
        }
        else if (sfsstyle == "STYLE_HORIZONTAL") {
            sfssymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_HORIZONTAL, outline, sfscolor);
        }
        else if (sfsstyle == "STYLE_NULL") {
            sfssymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, outline, sfscolor);
        }
        else if (sfsstyle == "STYLE_SOLID") {
            sfssymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, outline, sfscolor);
        }
        else if (sfsstyle == "STYLE_VERTICAL") {
            sfssymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_VERTICAL, outline, sfscolor);
        }

        return sfssymbol;

    };

    function extentHistoryChangeHandler() {
        _navTool.activate(esri.toolbars.Navigation.PAN);
    };

    //针对已定位点数据
    WebGIS.prototype.doLocatePoiResultsByID = function (oid) {
        webMap.infoWindow.hide();
        for (var i = 0; i < _tempLocateArray.length; i++) {
            if (_tempLocateArray[i].attributes["ID"] == oid) {
                webMap.centerAndZoom(_tempLocateArray[i].geometry, 7);
                var contentstr = String.format("类型:{0}<br/><h5>位置:{1}{2}</h5>", _tempLocateArray[i].attributes["TypeName"], _tempLocateArray[i].attributes["PoiName"], _tempLocateArray[i].attributes["PoiAddress"])
                webMap.infoWindow.setContent(contentstr);
                webMap.infoWindow.setTitle("快速定位");
                webMap.infoWindow.resize(200, 150);
                webMap.infoWindow.show(_tempLocateArray[i].geometry);
                break;
            }
        }
    };


    //sf加
    //针对已定位点数据
    WebGIS.prototype.sfDoLocatePoiResultsByID = function (oid) {
        for (var i = 0; i < _tempLocateArray.length; i++) {
            if (_tempLocateArray[i].attributes["ID"] == oid) {
                webMap.centerAndZoom(_tempLocateArray[i].geometry, 7);
                var contentstr = String.format("类型:{0}<br/><h5>位置:{1}{2}</h5>", _tempLocateArray[i].attributes["TypeName"], _tempLocateArray[i].attributes["PoiName"], _tempLocateArray[i].attributes["PoiAddress"])
                webMap.infoWindow.setContent(contentstr);
                webMap.infoWindow.setTitle("快速定位");
                webMap.infoWindow.resize(200, 150);
                webMap.infoWindow.show(_tempLocateArray[i].geometry);
                break;
            }
        }
    };



    //导航工具栏功能
    WebGIS.prototype.doNavTool = function () {
        var navType = arguments[0];
        if (navType == "zoomin") {
            _navTool.activate(esri.toolbars.Navigation.ZOOM_IN);
        }
        else if (navType == "zoomout") {
            _navTool.activate(esri.toolbars.Navigation.ZOOM_OUT);
        }
        else if (navType == "pan") {
            _navTool.activate(esri.toolbars.Navigation.PAN);
        }
        else if (navType == "fullextent") {
            _navTool.activate(esri.toolbars.Navigation.PAN);
            webMap.setExtent(webDyLayer.initialExtent);
        }
        else if (navType == "clear") {
            webMap.graphics.clear();
            var graphicsLayerIds = webMap.graphicsLayerIds;
            for (var i = 0; i < graphicsLayerIds.length; i++) {
                var glayer = webMap.getLayer(graphicsLayerIds[i]);
                glayer.clear();
            }
        }
    };

    //动态图层初始化完成
    function webDyLayerLoad() {
        //$that.doSetLayerVisibleByNameArray(defaultOpenLayer);
        // $.when( $that.queryTask("区县边界", "区县代码='12'") ).then(function (f) {
        //    webMap.setExtent(f);
        //})
        //webMap.setExtent(webDyLayer.fullExtent);
        if ($that.DyMapLoaded != undefined && typeof ($that.DyMapLoaded) == "function")
        {
            $that.DyMapLoaded();
        }
        
       
    };

    WebGIS.prototype.doClearLocateMap = function () {
        //webMap.graphics.clear();
        //var graphicsLayerIds = webMap.graphicsLayerIds;
        //for (var i = 0; i < graphicsLayerIds.length; i++) {
        //    var glayer = webMap.getLayer(graphicsLayerIds[i]);
        //    glayer.clear();
        //}
        addressLocateLayer.clear();
        addressLocateOverLayer.clear();
    };

    WebGIS.prototype.doShowLocatePointArray = function (jsonArray, xfield, yfield) {
        addressLocateLayer.clear();
        addressLocateOverLayer.clear();
        _tempLocateArray = new Array();
        for (var i = 0; i < jsonArray.length; i++) {
            var mpt = new esri.geometry.Point(Number(jsonArray[i][xfield]), Number(jsonArray[i][yfield]), webMap.spatialReference);
            var graphic = new esri.Graphic(mpt, _locateSymbolsArray[i], jsonArray[i]);
            _tempLocateArray[i] = graphic;
            addressLocateLayer.add(graphic);
        }
        if (_tempLocateArray.length > 0) {
            setGraphicExtent(_tempLocateArray);
        }
    };

    WebGIS.prototype.doClickNameLocate = function (xvalue, yvalue) {
        var coordx = Number(xvalue);
        var coordy = Number(yvalue);
        var extent = new esri.geometry.Extent(coordx - 100, coordy - 100, coordx + 100, coordy + 100, webMap.spatialReference);
        webMap.setExtent(extent);
    };

    WebGIS.prototype.doMouseOverLocatePointSymbol = function (jsonobj, xfield, yfield, jsonindex) {
        addressLocateOverLayer.clear();
        var mpt = new esri.geometry.Point(Number(jsonobj[xfield]), Number(jsonobj[yfield]), webMap.spatialReference);
        var graphic = new esri.Graphic(mpt, _locateSymbolsHoverArray[jsonindex]);
        addressLocateOverLayer.add(graphic);
    };

    function setGraphicExtent(graphicsArray) {
        var currentExtent = esri.graphicsExtent(graphicsArray);
        webMap.setExtent(currentExtent.expand(1.5));
    };
    WebGIS.prototype.doLocateAtLayer = function (layerid) {
        var glayer = webMap.getLayer(layerid);
        setGraphicExtent(glayer.graphics);
    };
    WebGIS.prototype.doMouseOutLocatePointSymbol = function () {
        addressLocateOverLayer.clear();
    };

    //物资模块相关内容
    WebGIS.prototype.CreateScaleRenderForWZ = function (icon) {
        // BuildPmsByInfo("../assets/imgs/wz/multiple.png", 22, 31);
        // BuildPmsByInfo("../assets/imgs/wz/single.png", 22, 31);
        var scalRenderer = new esri.renderer.ScaleDependentRenderer({
            rendererInfos: [{
                renderer: this.CreateRendererForWZ(22, "STATUS",icon),
                maxScale: 500,
                minScale: 700
            }, {
                renderer: this.CreateRendererForWZ(15, "STATUS",icon),
                maxScale: 700,
                minScale: 7000
            },
            {
                renderer: this.CreateRendererForWZ(12, "STATUS",icon),
                maxScale: 7000,
                minScale: 40000
            },
            {
                renderer: this.CreateRendererForWZ(10, "STATUS",icon),
                maxScale: 40000,
                minScale: 100000
            },
            {
                renderer: this.CreateRendererForWZ(8, "STATUS",icon),
                maxScale: 100000,
                minScale: 850000
            }
            ]
        });
        return scalRenderer;
    }

    WebGIS.prototype.CreateRendererForWZ = function (size,field,icon) {
        var imgWidth = size;
        var imgHeight = size * 31 / 22;
        var singleSymbol = this.BuildPmsByInfo("../assets/imgs/wz/"+icon+".png", imgWidth, imgHeight);
        var multipleSymbol = this.BuildPmsByInfo("../assets/imgs/wz/"+icon+".png", imgWidth, imgHeight);

        var renderer = new esri.renderer.UniqueValueRenderer(singleSymbol, field);
        renderer.addValue("single", singleSymbol);
        renderer.addValue("multiple", multipleSymbol);
        return renderer;

    }

    //危险源

    //安全隐患

    //下立交
    WebGIS.prototype.CreateScaleRenderForXlj = function () {
        // BuildPmsByInfo("../assets/imgs/wz/multiple.png", 22, 31);
        // BuildPmsByInfo("../assets/imgs/wz/single.png", 22, 31);
        var scalRenderer = new esri.renderer.ScaleDependentRenderer({
            rendererInfos: [{
                renderer: this.CreateRendererForXlj(22, "STATUS"),
                maxScale: 500,
                minScale: 700
            }, {
                renderer: this.CreateRendererForXlj(15, "STATUS"),
                maxScale: 700,
                minScale: 7000
            },
                        {
                            renderer: this.CreateRendererForXlj(12, "STATUS"),
                            maxScale: 7000,
                            minScale: 40000
                        },
                        {
                            renderer: this.CreateRendererForXlj(10, "STATUS"),
                            maxScale: 40000,
                            minScale: 100000
                        },
                        {
                            renderer: this.CreateRendererForXlj(8, "STATUS"),
                            maxScale: 100000,
                            minScale: 850000
                        }
            ]
        });
        return scalRenderer;
    }

    WebGIS.prototype.CreateRendererForXlj = function (size, field) {
        var imgWidth = size;
        var imgHeight = size * 31 / 22;
        var redSymbol = this.BuildPmsByInfo("../assets/imgs/wz/xlj_red.png", imgWidth, imgHeight);
        var yellowSymbol = this.BuildPmsByInfo("../assets/imgs/wz/xlj_yellow.png", imgWidth, imgHeight);
        var greenSymbol = this.BuildPmsByInfo("../assets/imgs/wz/xlj_green.png", imgWidth, imgHeight);

        var renderer = new esri.renderer.UniqueValueRenderer(greenSymbol, field);
        renderer.addValue("red", redSymbol);
        renderer.addValue("yellow", yellowSymbol);
        renderer.addValue("green", greenSymbol);
        return renderer;
    }


    WebGIS.prototype.layerInfo = function (layerUrl) {
        var layersRequest = new dojo.Deferred()
        require(["esri/request"], function (esriRequest) {

            var eRequest = esriRequest({
                url: layerUrl,
                content: { f: "json" },
                handleAs: "json",
                callbackParamName: "callback"
            });
            eRequest.then(
              function (response) {
                  layersRequest.resolve(response);
              }, function (error) {
                  layersRequest.reject(error);
              });
        });
        return layersRequest;
    }
    WebGIS.prototype.GetLayerIdsFromNames = function (layerUrl, layerNames) {
        return $that.layerInfo(layerUrl).then(function (response) {
            layerids = [];
            if (!(layerNames instanceof Array)) {
                layerNames = [layerNames];
            };
            for (var i = 0; i < response.layers.length; i++) {
                if (layerNames.indexOf(response.layers[i].name) > -1 && response.layers[i].subLayerIds === null) {
                    layerids.push(response.layers[i].id);
                }
                if (layerids.length == layerNames.length) {
                    break;
                }
            }
            return layerids;
        }, function () {
            return [];
        });
    }

    WebGIS.prototype.queryTask = function (layerUrl, layername, querywhere) {
        var deftask = new dojo.Deferred()
        $that.GetLayerIdsFromNames(layerUrl, layername).then(function (layerids) {

            if (layerids === undefined || layerids.length === 0) {
                deftask.reject("不存在" + layername + "图层");
                return;
            }
            var layerid = layerids[0];

            var queryUrl = layerUrl + "/" + layerid;

            var queryTask = new esri.tasks.QueryTask(queryUrl);

            var query = new esri.tasks.Query();
            query.where = querywhere || "1=1";
            query.outSpatialReference = $that.GetMap().spatialReference;
            query.returnGeometry = true;
            query.outFields = ["*"];

            queryTask.execute(query, function (featureSet) {
                deftask.resolve(featureSet.features);
            }, function (queryFault) {
                deftask.reject(queryFault);
            });


        }, function (error) {
            deftask.reject(error);
        });
        return deftask;

    }
    WebGIS.prototype.DefaultLocateAt = function ()
    {
       return $that.queryTask(_dylayerUrl, "区县边界", "1=1").then(function (f) {
           if (f && f.length > 0) {
               $that.GetMap().setExtent(f[0].geometry.getExtent());
               return true
           }
           else {
               return false;
           }
        })
    }
  
    //加载遥感地图
    function addRemote(SfMapDivID) {
        var sfDTUrlA = globalWebPath + "assets/imgs/home/plan.png"
        var sfDTUrlB =globalWebPath + "assets/imgs/home/remoteSensing.png"
        var sfRemotes = "<div id='rightSwitchDiv'><div class='planView selected'><img src=" + sfDTUrlA + " /><span>底图</span></div><div class='remoteView'><img src=" + sfDTUrlB + " /><span>遥感</span></div></div>"
        var sfID = "#" + SfMapDivID
        $(sfID).append(sfRemotes)
        //遥感切换
        $(".planView").click(function () {
            webgis.hidesInfoWindow();
            webTiledLayer.show();
            sfTiledLayerYG.hide();
        })
        $(".remoteView").click(function () {
            webgis.hidesInfoWindow();
            webTiledLayer.hide();
            sfTiledLayerYG.show();
        })
        $("#rightSwitchDiv>div").on("click", function () {
            $("#rightSwitchDiv>div").removeClass("selected");
            $(this).addClass("selected");
        });
        $('#rightToolDiv .btn').on('click', function (e) {
            $(this).blur();
        });
    }




};