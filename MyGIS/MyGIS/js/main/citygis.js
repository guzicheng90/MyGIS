/**
 * Created by dean on 2016/11/11.
 */
(function ($) {
    $.fn.extend({
        roll: function (options) {
            var defaults = {
                speed: 1
            };
            var options = $.extend(defaults, options);
            var speed = (document.all) ? options.speed : Math.max(1, options.speed - 1);
            if ($(this) == null) return;
            var $container = $(this);
            var $content = $("#content");
            var init_left = $container.width();
            $content.css({ left: parseInt(init_left) + "px" });
            var This = this;
            var time = setInterval(function () { This.move($container, $content, speed); }, 20);

            $container.bind("mouseover", function () {
                clearInterval(time);
            });
            $container.bind("mouseout", function () {
                time = setInterval(function () { This.move($container, $content, speed); }, 20);
            });

            return this;
        },
        move: function ($container, $content, speed) {
            var container_width = $container.width();
            var content_width = $content.width();
            if (parseInt($content.css("left")) + content_width > 0) {
                $content.css({ left: parseInt($content.css("left")) - speed + "px" });
            }
            else {
                $content.css({ left: parseInt(container_width) + "px" });
            }
        }
    });
})(jQuery);

$(function(){
    $("#container").roll({ speed: 1 });

    doQueryStatistic();
})

function doQueryStatistic(){
    var myChart1 = echarts.init(document.getElementById('div_yjwz'));
    var myChart2 = echarts.init(document.getElementById('div_yjdw'));


    var option1 = {
        title : {
            text: "应急物资统计",
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        series : [
            {
                name: '资源大类',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data:[
                    {value:335, name:'现场管理与保障'},
                    {value:310, name:'生命救援与生活救助'},
                    {value:234, name:'工程抢险与专业处置'},
                    {value:135, name:'紧急运输保障'},
                    {value:1548, name:'紧急医疗救护'}
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };


    var option2 = {
        title : {
            text: "应急预案统计",
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        series : [
            {
                name: '预案类型',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data:[
                    {value:1, name:'总体预案'},
                    {value:25, name:'专项预案'},
                    {value:20, name:'部门预案'},
                    {value:2, name:'重点单位预案'},
                    {value:15, name:'其他'}
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    myChart1.setOption(option1);
    myChart2.setOption(option2);
}
