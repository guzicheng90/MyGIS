// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/3.16/esri/copyright.txt for details.
//>>built
define("esri/arcade/Dictionary",["require","exports"],function(e,f){return function(){function b(a){this.attributes=null;this.plain=!1;this.attributes=a instanceof b?a.attributes:void 0===a?{}:null===a?{}:a}b.prototype.field=function(a){var c=a.toLowerCase();a=this.attributes[a];if(void 0!==a)return a;for(var b in this.attributes)if(b.toLowerCase()===c)return this.attributes[b];throw Error("Field not Found");};b.prototype.hasField=function(a){var b=a.toLowerCase();if(void 0!==this.attributes[a])return!0;
for(var d in this.attributes)if(d.toLowerCase()===b)return!0;return!1};b.prototype.keys=function(){var a=[],b;for(b in this.attributes)a.push(b);return a=a.sort()};return b}()});