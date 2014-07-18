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
