var app = angular.module('app', ['ngCookies', 'ngAnimate', 'ui.bootstrap','ngRoute', 'chart.js','ngTable']).config(function ($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
    $httpProvider.defaults.withCredentials = true;
});