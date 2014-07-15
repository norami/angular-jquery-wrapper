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
                    function parseFields(fields) {
                        return $.map(fields || [], function (field) {
                            field = angular.isString(field) ?  {'name': field} : field;
                            field.attrName = [schema.prefix + capitalize(field.name)].concat(ensureArray(field.attrName) || []);
                            field.event = field.event || schema.prefix + field.name;
                            return [field];
                        });
                    }
                    function firstElement(dict, keys) {
                        keys = ensureArray(keys);
                        var value = null, i;
                        for (i = 0; i < keys.length; i++) {
                            value = dict[keys[i]];
                            if (value) {
                                return value;
                            }
                        }
                        return value;
                    }
                    var
                        method = parseFields(schema.method),
                        option = parseFields(schema.option),
                        event = parseFields(schema.event),
                        interactiveOption = $.map(option, function (o) {return o.interactive ? [o] : null; }),
                        interactiveMethod = $.map(method, function (o) {return o.interactive ? [o] : null; });
                    return {
                        restrict: 'EA',
                        compile: function (element, attr) {
                            var fieldAccess = {};
                            angular.forEach([].concat(method, option, event), function (field) {
                                var fieldExp = firstElement(attr, field.attrName);
                                if (!fieldExp) {
                                    return;
                                }
                                fieldAccess[field.name] = $parse(fieldExp);
                            });
                            return function (scope) {
                                var options = {};
                                angular.forEach(option, function (field) {
                                    var fieldExp = firstElement(attr, field.attrName);
                                    if (!fieldExp) {
                                        return;
                                    }
                                    scope.$watch(fieldExp, function (newVal) {
                                        element[schema.widget]('option', field.name, newVal);
                                    }, true);
                                    options[field.name] = fieldAccess[field.name](scope);
                                });
                                element[schema.widget](options);
                                angular.forEach(method, function (field) {
                                    var fieldExp = firstElement(attr, field.attrName);
                                    if (!fieldExp) {
                                        return;
                                    }
                                    scope.$watch(fieldExp, function (newVal) {
                                        element[schema.widget](field.name, newVal);
                                    }, true);
                                });
                                angular.forEach(interactiveOption, function (field) {
                                    if (!fieldAccess[field.name]) {
                                        return;
                                    }
                                    element.on(field.event, function (event, ui) {
                                        scope.$apply(function () {
                                            var value = field.get ? field.get(element, schema, event, ui) : (
                                                field.eventField ? ui[field.eventField] : (
                                                    element[schema.widget]('option', field.name)
                                                )
                                            );
                                            fieldAccess[field.name].assign(scope, value);
                                        });
                                    });
                                });
                                angular.forEach(interactiveMethod, function (field) {
                                    if (!fieldAccess[field.name]) {
                                        return;
                                    }
                                    element.on(field.event, function (event, ui) {
                                        scope.$apply(function () {
                                            var value = field.get ? field.get(element, schema, event, ui) : (
                                                field.eventField ? ui[field.eventField] : (
                                                    element[schema.widget]('option', field.name)
                                                )
                                            );
                                            fieldAccess[field.name].assign(scope, value);
                                        });
                                    });
                                });
                                angular.forEach(event, function (field) {
                                    if (!fieldAccess[field.name]) {
                                        return;
                                    }
                                    element.on(field.event, function (event, ui) {
                                        fieldAccess[field.name](scope)(event, ui);
                                    });
                                });
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
