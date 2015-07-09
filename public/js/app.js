var quoteApp = angular.module("quoteApp", ['ngRoute', 'eCatAPI']);

quoteApp.run(function($rootScope, $location, $http) {
		$rootScope.settings = {};
		$rootScope.settings.tryLogin = false;

		eCatAPI_Init({
			apiURL: "/Service/JSON",
			startDelay: function(callType, message) {

			
			},
			endDelay: function(callType) {

			},
			alert: function(code, message) {
				$rootScope.Alert = message;
			},
			alertReset: function(code, message) {
				$rootScope.Alert = "";
			}
		});

	})
	.config(function($routeProvider, $locationProvider) {
		$routeProvider
			.when("/upload/:quote_number", {
				templateUrl: "upload/upload.html",
				controller: "UploadController"
			})
			.otherwise({
				redirectTo: "/upload"
			});
	});

quoteApp.controller("UploadController", function($scope, $rootScope, $http, $location, $routeParams) {
	
	var canvas = document.getElementById('imgCanvas');
    delete $scope.currentImage;
    $scope.percent = 70;
	$scope.requestQuote = $routeParams.quote_number;
	$scope.imageSaved = false;
	
	
    var image = new Image();
	image.onload = function () {
		drawImageScaled(image,canvas,$scope.percent);
	}
	


	function readURL(input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function(e) {
				$scope.currentImage = e.target.result;
				image.src = $scope.currentImage;
				$scope.percent = 70;
				$scope.$apply();
				$scope.imageSaved = false;
				
			}
			reader.readAsDataURL(input.files[0]);
		}
	}

	$("#imgInp")
		.change(function() {
			readURL(this);
		});

	eCatAPI_LoadJSON("BCWQUOTE", $scope.requestQuote, null,
		function(data, status, headers, config) {
			$scope.quote = data.quote[0];
			eCatAPI_LoadJSON("BCWLABELSIMAGES", $scope.quote.product.id, null,
			function(data, status, headers, config) {
				$scope.currentImage = data.images[0].image;
				image.src = "data:image/png;base64," + $scope.currentImage;
				$scope.percent = 100;
				$scope.$apply();
				$scope.imageSaved = true;
			} );
		},
		function(data, status, headers, config) {
			$rootScope.Alert ="Unable to Find Items";
		});
		
	$scope.increaseSize = function(){
		$scope.percent +=2;
		if ($scope.percent > 200 ) {$scope.percent = 200;}
		drawImageScaled(image,canvas,$scope.percent);
		$scope.imageSaved = false;
	}
    $scope.decreaseSize = function(){
		$scope.percent -=2;
		if ($scope.percent < 10 ) {$scope.percent = 10;}
		drawImageScaled(image,canvas,$scope.percent);
		$scope.imageSaved = false;
	}

	$scope.saveImage = function(){

		imgobj={}
		imgobj.id = $scope.quote.product.id;
		imgobj.image = canvas.toDataURL('image/png').substring(22);
		
		data={}
		data.images=[];
		data.images.push(imgobj);
		pdata = JSON.stringify(data);
		
		eCatAPI_SaveJSON("BCWLABELSIMAGES", 'NEW', {}, pdata,
		function(data, status, headers, config) {
			$scope.imageSaved = true;
		},
		function(data, status, headers, config) {
			$scope.imageSaved = false;
		});
		
	}
});

function drawImageScaled(img, canvas, percent) {
   var ctx = canvas.getContext('2d'); 	
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   var hRatio = (canvas.width * (percent/100))  / img.width    ;
   var vRatio =  (canvas.height * (percent/100)) / img.height  ;
   var ratio  = Math.min ( hRatio, vRatio );
   var centerShift_x = ( canvas.width - img.width*ratio ) / 2;
   var centerShift_y = ( canvas.height - img.height*ratio ) / 2;  
   ctx.clearRect(0,0,canvas.width, canvas.height);
   ctx.drawImage(img, 0,0, img.width, img.height,
                      centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);  
}