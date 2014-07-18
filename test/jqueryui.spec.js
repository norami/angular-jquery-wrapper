/*global describe, beforeEach, afterEach, it, inject, expect, module, dump, $*/

describe('jqueryWrapper', function () {
    'use strict';

    beforeEach(module('jqueryWrapper'));
    describe('simple use on input element', function () {
        it('should have a date picker attached', function () {
            inject(function ($compile, $rootScope, $timeout) {
                var element = $compile('<input ng-model="datepickerData" jqw-datepicker jqw-datepicker-date-format="\'yy/mm/dd\'"/>')($rootScope);
                expect(element.datepicker).toBeDefined();
            });
        });
        it('should be able to get the date from the model', function () {
            inject(function ($compile, $rootScope, $timeout) {
                var element = $compile('<input ng-model="datepickerData" jqw-datepicker jqw-datepicker-date-format="\'yy/mm/dd\'"/>')($rootScope);
                $rootScope.$apply(function () {
                    $rootScope.datepickerData = '2013/05/03';
                });
                expect(element.datepicker('getDate')).toEqual($.datepicker.parseDate('yy/mm/dd', '2013/05/03'));
            });
        });
        it('should put the date in the model', function () {
            inject(function ($compile, $rootScope, $timeout) {
                var element = $compile('<input ng-model="datepickerData" jqw-datepicker jqw-datepicker-date-format="\'yy/mm/dd\'"/>')($rootScope);
                $rootScope.$apply(function () {
                    element.datepicker('setDate', $.datepicker.parseDate('yy/mm/dd', '2013/05/03'));
                    element.trigger('change');
                });
                expect($rootScope.datepickerData).toEqual('2013/05/03');
            });
        });
    });
});
