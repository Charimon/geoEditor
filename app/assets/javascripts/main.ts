/// <reference path="./geo.d.ts" />

module service {
  export class FileService {
    private getFilePromise = null
    constructor(private $http: ng.IHttpService, private $timeout: ng.ITimeoutService, private Feature) {}

    private loadSeattle() {
      return this.$http.get("/assets/data/seattle_hoods.json").then((response: ng.IHttpPromiseCallbackArg<any>) => {
        return this.Feature.promiseFrom(response.data.features.slice(0, 40));
      });
    }

    getFile() {
      if (this.getFilePromise != null) return this.getFilePromise;
      else {
        this.getFilePromise = this.$timeout(() => {
          return this.loadSeattle();
        }, 1000);
        return this.getFilePromise;
      }
    }
  }
}

module controllers {
  export interface NameUtilitiesStateParams extends ng.ui.IStateParamsService {
    id: number
  }

  export class OverviewNavigatorController {
    features: any

    constructor(private FileService) {
      this.FileService.getFile().then((features) => {
        this.features = features;
      });
    }
  }

  export class NameUtilitiesController {
    active: boolean;
    feature: any;

    constructor(private FileService, private $stateParams: NameUtilitiesStateParams) {
      FileService.getFile().then((features: any[]) => {
        return features.filter((feature) => {
          return feature.properties.NEIGH_NUM == this.$stateParams.id;
        })[0];
      }).then((feature) => {
        this.feature = feature;
      });
    }
  }

  export class MapController {
    features: any[];
    center: any;

    styles: any = [
      { "elementType": "geometry", "stylers": [{ "saturation": -100 }] },
      { "featureType": "road.highway", "stylers": [{ "visibility": "off" }] },
      { "featureType": "road.arterial", "stylers": [{ "visibility": "off" }] },
      { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "off" }] },
      { "featureType": "transit.line", "stylers": [{ "visibility": "off" }] }
    ];

    constructor(private FileService, private MapHelper, private $stateParams, private $state) {
      this.FileService.getFile().then((features) => {
        this.features = features;

        MapHelper.fitBounds(features);
      });
    }

    centerZoomSelected() {
      this.$state;
    }

    centerSelected() {
      this.$state;
    }
  }
}

angular.module("app", ['ngAnimate', 'ui.router', 'map'])
  .controller('NameUtilitiesController', controllers.NameUtilitiesController)
  .controller('OverviewNavigatorController', controllers.OverviewNavigatorController)
  .controller('MapController', controllers.MapController)
  .service("FileService", service.FileService)
  .config(($stateProvider, $urlRouterProvider) => {
    $urlRouterProvider.otherwise("/");
    $stateProvider
      .state('map', {
        templateUrl: '/assets/templates/map.tpl.html',
        controller: "MapController",
        controllerAs: 'map',
        abstract: true
      })
      .state('map.list', {
        url: "/",
        views: {
          navigator: {
            templateUrl: '/assets/templates/overviewNavigator.tpl.html',
            controller: "OverviewNavigatorController",
            controllerAs: 'overviewNavigator'
          }
        }
      })
      .state('map.feature', {
        url: "/:id",
        views: {
          navigator: {
            templateUrl: '/assets/templates/overviewNavigator.tpl.html',
            controller: "OverviewNavigatorController",
            controllerAs: 'overviewNavigator'
          },
          utilities: {
            templateUrl: '/assets/templates/nameUtilities.tpl.html',
            controller: "NameUtilitiesController",
            controllerAs: 'nameUtilities'
          }
        }
      })
  });