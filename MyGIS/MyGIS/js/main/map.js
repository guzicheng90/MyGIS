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
            var points = new Point(0, 0, map.spatialReference);
            var polylines = [new Polyline([[500, 500], [2000, 2000]])];
            var polygons = [new Polygon([[3000, 3000], [-1000, -2000], [2000, 3000]])];
            //var points = [new Point(116.026, 28.6826), new Point(116.05, 28.66), new Point(116.11, 28.70), new Point(115.95, 28.65)];
            //var polylines = [new Polyline([[115.88, 28.70], [115.88, 28.67]]), new Polyline([[115.82, 28.64], [115.89, 28.59]])];
            //var polygons = [new Polygon([[115.798499, 28.783553], [115.75998, 28.895433], [115.900834, 28.821535], [115.785276, 28.759237], [115.713987, 28.733902]])];

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
                    map.graphics.add(new Graphic(points[i], markerSymbol));
                }
                for (var i = 0; i < polylines.length; i++) {
                    map.graphics.add(new Graphic(polylines[i], lineSymbol));
                }
                for (var i = 0; i < polygons.length; i++) {
                    map.graphics.add(new Graphic(polygons[i], fillSymbol));
                }
                // 点缓冲区
                var pointParams = new BufferParameters();
                pointParams.geometries = points;
                pointParams.distances = [300];
                //pointParams.unit = GeometryService.UNIT_KILOMETER;
                //pointParams.bufferSpatialReference = map.spatialReference;
                pointParams.outSpatialReference = map.spatialReference;
                geometryService.buffer(pointParams, function (features) {
                    var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol("solid", new Color([197, 97, 20]), 1),
                        new Color([0, 255, 0, 1]));

                    for (var i = 0; i < features.length; i++) {
                        console.log(features[i]);
                        map.graphics.add(new Graphic(features[i], symbol))
                    }
                });

                // 线缓冲区
                var polyineParams = new BufferParameters();
                polyineParams.geometries = polylines;
                polyineParams.distances = [300];
                polyineParams.unit = GeometryService.UNIT_KILOMETER;
                polyineParams.bufferSpatialReference = new SpatialReference({ wkid: 32662 }); //map.spatialReference;
                polyineParams.outSpatialReference = map.spatialReference;

                geometryService.buffer(polyineParams, function (features) {
                    var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol("solid", new Color([197, 97, 20]), 1),
                        new Color([0, 255, 0, 1]));

                    for (var i = 0; i < features.length; i++) {
                        console.log(features[i]);
                        map.graphics.add(new Graphic(features[i], symbol))
                    }
                });
                // 面缓冲区
                var polygonParams = new BufferParameters();
                polygonParams.geometries = polygons;
                polygonParams.geodesic = true;
                polygonParams.distances = [333];
                polygonParams.unit = GeometryService.UNIT_KILOMETER;
                polygonParams.bufferSpatialReference = new SpatialReference({ wkid: 32662 }); //map.spatialReference;
                polygonParams.outSpatialReference = map.spatialReference;

                geometryService.buffer(polygonParams, function (features) {
                    var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol("solid", new Color([197, 97, 20]), 1),
                        new Color([0, 255, 0, 1]));

                    for (var i = 0; i < features.length; i++) {
                        console.log(features[i]);
                        map.graphics.add(new Graphic(features[i], symbol))
                    }
                });

            })

        });
}