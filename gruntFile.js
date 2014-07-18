/*global module, grunt, process*/
/*jslint nomen:true*/

module.exports = function (grunt) {
    'use strict';
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-conventional-changelog');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task.
    grunt.registerTask('default', ['jshint', 'karma', 'concat', 'copy', 'uglify']);
    grunt.registerTask('build', ['concat', 'copy', 'uglify']);

    var testConfig = function (configFile, customOptions) {
        var options = { configFile: configFile, keepalive: true },
            travisOptions = process.env.TRAVIS && { browsers: ['Firefox'], reporters: 'dots' };
        return grunt.util._.extend(options, customOptions, travisOptions);
    };

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: {
            unit: {
                options: testConfig('test/test.conf.js')
            }
        },
        jshint: {
            files: ['src/**/*.js', 'test/**/*.js', 'demo/**/*.js', '!**/*.min.js'],
            options: {
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['**/*.js', '!core.js'],
                        dest: 'dist/'
                    },
                    {
                        src: []
                    }
                ]
            }
        },
        uglify: {
            options: {
                sourceMap: true,
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */'
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: '**/*.js',
                    dest: 'dist',
                    ext: '.min.js'
                }]
            }
        },
        concat: {
            dist: {
                src: ['src/core.js', 'src/*.js'],
                dest: 'dist/angular-jquery-wrapper.js'
            },
            core: {
                src: ['src/core.js'],
                dest: 'dist/angular-jquery-wrapper-core.js'
            }
        },
        changelog: {
            options: {
                dest: 'CHANGELOG.md'
            }
        }
    });

};
