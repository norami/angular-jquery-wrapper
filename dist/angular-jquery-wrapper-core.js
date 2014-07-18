/*global angular, jQuery, console*/

/* module jqueryWrapper */

(function (angular, $) {
    'use strict';
    var module = angular.module('jqueryWrapper', []);
    angular.module('jqueryWrapperBuilder', [])
        .service('jqueryWrapperBuilder', function () {
            var registeredSchemas = [];
            function getRegisteredSchemas() {
                return registeredSchemas;
            }
            function addDirective(schema) {
                if (!$.fn[schema.widget]) { return; }
                registeredSchemas.push(schema);
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
                    function convertField(field, options) {
                        field = angular.isString(field) ? {'name': field} : field;
                        field.attrName = [schema.prefix + capitalize(field.name)]
                            .concat(ensureArray(field.attrName) || [])
                            .concat(field.ngModel ? ['ngModel'] : []);
                        if (field.interactive) {
                            field.event = field.event || schema.prefix + field.name;
                        }
                        if (options.param) {
                            field.getparam = field.getparam || options.param.concat([field.name]);
                            field.setparam = field.setparam || options.param.concat([field.name]);
                        }
                        field.getter = field.getter || (field.eventField ?
                                function (element, event, ui) {
                                    return ui[field.eventField];
                                } :
                                function (element, event, ui) {
                                    return element[schema.widget].apply(element, field.getparam);
                                });
                        field.setter = field.setter || function (element, value) {
                            element[schema.widget].apply(element, field.setparam.concat([value]));
                        };
                        field.type = options.type;
                        if (field.type === 'option') {
                            field.static = field.hasOwnProperty('static') ? field.static : schema.static;
                        }
                        return field;
                    }
                    function fieldToHandler(field, attrName) {
                        if (field.type === 'event') {
                            return function eventHandler(accessor, initialOptions, element, scope, ngModel) {
                                /* event */
                                element.on(field.event, function (event, ui) {
                                    accessor(scope)(event, ui);
                                });
                            };
                        }
                        if (attrName === 'ngModel') {
                            return function ngModelHandler(accessor, initialOptions, element, scope, ngModel) {
                                /* initial options*/
                                if (field.type === 'option') {
                                    initialOptions[field.name] = ngModel.$viewValue;
                                }
                                /* model -> view */
                                if (!field.static) {
                                    ngModel.$render = function () {
                                        field.setter(element, ngModel.$modelValue);
                                    };
                                }
                                /* view -> model */
                                if (field.interactive) {
                                    element.on(field.event, function (event, ui) {
                                        ngModel.$setViewValue(field.getter(element, event, ui));
                                        if (!scope.$$phase) { scope.$apply(); }
                                    });
                                }
                            };
                        }
                        return function valueHandler(accessor, initialOptions, element, scope, ngModel) {
                            /* initial options*/
                            if (field.type === 'option') {
                                initialOptions[field.name] = accessor(scope);
                            }
                            /* model -> view */
                            if (!field.static) {
                                scope.$watch(accessor, function (val) {
                                    field.setter(element, val);
                                }, true);
                            }
                            /* view -> model */
                            if (field.interactive) {
                                element.on(field.event, function (event, ui) {
                                    accessor.assign(scope, field.getter(element, event, ui));
                                    if (!scope.$$phase) { scope.$apply(); }
                                });
                            }
                        };
                    }
                    var convertedFields = $.map({
                            method: {
                                param: [],
                                type: 'method'
                            },
                            option: {
                                param: ['option'],
                                type: 'option'
                            },
                            event: {
                                type: 'event'
                            }
                        }, function (parseOption, parseKey, map) {
                            return $.map(schema[parseKey] || [], function (field) {
                                return convertField(field, parseOption);
                            });
                        }),
                        ngModelSelectorAttrName = schema.prefix + 'NgModel',
                        ngModelHandlerMap = {},
                        handlerMap = {};
                    angular.forEach(convertedFields, function (field, i) {
                        angular.forEach(field.attrName, function (attrName) {
                            if (attrName === 'ngModel') {
                                ngModelHandlerMap[field.name] = fieldToHandler(field, attrName);
                            } else {
                                handlerMap[attrName] = fieldToHandler(field, attrName);
                            }
                        });
                    });
                    return {
                        restrict: 'EA',
                        require: '?ngModel',
                        compile: function (element, attr) {
                            var accessors = {};
                            angular.forEach(attr, function (exp, attrName) {
                                if (!handlerMap[attrName]) { return; }
                                accessors[attrName] = $parse(exp);
                            });
                            return function (scope, element, attr, ngModel) {
                                var initialOptions = angular.copy(schema.initialOptions || {}),
                                    ngModelFieldName,
                                    ngModelHandler;
                                angular.forEach(accessors, function (accessor, attrName) {
                                    var handler = handlerMap[attrName];
                                    handler(accessor, initialOptions, element, scope, ngModel);
                                });
                                if (ngModel) {
                                    ngModelFieldName = attr[ngModelSelectorAttrName] || schema.ngModelFieldName;
                                    ngModelHandler = ngModelHandlerMap[ngModelFieldName];
                                    if (ngModelHandler) {
                                        ngModelHandler(null, initialOptions, element, scope, ngModel);
                                    } else if (attr[ngModelSelectorAttrName]) {
                                        throw 'field ' + ngModelFieldName + ' is not defined';
                                    }
                                }
                                element[schema.widget](initialOptions);
                                element.on(schema.on);
                            };
                        }
                    };
                }]);
            }
            function addDirectives(schemas) {
                angular.forEach(schemas, function (schema) {
                    addDirective(schema);
                });
            }
            return {
                getRegisteredSchemas: getRegisteredSchemas,
                addDirective: addDirective,
                addDirectives: addDirectives,
                module: module
            };
        });
}(angular, jQuery));
