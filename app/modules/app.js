/* global requirejs */

'use strict';
exports.driveshareApp = angular.module('driveshareApp').controller('drivesController', [
	'$scope', function($scope){
		// Read all available tabs from config
		$scope.drives = [];
		$scope.numberOfDrives = $scope.drives.length - 1;
		if ($scope.drives.length <= 0) {
			$scope.numberOfDrives = 1;
		}

		var firstTab = {tabName: 'Disk #' + $scope.numberOfDrives}
		var secondTab = {tabName: 'Disk #' + $scope.numberOfDrives++}

		$scope.push(firstTab);
		$scope.push(secondTab);
	}
]);