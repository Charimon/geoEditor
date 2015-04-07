(function(){
  'use strict';

  angular.module("app", ['ngAnimate', 'ngNewRouter', 'map'])
    .config(function($componentLoaderProvider){ $componentLoaderProvider.setTemplateMapping(function(name){ return "/assets/templates/" + name + ".tpl.html"; }); })
    .service("FileService", FileService)
    .controller("AppController", AppController)
    .controller("MapController", MapController)
    .controller("OverviewNavigatorController", OverviewNavigatorController);


  AppController.$inject = ['$router'];
  MapController.$inject = ['FileService'];
  OverviewNavigatorController.$inject = ['FileService'];
  FileService.$inject = ['$timeout', '$q', '$http', 'Feature'];


  function AppController($router){
    $router.config([
      {path:"/", components:{
        editor:'map',
        navigator:'overviewNavigator'
      }}
    ]);
  }

  function MapController(FileService){
    var self = this;

    this.styles = [
      {"elementType": "geometry", "stylers": [ { "saturation": -100 } ]},
      {"featureType": "road.highway", "stylers": [ { "visibility": "off" } ]},
      {"featureType": "road.arterial","stylers": [ { "visibility": "off" } ]},
      {"featureType": "poi","elementType": "labels","stylers": [ { "visibility": "off" } ]},
      {"featureType": "transit.line", "stylers": [ { "visibility": "off" } ]}
    ];

    FileService.getFile().then(function(features){
      self.features = features;
    });
  }

  function OverviewNavigatorController(FileService){
    var self = this;
    FileService.getFile().then(function(features){
      self.features = features;
    });
  }

  function FileService($timeout, $q, $http, Feature){

    var _loadSeattle = function(){
      return $http.get("/assets/data/seattle_hoods.json").then(function(response){
        return Feature.promiseFrom(response.data.features.slice(0,10));
      });
    };

    var _getFilePromise = null;
    this.getFile = function(){
      if(_getFilePromise != null) return _getFilePromise;
      else {
        _getFilePromise = $timeout(function(){
          return _loadSeattle();
        }, 1000);
        return _getFilePromise;
      }
    };
  }

})();