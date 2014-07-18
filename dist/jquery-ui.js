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