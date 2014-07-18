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

/*global angular, jQuery, console */

(function (angular, $) {
    'use strict';
    var schemas = [
            {
                'widget': 'accordion',
                'prefix': 'jqwAccordion',
                'ngModelFieldName': 'active',
                'option': [
                    'active',
                    'collapsible',
                    'disabled',
                    'event',
                    'header',
                    'heightStyle',
                    'icons',
                    {
                        interactive: true,
                        name: 'active',
                        event: 'accordionactivate',
                        ngModel: true
                    }
                ],
                'event': [
                    "activate",
                    "beforeActivate",
                    "create"
                ]
            },
            {
                'widget': 'autocomplete',
                'prefix': 'jqwAutocomplete',
                'option': [
                    'appendTo',
                    'autoFocus',
                    'delay',
                    'disabled',
                    'minLength',
                    'position',
                    'source'
                ],
                event: [
                    "change",
                    "close",
                    "create",
                    "focus",
                    "open",
                    "response",
                    "search",
                    "select"
                ]
            },
            {
                'widget': 'button',
                'prefix': 'jqwButton',
                'option': [
                    'disabled',
                    'icons',
                    'label',
                    'text'
                ],
                'event': [
                    "create"
                ]
            },
            {
                'widget': 'datepicker',
                'prefix': 'jqwDatepicker',
                'option': [
                    "altField",
                    "altFormat",
                    "appendText",
                    "autoSize",
                    "beforeShow",
                    "beforeShowDay",
                    "buttonImage",
                    "buttonImageOnly",
                    "buttonText",
                    "calculateWeek",
                    "changeMonth",
                    "changeYear",
                    "closeText",
                    "constrainInput",
                    "currentText",
                    "dateFormat",
                    "dayNames",
                    "dayNamesMin",
                    "dayNamesShort",
                    "defaultDate",
                    "duration",
                    "firstDay",
                    "gotoCurrent",
                    "hideIfNoPrevNext",
                    "isRTL",
                    "maxDate",
                    "minDate",
                    "monthNames",
                    "monthNamesShort",
                    "navigationAsDateFormat",
                    "nextText",
                    "numberOfMonths",
                    "prevText",
                    "selectOtherMonths",
                    "shortYearCutoff",
                    "showAnim",
                    "showButtonPanel",
                    "showCurrentAtPos",
                    "showMonthAfterYear",
                    "showOn",
                    "showschema",
                    "showOtherMonths",
                    "showWeek",
                    "stepMonths",
                    "weekHeader",
                    "yearRange",
                    "yearSuffix"
                ],
                method: [
                    {
                        interactive: true,
                        name: 'date',
                        getparam: ['getDate'],
                        setparam: ['setDate'],
                        event: 'jqwdatepickerchange'
                    }
                ],
                on: {
                    'change': function () {
                        $(this)
                            .trigger('jqwdatepickerchange');
                    }
                },
                initialOptions: {
                    onSelect: function () {
                        $(this)
                            .trigger('jqwdatepickerselect')
                            .trigger('change')/* default behaviour of onSelect*/
                            .blur();
                    },
                    onClose: function () {
                        $(this).trigger('jqwdatepickerclose');
                    },
                    onChangeMonthYearType: function () {
                        $(this).trigger('jqwdatepickerchangemonthyeartype');
                    }
                }
            },
            {
                'widget': 'dialog',
                'prefix': 'jqwDialog',
                'option': [
                    "appendTo",
                    "autoOpen",
                    "buttons",
                    "closeOnEscape",
                    "closeText",
                    "dialogClass",
                    "draggable",
                    "height",
                    "hide",
                    "maxHeight",
                    "maxWidth",
                    "minHeight",
                    "minWidth",
                    "modal",
                    "position",
                    "resizable",
                    "show",
                    "title",
                    "width"
                ],
                'event': [
                    "beforeClose",
                    "close",
                    "create",
                    "drag",
                    "dragStart",
                    "dragStop",
                    "focus",
                    "open",
                    "resize",
                    "resizeStart",
                    "resizeStop"
                ]
            },
            {
                'widget': 'menu',
                'prefix': 'jqwMenu',
                'option': [
                    "disabled",
                    "icons",
                    "menus",
                    "position",
                    "role"
                ],
                'event': [
                    "blur",
                    "create",
                    "focus",
                    "select"
                ]
            },
            {
                'widget': 'progressbar',
                'prefix': 'jqwProgressbar',
                'option': [
                    'disabled',
                    'max',
                    'value'
                ],
                'event': [
                    "change",
                    "complete",
                    "create"
                ]
            },
            {
                'widget': 'selectmenu',
                'prefix': 'jqwSelectmenu',
                'option': [
                    'appendTo',
                    'disabled',
                    'icons',
                    'position',
                    'width'
                ],
                'event': [
                    "change",
                    "close",
                    "create",
                    "focus",
                    "open",
                    "select"
                ]
            },
            {
                'widget': 'spinner',
                'prefix': 'jqwSpinner',
                'ngModelFieldName': 'value',
                'option': [
                    "culture",
                    "disabled",
                    "icons",
                    "incremental",
                    {
                        'name': "max",
                        'attrName': "max"/*polyfill*/
                    },
                    {
                        'name': "min",
                        'attrName': "min"/*polyfill*/
                    },
                    {
                        'name': "step",
                        'attrName': "step"/*polyfill*/
                    },
                    "numberFormat",
                    "page"
                ],
                method: [
                    {
                        interactive: true,
                        name: 'value',
                        event: 'change spin',
                        eventField: 'value',
                        ngModel: true
                    }
                ],
                event: [
                    "change",
                    "create",
                    "spin",
                    "start",
                    "stop"
                ]
            },
            {
                'widget': 'slider',
                'prefix': 'jqwSlider',
                'ngModelFieldName': 'value',
                'option': [
                    'disabled',
                    'max',
                    'min',
                    'orientation',
                    'range',
                    'step',
                    {
                        interactive: true,
                        name: 'value',
                        event: 'slide',
                        eventField: 'value',
                        ngModel: true
                    },
                    {
                        interactive: true,
                        name: 'values',
                        event: 'slide',
                        eventField: 'values',
                        deepWatch: true,
                        ngModel: true
                    }
                ],
                'event': [
                    "change",
                    "create",
                    "slide",
                    "start",
                    "stop"
                ]
            },
            {
                'widget': 'tabs',
                'prefix': 'jqwTabs',
                'ngModelFieldName': 'active',
                'option': [
                    'active',
                    'collapsible',
                    'disabled',
                    'event',
                    'heightStyle',
                    'hide',
                    'show',
                    {
                        interactive: true,
                        name: 'active',
                        event: 'tabsactivate',
                        ngModel: true
                    }
                ],
                'event': [
                    "activate",
                    "beforeActivate",
                    "beforeLoad",
                    "create",
                    "load"
                ]
            },
            {
                'widget': 'tooltip',
                'prefix': 'jqwTooltip',
                'option': [
                    "content",
                    "disabled",
                    "hide",
                    "items",
                    "position",
                    "show",
                    "tooltipClass",
                    "track"
                ],
                'event': [
                    "close",
                    "create",
                    "open"
                ]
            }
        ];
    angular.injector(['jqueryWrapperBuilder']).invoke(['jqueryWrapperBuilder', function (jqueryWrapperBuilder) {
        jqueryWrapperBuilder.addDirectives(schemas);
        jqueryWrapperBuilder.module.directive("jqwDialogOpen", function () {
            return {
                compile: function (element, attrs) {
                    return function () {
                        element.click(function () {
                            var bindingElement = $(attrs.jqwDialogOpen);
                            bindingElement.dialog('open');
                        });
                    };
                }

            };
        });
    }]);
}(angular, jQuery));
/*global angular, jQuery, console */

(function (angular, $) {
    'use strict';
    angular.injector(['jqueryWrapperBuilder']).invoke(['jqueryWrapperBuilder', function (jqueryWrapperBuilder) {
        jqueryWrapperBuilder.addDirectives([
            {
                'widget': 'multiDatesPicker',
                'prefix': 'jqwMultidatespicker',
                'ngModel': 'dates',
                'static': true,/* do not link option dynamically */
                'option': [
                    "altField",
                    "altFormat",
                    "appendText",
                    "autoSize",
                    "beforeShow",
                    "beforeShowDay",
                    "buttonImage",
                    "buttonImageOnly",
                    "buttonText",
                    "calculateWeek",
                    "changeMonth",
                    "changeYear",
                    "closeText",
                    "constrainInput",
                    "currentText",
                    "dateFormat",
                    "dayNames",
                    "dayNamesMin",
                    "dayNamesShort",
                    "defaultDate",
                    "duration",
                    "firstDay",
                    "gotoCurrent",
                    "hideIfNoPrevNext",
                    "isRTL",
                    "maxDate",
                    "minDate",
                    "monthNames",
                    "monthNamesShort",
                    "navigationAsDateFormat",
                    "nextText",
                    "numberOfMonths",
                    "prevText",
                    "selectOtherMonths",
                    "shortYearCutoff",
                    "showAnim",
                    "showButtonPanel",
                    "showCurrentAtPos",
                    "showMonthAfterYear",
                    "showOn",
                    "showschema",
                    "showOtherMonths",
                    "showWeek",
                    "stepMonths",
                    "weekHeader",
                    "yearRange",
                    "yearSuffix"
                ],
                method: [
                    {
                        interactive: true,
                        name: 'dates',
                        getter: function (element, event, ui) {
                            return element.multiDatesPicker('getDates', 'object');
                        },
                        setter: function (element, value) {
                            element.multiDatesPicker('resetDates', value);
                            if (value && value.length) {
                                element.multiDatesPicker('addDates', value);
                                element.val(element.multiDatesPicker('getDates'));
                            }
                        },
                        event: 'jqwdatepickerchange',
                        ngModel: true
                    },
                    {
                        name: 'list',
                        setter: function (element, value) {
                            var maxDate = null,
                                minDate = null,
                                dateMap = null;
                            if (value && value.length) {
                                dateMap = {};
                                $.each(value, function (i, o) {
                                    var time = o.getTime();
                                    dateMap[time] = true;
                                    minDate = minDate === null || time < minDate ? time : minDate;
                                    maxDate = maxDate === null || time > maxDate ? time : maxDate;
                                });
                                minDate = minDate && new Date(minDate);
                                maxDate = maxDate && new Date(maxDate);
                            }
                            console.log(minDate && new Date(minDate), maxDate && new Date(maxDate), dateMap);
                            element.datepicker('option', 'minDate', minDate);
                            element.datepicker('option', 'maxDate', maxDate);
                            element.data('jqw-multidatepicker.minDate', minDate);// bug fix of multiDatesPicer
                            element.data('jqw-multidatepicker.maxDate', maxDate);// bug fix of multiDatesPicer
                            element.data('jqw-multidatepicker.dateMap', dateMap);
                            element.datepicker('refresh');
                        }
                    }
                ],
                on: {
                    'change': function () {
                        $(this)
                            .trigger('jqwdatepickerchange');
                    }
                },
                initialOptions: {
                    onSelect: function () {
                        $(this)
                            .trigger('jqwdatepickerselect')
                            .trigger('change')/* default behaviour of onSelect*/
                            .datepicker('option', 'minDate', $(this).data('jqw-multidatepicker.minDate')) // bug fix of multiDatesPicer
                            .datepicker('option', 'maxDate', $(this).data('jqw-multidatepicker.maxDate')); // bug fix of multiDatesPicer
                    },
                    onClose: function () {
                        $(this).trigger('jqwdatepickerclose');
                    },
                    onChangeMonthYearType: function () {
                        $(this).trigger('jqwdatepickerchangemonthyeartype');
                    },
                    beforeShowDay: function (date) {
                        var dateMap = $(this).data('jqw-multidatepicker.dateMap');
                        return [!dateMap || !!dateMap[date.getTime()]];
                    }
                }
            }
        ]);
    }]);
}(angular, jQuery));
