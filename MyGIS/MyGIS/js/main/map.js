var map;
$(function () {
});

/*****加载矢量图和切片图*****/
function LoadMap() {
    require(["esri/map",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/geometry/Point",
        "esri/SpatialReference",
        "dojo/domReady!"],
        function (Map, ArcGISDynamicMapServiceLayer, ArcGISTiledMapServiceLayer, Point, SpatialReference) {
            map = new Map("map", { logo: false, lods: MapConfig.mapInitParams.lods });
            var tiled = new ArcGISTiledMapServiceLayer(MapConfig.imgMap.Url);
            map.addLayer(tiled);
            var dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer(MapConfig.vecMap.Url);
            map.addLayer(dynamicMapServiceLayer);
            ////设置地图初始范围
            var initExtent = new esri.geometry.Extent({ xmin: MapConfig.mapInitParams.extent.xmin, ymin: MapConfig.mapInitParams.extent.ymin, xmax: MapConfig.mapInitParams.extent.xmax, ymax: MapConfig.mapInitParams.extent.ymax, spatialReference: MapConfig.mapInitParams.spatialReference });
            map.setExtent(initExtent);
        }
      );
}

/*****唯一值渲染*****/
/*****色块图，根据某些条件，设置图形颜色*****/
function UniqueValueRenderer() {
    require(["esri/map",
            "esri/layers/ArcGISDynamicMapServiceLayer",
            "dojo/on",
            "dojo/dom",
            "dojo/colors",
            "esri/InfoTemplate",
            "esri/symbols/SimpleFillSymbol",
            "esri/layers/FeatureLayer",
            "esri/symbols/SimpleLineSymbol",
            "esri/renderers/UniqueValueRenderer",
            "esri/dijit/Legend",
            "dojo/domReady!"],
        function (Map, ArcGISDynamicMapServiceLayer, on, dom, Color, InfoTemplate, SimpleFillSymbol, FeatureLayer, SimpleLineSymbol, UniqueValueRenderer, Legend) {
            //如果还没有加载地图，则重新加载地图
            if (!map)
            {
                LoadMap();
            }
            //定义一个要素图层
            var featureLayer = new FeatureLayer(
                MapConfig.vecMap.Url + "/6",
                {
                    infoTemplate: new InfoTemplate("街道名称：${街道名称}", "${街道名称}"),//infowindow显示标题+内容
                    mode: FeatureLayer.MODE_SNAPSHOT,
                    outFields: ["*"]
                });
            //定义线符号
            var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 3);
            //定义面符号
            var fill = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new Color("#FFFFCC"));
            //定义唯一值渲染器，对字段alias进行渲染，fill是默认的渲染符号
            var renderer = new UniqueValueRenderer(fill, "街道名称");
            //设置渲染的方式
            renderer.addValue("万祥镇", new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new Color([246, 73, 70, 0.5])));
            renderer.addValue("三林镇", new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new Color([2, 98, 120, 0.5])));
            renderer.addValue("上海国际旅游度假区", new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new Color([154, 202, 238, 0.5])));
            featureLayer.setRenderer(renderer);
            map.addLayer(featureLayer);

            featureLayer.on("load", function () {
                var legend = new Legend({
                    map: map,
                    layerInfos: [{
                        layer: featureLayer,
                        title: "图例TITLE"
                    }]
                }, "legend");
                legend.startup();
            });
        });
}

/*****分级符号化渲染*****/
/*****根据图层某个字段，进行分级着色*****/
function ClassBreaksRenderer() {
    require(["esri/map",
                "esri/layers/ArcGISDynamicMapServiceLayer",
                "dojo/on",
                "dojo/dom",
                "dojo/colors",
                "esri/InfoTemplate",
                "esri/symbols/SimpleFillSymbol",
                "esri/layers/FeatureLayer",
                "esri/symbols/SimpleLineSymbol",
                "esri/renderers/ClassBreaksRenderer",
                "esri/dijit/Legend",
                "dojo/domReady!"],
            function (Map, ArcGISDynamicMapServiceLayer, on, dom, Color, InfoTemplate, SimpleFillSymbol, FeatureLayer, SimpleLineSymbol, ClassBreaksRenderer, Legend) {
                //如果还没有加载地图，则重新加载地图
                if (!map) {
                    LoadMap();
                }
                //定义一个要素图层
                var featureLayer = new FeatureLayer(
                MapConfig.vecMap.Url + "/6",//查询加上需要查的图层号
                 {
                     infoTemplate: new InfoTemplate("街道名称：${街道名称}", "${*}"),//infowindow显示标题+内容
                     mode: FeatureLayer.MODE_SNAPSHOT,
                     outFields: ["*"]
                 });
                //定义线符号
                var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 3);
                //定义面符号
                var fill = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new Color("#FFFFCC"));
                //定义唯一值渲染器，对字段alias进行渲染，fill是默认的渲染符号
                var renderer = new ClassBreaksRenderer(fill, "OBJECTID");
                //设置渲染间隔
                renderer.addBreak(0, 20, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new Color([0, 255, 0, 0.5])));
                renderer.addBreak(20, 30, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new Color([0, 0, 255, 0.5])));
                renderer.addBreak(30, 40, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new Color([255, 0, 255, 0.5])));
                renderer.addBreak(40, 60, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new Color([255, 255, 255, 0.75])));
                featureLayer.setRenderer(renderer);
                map.addLayer(featureLayer);

                featureLayer.on("load", function () {
                    var legend = new Legend({
                        map: map,
                        layerInfos: [{
                            layer: featureLayer,
                            title: "图例TITLE"
                        }]
                    }, "legend");
                    legend.startup();
                });
            });
}

/*****点密度图*****/
/*****根据某数据，用点密度表示多少*****/
function DotsensityThemeMap()
{
    require(["esri/map", "esri/layers/ArcGISTiledMapServiceLayer", "esri/layers/FeatureLayer", "esri/InfoTemplate", "esri/renderers/DotDensityRenderer"
    , "esri/symbols/SimpleLineSymbol", "esri/dijit/Legend", "esri/Color", "dojo/domReady!"], function (Map, ArcGISTileMapServiceLayer
    , FeatureLayer, InfoTemplate, DotDensityRenderer, SimpleLineSymbol, Legend, Color) {
        //如果还没有加载地图，则重新加载地图
        if (!map) {
            LoadMap();
        }
        var layer = new FeatureLayer(MapConfig.vecMap.Url + "/6", {
            InfoTemplate: new InfoTemplate("街镇名称：${街镇名称}", "${*}"),
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"]
        });
        //创建点渲染器
        var renderer = new DotDensityRenderer({
            backgroundColor: new Color("#FFFFFF"),
            outline: new SimpleLineSymbol().setColor(new Color([0, 0, 255])),
            fields: [{
                name: "Shape_Area",
                color: new Color("#FF0000")
            }],
            dotShape: "circle",
            dotValue: 10000000,
            dotSize: 10
        });
        layer.setRenderer(renderer);
        layer.setOpacity(0.7);
        map.addLayers([layer]);
        map.on("layers-add-result", function (e) {
            var corn = e.layers[0].layer;
            var legend = new Legend({
                map: map,
                layerInfos: [{
                    layer: corn,
                    title: "标题TITLE"
                }]
            }, "legend");
            legend.startup();
        });
    })
}

/*****绘制点线面*****/
/*****在地图上绘制点、线、面、徒手画线、徒手画面*****/
function Draw() {
    //显示/隐藏绘画按钮
    if ($("#drawBtn").is(":hidden")) {
        $("#drawBtn").show();
    }
    else {
        $("#drawBtn").hide();
    }
    require(["esri/map", "dojo/dom", "dojo/on",
                    "esri/layers/ArcGISDynamicMapServiceLayer",
                    "dojo/query", "esri/toolbars/draw",
                    "esri/symbols/SimpleLineSymbol", "esri/graphic", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleFillSymbol", "dojo/domReady!"],
                function (Map, dom, on, ArcGISDynamicMapServiceLayer, query, Draw, SimpleLineSymbol, Graphic, SimpleMarkerSymbol, SimpleFillSymbol) {
                    //如果还没有加载地图，则重新加载地图
                    if (!map) {
                        LoadMap();
                    }
                    //创建绘图对象
                    var toolbar = new Draw(map, { showTooltips: true });
                    //定义绘制的点、线、面的样式
                    var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 3);
                    var marker = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, lineSymbol, new dojo.Color([255, 0, 0]));
                    var fill = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new dojo.Color([255, 0, 0]));
                    //给绘图工具绑定绘图完成事件
                    on(toolbar, "draw-complete", function (result) {
                        //获得几何形状
                        var geometry = result.geometry;
                        //获得形状的类型
                        var type = geometry.type;
                        //声明图形对象
                        var graphic;
                        //通过几何形状的类型，创建不同的图形
                        switch (type) {
                            case "point":
                                graphic = new Graphic(geometry, marker);
                                break;
                            case "polyline":
                                graphic = new Graphic(geometry, lineSymbol);
                                break;
                            case "polygon":
                                graphic = new Graphic(geometry, fill);
                                break;
                        }
                        //将绘制的图形添加到地图中
                        map.graphics.add(graphic);
                        //关掉绘图工具
                        toolbar.deactivate();
                    });
                    //给每一个button绑定相应的事件（激活绘图工具）
                    query("button").on("click", function (event) {
                        var value = this.innerHTML;
                        switch (value) {
                            case "点": {
                                //激活绘图工具（画点）
                                toolbar.activate(Draw.POINT, {
                                    showTooltips: true
                                })
                                break;

                            }
                            case "线": {
                                //激活绘图工具（画折线）
                                toolbar.activate(Draw.POLYLINE, {
                                    showTooltips: true
                                })
                                break;
                            }
                            case "面": {
                                //激活绘图工具（绘制面）
                                toolbar.activate(Draw.POLYGON, {
                                    showTooltips: true
                                })
                                break;
                            }
                            case "徒手线": {
                                //激活绘图工具（徒手线）
                                toolbar.activate(Draw.FREEHAND_POLYLINE, {
                                    showTooltips: true
                                })
                                break;
                            }
                            case "徒手面": {
                                //激活绘图工具（徒手面）
                                toolbar.activate(Draw.FREEHAND_POLYGON, {
                                    showTooltips: true
                                })
                                break;
                            }

                        }
                    });
                })
}

/*****缓冲区分析*****/
/*****在地图上点的周围做缓冲区分析*****/
function Buffer() {
    require(["esri/map",
        "esri/geometry/Point",
        "esri/geometry/Polyline",
        "esri/geometry/Polygon",
        "esri/graphic",
        "esri/Color",
        "esri/tasks/BufferParameters",
        "esri/tasks/GeometryService",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/SpatialReference",
        "dojo/domReady!"], function (Map, Point, Polyline, Polygon, Graphic, Color, BufferParameters, GeometryService, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, SpatialReference) {
            //如果还没有加载地图，则重新加载地图
            if (!map) {
                LoadMap();
            }
            //var map = new Map("map", {
            //    basemap: "osm",
            //    center: [115.95, 28.6826],
            //    zoom: "12"
            //});
            //var points = [new Point(0, 0), new Point(1000, 1000), new Point(2000, 1000), new Point(0, 1000)];
            //var polylines = [new Polyline([[500, 500], [600, 600]]), new Polyline([[1000, 2000], [2000, 2859]])];
            //var polygons = [new Polygon([[100, 1000], [1000, 2000], [2000, 3000], [3000, 2000], [4000, 2000]])];
            //var points = [new Point(0, 0, map.spatialReference)];
            var points = [new Point(0, 0, map.spatialReference)];
            var polylines = [new Polyline([[500, 500], [2000, 2000]])];
            //var polygons = [new Polygon([[3000, 3000], [-1000, -2000], [2000, 3000]])];
            //var points = [new Point(116.026, 28.6826), new Point(116.05, 28.66), new Point(116.11, 28.70), new Point(115.95, 28.65)];
            //var polylines = [new Polyline([[115.88, 28.70], [115.88, 28.67]]), new Polyline([[115.82, 28.64], [115.89, 28.59]])];
            var polygons = [new Polygon([[1150.798499, 2807.83553], [1150.75998, 2808.95433], [1150.900834, 2808.21535], [1150.785276, 2807.59237], [1150.713987, 2807.33902]])];

            var geometryService = new GeometryService("http://10.231.9.139/ArcGIS/rest/services/Geometry/GeometryServer");//MapConfig.GeometryService.Url);
            map.on("load", function () {
                var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 4);
                var markerSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([100, 100, 100, 0.1]), 1),
                    new Color([255, 0, 0]));
                var fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol("solid", new Color([255, 0, 0]), 1),
                    new Color([255, 0, 0, 0]));
                for (var i = 0; i < points.length; i++) {
                    //map.graphics.add(new Graphic(points[i], markerSymbol));
                }
                for (var i = 0; i < polylines.length; i++) {
                    //map.graphics.add(new Graphic(polylines[i], lineSymbol));
                }
                for (var i = 0; i < polygons.length; i++) {
                    map.graphics.add(new Graphic(polygons[i], fillSymbol));
                }
                // 点缓冲区
                //var pointParams = new BufferParameters();
                //pointParams.geometries = points;
                //pointParams.distances = [300];
                ////pointParams.unit = GeometryService.UNIT_KILOMETER;
                ////pointParams.bufferSpatialReference = map.spatialReference;
                ////pointParams.outSpatialReference = map.spatialReference;
                //geometryService.buffer(pointParams, function (features) {
                //    var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                //        new SimpleLineSymbol("solid", new Color([197, 97, 20]), 1),
                //        new Color([0, 255, 0, 1]));

                //    for (var i = 0; i < features.length; i++) {
                //        console.log(features[i]);
                //        map.graphics.add(new Graphic(features[i], symbol))
                //    }
                //});

                //// 线缓冲区
                //var polyineParams = new BufferParameters();
                //polyineParams.geometries = polylines;
                //polyineParams.distances = [300];
                ////polyineParams.unit = GeometryService.UNIT_KILOMETER;
                ////polyineParams.bufferSpatialReference = new SpatialReference({ wkid: 32662 }); //map.spatialReference;
                ////polyineParams.outSpatialReference = map.spatialReference;

                //geometryService.buffer(polyineParams, function (features) {
                //    var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                //        new SimpleLineSymbol("solid", new Color([197, 97, 20]), 1),
                //        new Color([0, 255, 0, 1]));

                //    for (var i = 0; i < features.length; i++) {
                //        console.log(features[i]);
                //        map.graphics.add(new Graphic(features[i], symbol))
                //    }
                //});

                // 面缓冲区
                var polygonParams = new BufferParameters();
                polygonParams.geometries = polygons;
                polygonParams.geodesic = true;
                polygonParams.distances = [100];
                //polygonParams.unit = GeometryService.UNIT_KILOMETER;
                //polygonParams.bufferSpatialReference = map.spatialReference;
                //polygonParams.outSpatialReference = map.spatialReference;

                geometryService.buffer(polygonParams, function (features) {
                    var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol("solid", new Color([0, 255, 0]), 1),
                        new Color([0, 255, 0, 1]));

                    for (var i = 0; i < features.length; i++) {
                        console.log(features[i]);
                        map.graphics.add(new Graphic(features[i], symbol))
                    }
                });

            })

        });
}

/*****图层控制*****/
/*****控制图层的显示/隐藏*****/
function LayerControl()
{
    //如果还没有加载地图，则重新加载地图
    if (!map) {
        LoadMap();
    }
    var depLayers;

    //$('#tree_layer').css('max-height', mapHeight - 56);

    //点击标题栏隐藏/显示
    $('#dvReTitle').click(function () {
        if ($('#tree_layer').is(":visible")) {
            $('#tree_layer').fadeOut();
        }
        else { $('#tree_layer').fadeIn(); }
    });

    require(["dojo/DeferredList", "dojo/_base/Deferred"], function () {
        var dlx = new dojo.DeferredList([GetLayerInfo(MapConfig.vecMap.Url), GetLayerInfo(MapConfig.vecMap.Url + "/legend"), GetLayerInfo(MapConfig.vecMap.Url + "/layers")]);
            dlx.then(function (result) {
                var response = result[0][1];
                var legend = result[1][1];
                var layersSym = result[2][1];
                var _arrDepLayers = response.layers;
                var arrDepLayers = [];
                //单个graphicsLayer
                var graLyr;
                var arrNeedQueryIds = [];
                var idxNeedQueryIds = 0;

                //如果打开图层数大于0
                if (arrNeedQueryIds.length > 0) {
                    getDataByGeometry(arrNeedQueryIds[0]);
                }
                //按街镇切割（回调方法）
                function getDataByGeometry(lyrId) {
                    //创建查询对象，注意：服务的后面有一个编号，代表对那一个图层进行查询
                    var queryTask = new esri.tasks.QueryTask(CityGis.MapServers.DyLayerUrl + '/' + lyrId);
                    //创建查询参数对象
                    var query = new esri.tasks.Query();
                    //空间查询的几何对象
                    query.geometry = geoJDXZ;
                    //服务器给我们返回的字段信息，*代表返回所有字段
                    query.outFields = ["*"];
                    //空间参考信息
                    query.outSpatialReference = webgis.GetMap().spatialReference;
                    //查询的标准，此处代表和geometry相交的图形都要返回
                    query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;
                    //是否返回几何信息
                    query.returnGeometry = true;
                    //执行空间查询
                    queryTask.execute(query, showQueryResult);
                }

                function showQueryResult(queryResult) {
                    var layer = new esri.layers.GraphicsLayer({ id: "gly" + arrNeedQueryIds[idxNeedQueryIds] });

                    var pSymbol = getSymbol(arrNeedQueryIds[idxNeedQueryIds]);
                    layer.setRenderer(pSymbol);
                    webgis.GetMap().addLayer(layer);
                    for (var i = 0; i < queryResult.features.length; i++) {
                        var g = queryResult.features[i];
                        layer.add(g);
                    }
                    //添加到图层数组
                    arrGraphicsLyr.push(layer);
                    idxNeedQueryIds++;
                    getDataByGeometry(arrNeedQueryIds[idxNeedQueryIds]);
                    doSetVisible();
                }

                function getSymbol(id) {
                    for (var i = 0, len = layersSym.layers.length; i < len; i++) {
                        if (layersSym.layers[i].id === id) {
                            var symRenderer = new esri.renderers.SimpleRenderer(layersSym.layers[i].drawingInfo.renderer);
                            //var sym = layersSym.layers[i].drawingInfo.renderer.symbol;
                            return symRenderer;
                        }
                    }
                    return "";
                }

                function getNodeIcon(id) {
                    for (var i = 0, len = legend.layers.length; i < len; i++) {
                        if (legend.layers[i].layerId === id) {
                            var cls = "glyphicon-" + id;
                            AddStyle("." + cls, legend.layers[i].legend.length > 1 ? legend.layers[i].legend[legend.layers[i].legend.length - 1] : legend.layers[i].legend[0]);
                            return "glyphicon " + cls;
                        }
                    }
                    return "";
                }

                function AddStyle(cls, o) {
                    var styleElems = document.getElementsByTagName("style");
                    if (styleElems.length == 0) {
                        var tempStyle = document.createElement("style");
                        tempStyle.setAttribute("type", "text/css");
                        document.getElementsByTagName("head")[0].appendChild(tempStyle);
                    }

                    //如果页面中没有STYLE标签，则在HEAD中插入STYLE标签
                    var styleElem = styleElems[0];

                    //这里直接用数组的第一个元素
                    if (styleElem.styleSheet) {//IE  
                        styleElem.styleSheet.cssText += cls + "{ background:url('data:image/png;base64," + o.imageData + "') ;background-size:contain; height:25px!important;width:25px!important;}";
                    } else {
                        styleElem.appendChild(document.createTextNode(cls + "{ background:url('data:image/png;base64," + o.imageData + "');background-size:contain; height:25px!important;width:25px!important;}"));
                        //alert("webkit");	
                    }
                }
                var treedata = formatTreeJson(arrDepLayers, "id", "name", "nodeIcon", "parentLayerId");
                var _visible = [];
                //如果母节点下没有子节点，则不显示母节点
                for (var i = 0; i < treedata.length; i++) {
                    if (treedata[i].nodes === undefined) {
                        treedata.splice(i, 1);
                    }
                }

                //绑定树控件
                $("#tree_layer").treeview({
                    data: treedata,
                    showIcon: true,
                    //nodeIcon: "glyphicon glyphicon-17",
                    showCheckbox: true,
                    expand: true,
                    levels: 1,
                    onNodeChecked: function (event, node) {
                        if (node.nodes !== undefined) {
                            for (var i = 0; i < node.nodes.length; i++) {
                                $('#tree_layer').treeview('checkNode', [node.nodes[i].nodeId, { silent: true }]);
                                if (node.nodes[i].nodes !== undefined) {
                                    arguments.callee(event, node.nodes[i]);
                                }
                            }
                        }
                        doSetVisible();
                    },
                    onNodeUnchecked: function (event, node) {
                        if (node.nodes !== undefined) {
                            for (var i = 0; i < node.nodes.length; i++) {
                                $('#tree_layer').treeview('uncheckNode', [node.nodes[i].nodeId, { silent: true }]);
                                if (node.nodes[i].nodes !== undefined) {
                                    arguments.callee(event, node.nodes[i]);
                                }
                            }
                        }
                        doSetVisible();
                    }
                });

                //控制默认显示
                for (var i = 0; i < arrDepLayers.length; i++) {
                    if (CityGis.ResourceSetting.Layers.indexOf($('#tree_layer').treeview("getNode", i).text) > -1 && $('#tree_layer').treeview("getNode", i).nodes !== undefined) {
                        $('#tree_layer').treeview('checkNode', $('#tree_layer').treeview("getNode", i).nodeId, { silent: true });
                    }
                }
                //定级别的树节点。
                $('#tree_layer').treeview('expandAll', { levels: 1, silent: true });
                //点击查询
                webgis.GetMap().on("click", (function (event) {
                    queryLayerDetail(event);
                }));
            //});

        });
    });
}

GetLayerInfo = function (layerUrl) {
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
};
//显示隐藏图层
function doSetVisible() {
    visible = [];
    queryVisible = [];
    var nodes = $('#tree_layer').treeview("getChecked");
    dojo.forEach(nodes, function (node) {
        if (node.nodes == undefined) {
            visible.push("gly" + node.id);
            queryVisible.push(node.id);
        }
    });
    if (visible.length === 0) {
        visible.push(-1);
        queryVisible.push(-1);
    }
    doSetLayerVisible(visible);
}

function doSetLayerVisible(visible) {
    for (var i = 0; i < arrGraphicsLyr.length; i++) {
        if (visible.indexOf(arrGraphicsLyr[i].id) !== -1) {
            arrGraphicsLyr[i].show();
        }
        else {
            arrGraphicsLyr[i].hide();
        }
    }
}

function formatTreeJson(nodesdatas, idField, textField, nodeIconField, parentField, rootID) {
    return function (parentid) {
        var cn = new Array();
        for (var i = 0; i < nodesdatas.length; i++) {
            var n = {}, attrs = {};
            each: for (var j in nodesdatas[i]) {
                if (j == idField || j == textField) {
                    continue each;
                }
                attrs[j] = nodesdatas[i][j];
            }
            if (!n.attributes) {
                n.attributes = attrs;
            }
            n.id = nodesdatas[i][idField], n.text = nodesdatas[i][textField], n.icon = nodesdatas[i][nodeIconField]
            var pid = nodesdatas[i][parentField] == '' ? undefined : nodesdatas[i][parentField];
            if (pid == parentid) {
                var id = nodesdatas[i][idField];
                n.nodes = arguments.callee(id);
                if (n.nodes.length == 0) {
                    delete n.nodes;
                }
                cn.push(n);
            }
        }
        return cn;
    }(rootID);
}

function loadmap() {
    var def = new dojo.Deferred();
    webgis = new WebGIS();
    webgis.doIniLoad(CityGis.MapServers.TiledLayerUrl, CityGis.MapServers.DyLayerUrl, "mapDiv");
    webgis.mapOnLoadFinish = myMapLoadHandler;
    function myMapLoadHandler() {
        webgis.queryTask(CityGis.MapServers.DyLayerUrl, "街道乡镇", "街道代码='" + CityGis.BascSetting.curArea.CODE + "'").then(function (features) {
            for (var i = 0; i < features.length; i++) {
                geoJDXZ = features[i].geometry;
                def.resolve();
            }
            def.resolve();
        })
    }
    return def;
};

//查询图层详情
function queryLayerDetail(event) {
    var identifyTask = new esri.tasks.IdentifyTask(CityGis.MapServers.DyLayerUrl);//查询  
    var identifyParams = new esri.tasks.IdentifyParameters();//查询参数  
    identifyParams.tolerance = 3;//容差范围  
    identifyParams.returnGeometry = true;//是否返回图形  
    identifyParams.layerIds = queryVisible;//查询图层
    identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;//设置查询的图层  

    identifyParams.geometry = event.mapPoint;
    identifyParams.mapExtent = webgis.doGetMapExtent();
    identifyTask.execute(
            identifyParams,
            function (results) {
                var feature;
                var sGeometry;
                if (results.length > 0) {
                    attobj = results[0].feature.attributes;
                    feature = results[0].feature;
                    //var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
                    var iCount = 0;
                    var infostr = "<div class='' style='text-align:center'><table style='border-collapse:collapse; border-spacing:0px 10px;border='1''>";
                    for (var i in attobj) {
                        if (/^[\u4e00-\u9fa5]+$/.test(i.toString().trim())) {

                            var lblField = i;
                            var lblValue = "";
                            if (attobj[i].toLowerCase() == "null") {
                                lblValue = "";
                            }
                            else {
                                lblValue = attobj[i];
                            }
                            infostr += "<tr style='border-bottom:1px #ddd solid;margin:0px 0;display:block;line-height:30px;'><td style='width:80px'>" + lblField + "</td><td style='width:170px;table-layout: fixed;WORD-BREAK: break-all; WORD-WRAP: break-word'>" + lblValue + "</td></tr>";
                            //infostr += "<tr style='margin-top:10px;'><td style='width:80px'>" + lblField + "</td><td style='width:170px;table-layout: fixed;WORD-BREAK: break-all; WORD-WRAP: break-word'>" + lblValue + "</td></tr>";
                            iCount++;
                        }
                    }
                    infostr += "</table></div>";
                    iHeight = iCount * 10;
                    webgis.doShowInfowindow("资源详情", infostr, identifyParams.geometry, iHeight, 270);
                }
            },
            function (err) {
                alert(err);
            });
}

/*****工具栏*****/
/*****放大、缩小、前一视图、后一视图、全图*****/
function Tools() {
    if ($("#divTools").is(":hidden")) {
        $("#divTools").show()
    }
    else {
        $("#divTools").hide()
    }
    require([
        "esri/map",
        "dojo/on",
        "dojo/dom",
        "dojo/query",
        "esri/toolbars/navigation",
        "esri/dijit/Measurement",
        "esri/units",
        "esri/dijit/HomeButton",
        "esri/geometry/Point",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/graphic",
        "esri/Color",
        "esri/layers/GraphicsLayer",
        "dojo/dom-attr",
        "esri/dijit/Search",
        "dojo/domReady!"
    ], function (Map, on, dom, query, Navigation, Measurement, Units, HomeButton, Point, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Graphic, Color, GraphicsLayer, domAttr, Search) {
        //如果还没有加载地图，则重新加载地图
        if (!map) {
            LoadMap();
        }
        var extentList = [];
        var count = 0;
        dojo.connect(map, "onExtentChange", showExtent);
        function showExtent(extent) {
            console.log("XMin: " + extent.xmin + "\n");
            console.log("YMin: " + extent.ymin + "\n");
            console.log("XMax: " + extent.xmax + "\n");
            console.log("YMax: " + extent.ymax + "\n");
            extentList.push(
                {
                    "xmin": extent.xmin,
                    "ymin": extent.ymin,
                    "xmax": extent.xmax,
                    "ymax": extent.ymax,
                    "spatialReference": { "wkid": 102100 }
                }
            )
            extentList = extentList.slice(-2);
            console.log("extentList", extentList);
        }
        //home按钮
        var home = new HomeButton({
            map: map
        }, "HomeButton");
        home.startup();
        //搜索组件
        var search = new Search({
            map: map
        }, "search");
        search.startup();
        //创建地图操作对象
        var navToolbar = new Navigation(map);
        //给地图添加mouse-drag事件，使count变为0
        on(map, "MouseDrag", function () {
            console.log("wodemap")
            count = 0;
        })
        //给地图添加mouse-drag事件，使count变为0
        on(map, "MouseWheel", function () {
            console.log("wodemap")
            count = 0;
        })
        //给按钮添加绑定事件
        query("button").on("click", function (event) {
            //获得按钮的文本信息
            var value = this.innerHTML;
            switch (value) {
                case "漫游":
                    //默认是漫游操作
                    navToolbar.deactivate();
                    break;
                case "放大":
                    navToolbar.activate(Navigation.ZOOM_IN);
                    break;
                case "缩小":
                    navToolbar.activate(Navigation.ZOOM_OUT);
                    break;
                case "全图":
                    navToolbar.zoomToFullExtent();
                    break;
                case "测量":
                    dom.byId("measurementDiv").style.display = dom.byId("measurementDiv").style.display == "block" ? "none" : "block";
                    query(".dingwei")[0].style.display = "none";
                    navToolbar.deactivate();
                    break;
                case "清除":
                    clearGraphics(map);
                    break;
                case "定位":
                    query(".dingwei")[0].style.display = query(".dingwei")[0].style.display == "block" ? "none" : "block";
                    dom.byId("measurementDiv").style.display = "none";
                    navToolbar.deactivate();
                    break;
                case "坐标查询":
                    gps(map, query, Point, SimpleMarkerSymbol, SimpleLineSymbol, Color, map, Graphic, GraphicsLayer);
                    break;
                case "上一视图":
                    console.log(count)
                    if (count >= 0 && count < extentList.length - 1) {
                        var startExtent = new esri.geometry.Extent(extentList[count]);
                        map.setExtent(startExtent);
                        count++;
                        if (count >= extentList.length - 1) {
                            count = extentList.length - 1;
                        }
                    }
                    break;
                case "下一视图":
                    console.log(count)
                    if (count > 0 && count <= extentList.length - 1) {
                        var startExtent = new esri.geometry.Extent(extentList[count - 1]);
                        map.setExtent(startExtent);
                        count++;
                        if (count >= extentList.length - 1) {
                            count = 0;
                        }
                    }
                    break;
            }
        })
        //测量小工具
        var measurement = new Measurement({
            map: map,
            defaultAreaUnit: Units.SQUARE_KILOMETERS,
            defaultLengthUnit: Units.KILOMETERS
        }, dom.byId("measurementDiv"));
        measurement.startup();
    })
    //定位的代码
    //1.清空Graphics
    function clearGraphics(map) {
        map.graphics.clear();
        var graphicsLayerIds = map.graphicsLayerIds;
        var len = graphicsLayerIds.length;
        for (var i = 0; i < len; i++) {
            var gLayer = map.getLayer(graphicsLayerIds[i]);
            gLayer.clear();
        }
    }
    //2.点击坐标查询按钮，查询，定位点
    function gps(map, query, Point, SimpleMarkerSymbol, SimpleLineSymbol, Color, map, Graphic, GraphicsLayer) {
        //清空graphics
        clearGraphics(map);
        map.infoWindow.hide();//infowindow隐藏
        var px = query("#X")[0].value
        var py = query("#Y")[0].value;
        if (px === "" || py === "") {
            alert("输入的值存在空值！");
            return;
        }
        var x = parseFloat(px);
        var y = parseFloat(py);
        var location = {
            x: x,
            y: y
        }
        location = transform(location);
        var point = new Point(location.x, location.y, map.spatialReference);
        addGraphicsToMap(point, SimpleMarkerSymbol, SimpleLineSymbol, Color, map, Graphic, GraphicsLayer);
        map.centerAndZoom(point, 5);
    }
    //往地图上添加点
    function addGraphicsToMap(geometry, SimpleMarkerSymbol, SimpleLineSymbol, Color, map, Graphic, GraphicsLayer) {
        clearGraphics(map);
        var type = geometry.type;
        var symbol;
        switch (type) {
            case "point":
                symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 15, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1), new Color([255, 0, 0, 0.5]))
        }
        var graphics = map.graphics.add(new Graphic(geometry, symbol))
        var graphicslayer = new GraphicsLayer();
        graphicslayer.add(graphics);
        map.addLayer(graphicslayer);
    }
    //经纬度转墨卡托
    function transform(location) {
        var x = location.x * 20037508.34 / 180;
        var y = Math.log(Math.tan((90 + location.y) * Math.PI / 360)) / (Math.PI / 180);
        y = y * 20037508.34 / 180;
        return {
            x: x,
            y: y
        }
    }
}