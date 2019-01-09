/* --------------------------------地图初始信息配置-------------------------------- */
function MapConfig() { }
MapConfig.mapInitParams = {
  fullExtent: {//全图范围
      xmin: -37178.98390765229,
      ymin: -46773.06051696642,
      xmax: 59896.83524398603,
      ymax: 21965.82696080855
  },
  extent: {//初始化范围
      xmin: -51744.325538335564,
      ymin: -46773.06051696643,
      xmax: 74462.1768746693,
      ymax: 21965.82696080856
  },
  spatialReference: {//地图空间参考坐标系
      wkid: 2379
  },
  lods: [//针对瓦片的地图服务的,用来控制瓦片级别的显示，有时候切片级别太多的话，可以只显示部分的级别地图
         //resolution scale这些值的获取参照发布的切片地图服务详情
         { "level": 0, "resolution": 224.8962831258996, "scale": 850000 },
         { "level": 1, "resolution": 119.06273812547626, "scale": 450000 },
         { "level": 2, "resolution": 66.1459656252646, "scale": 250000 },
         { "level": 3, "resolution": 39.687579375158755, "scale": 150000 },
         { "level": 4, "resolution": 26.458386250105836, "scale": 100000 },
         { "level": 5, "resolution": 15.875031750063501, "scale": 60000 },
         { "level": 6, "resolution": 10.583354500042335, "scale": 40000 },
         { "level": 7, "resolution": 5.291677250021167, "scale": 20000 },
         { "level": 8, "resolution": 2.910422487511642, "scale": 11000 },
         { "level": 9, "resolution": 1.8520870375074086, "scale": 7000 },
         { "level": 10, "resolution": 0.9260435187537043, "scale": 3500 },
         { "level": 11, "resolution": 0.39687579375158755, "scale": 1500 },
         { "level": 12, "resolution": 0.18520870375074083, "scale": 700 },
         { "level": 13, "resolution": 0.13229193125052918, "scale": 500 }
  ]
}
/*地图调用*/
//MapConfig.vecMapUrl = "http://10.231.9.139/ArcGIS/rest/services/pdyj/MapServer";//ArcGIS动态服务
//MapConfig.imgMapUrl = "http://172.20.97.108:6080/arcgis/rest/services/PDGIS/PDYJDP/MapServer";
MapConfig.vecMap = { Url: "http://10.231.9.139/ArcGIS/rest/services/pdyj/MapServer" };//ArcGIS动态服务
MapConfig.imgMap = { Url: "http://172.20.97.108:6080/arcgis/rest/services/PDGIS/PDYJDP/MapServer", LabelUrl: "", type: 1 };//ArcGIS切图服务
//Geometry服务
MapConfig.GeometryService = { Url: "http://10.231.9.139/ArcGIS/rest/services/Geometry/GeometryServer" };