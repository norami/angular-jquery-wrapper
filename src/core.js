/*global angular, jQuery, console*/

/* module jqueryWrapper */

(function (angular, $) {
    'use strict';
    angular.module('jqueryWrapper', [])
        .service('jqueryWrapper', function () {
            function addDirective(module, schema) {
                module.directive(schema.prefix, ['$parse', function ($parse) {
                    function capitalize(str) {
                        return str.charAt(0).toUpperCase() + str.slice(1);
                    }
                    function ensureArray(obj) {
                        if (obj === null || obj === undefined) {
                            return obj;
                        }
                        return $.isArray(obj) ? obj : [obj];
                    }
                    function parseFields(fields, options) {
                        return $.map(fields || [], function (field) {
                            field = angular.isString(field) ?  {'name': field} : field;
                            field.attrName = [schema.prefix + capitalize(field.name)].concat(ensureArray(field.attrName) || []);
                            if (field.interactive) {
                                field.event = field.event || schema.prefix + field.name;
                            }
                            if (options.param) {
                                field.getparam = field.getparam || options.param.concat([field.name]);
                                field.setparam = field.setparam || options.param.concat([field.name]);
                            }
                            field.type = options.type;
                            return [field];
                        });
                    }
                    function firstElement(dict, keys) {
                        keys = ensureArray(keys);
                        var value = null, i;
                        for (i = 0; i < keys.length; i += 1) {
                            value = dict[keys[i]];
                            if (value) {
                                return value;
                            }
                        }
                        return value;
                    }
                    var
                        method = parseFields(schema.method, {param: [], type: 'method'}),
                        option = parseFields(schema.option, {param: ['option'], type: 'option'}),
                        event = parseFields(schema.event, {type: 'event'});
                    console.log('attrMap', schema.widget, attrMap);
                    return {
                        restrict: 'EA',
                        require: '?ngModel',
                        compile: function (element, attr) {
                            var accessors = {};
                            angular.forEach([].concat(method, option, event), function (field) {
                                var fieldExp = firstElement(attr, field.attrName);
                                if (!fieldExp) {
                                    return;
                                }
                                accessors[field.name] = $parse(fieldExp);
                            });
                            return function (scope, element, attr, ngModel) {
                                var initialOptions = angular.copy(schema.initialOptions || {});
                                angular.forEach([].concat(option, method), function (field) {
                                    var accessor = accessors[field.name];
                                    if (!accessor && (!field.ngModel || !ngModel)) { return; }
                                    /* initial options*/
                                    if (field.type === 'option') {
                                        if (field.ngModel && ngModel) {
                                            initialOptions[field.name] = ngModel.$viewValue;
                                        } else {
                                            initialOptions[field.name] = accessor(scope);
                                        }
                                    }
                                    /* model -> view */
                                    console.log(field, ngModel);
                                    if (field.ngModel && ngModel) {
                                        console.log('ngModel');
                                        ngModel.$render = function () {
                                            element[schema.widget].apply(element, field.setparam.concat([ngModel.$viewValue]));
                                        };
                                    } else {
                                        scope.$watch(accessor, function (newVal) {
                                            element[schema.widget].apply(element, field.setparam.concat([newVal]));
                                        }, true);
                                    }
                                    /* view -> model */
                                    if (field.interactive) {
                                        element.on(field.event, function (event, ui) {
                                            scope.$apply(function () {
                                                var value = field.get ? field.get(element, schema, event, ui) : (
                                                    field.eventField ? ui[field.eventField] : (
                                                        element[schema.widget].apply(element, field.getparam)
                                                    )
                                                );
                                                if (field.ngModel && ngModel) {
                                                    ngModel.$setViewValue(value);
                                                } else {
                                                    accessor.assign(scope, value);
                                                }
                                            });
                                        });
                                    }
                                });
                                angular.forEach(event, function (field) {
                                    var accessor = accessors[field.name];
                                    if (!accessor) { return; }
                                    /* event */
                                    element.on(field.event, function (event, ui) {
                                        accessor(scope)(event, ui);
                                    });
                                });
                                element[schema.widget](initialOptions);
                            };
                        }
                    };
                }]);
            }
            function addDirectives(module, schemas) {
                angular.forEach(schemas, function (schema) {
                    addDirective(module, schema);
                });
            }
            return {
                addDirective: addDirective,
                addDirectives: addDirectives
            };
        });
}(angular, jQuery));
