# Angular jQuery Wrapper

1. This service generates jQuery-wrapping directives with simple schema data. 
2. Some jQuery plugins in the next section are ready to use.

# Supporting Library

1. jQuery UI
2. jQuery MultiDatesPicker

# Requirements

- AngularJS
- jQuery

# Usage

## Syntax

Generally,

    <tag jqw-{plugin name} jqw-{plugin name}-{operation name}="angular expression">
    
for example

    <input jqw-datepicker jqw-datepicker-date="varName" jqw-datepicker-date-format="'yy/mm/dd'">
    <div class="row" jqw-slider jqw-slider-values="range" jqw-slider-max="20" jqw-slider-min="10" jqw-slider-step="1" >
                        
{operation name} is {option name}, {method name} or {event name} of jQuery plugins.

