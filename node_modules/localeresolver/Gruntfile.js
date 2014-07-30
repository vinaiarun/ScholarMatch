'use strict';


module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            files: ['lib/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        clean: {
            'tmp': 'tmp'
        },
        mochacli: {
            src: ['test/**/*.js'],
            options: {
                globals: ['chai'],
                timeout: 6000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            }
        },
        mocha_istanbul: {
            coverage: {
                src: 'test', // the folder, not the files,
                options: {
                    mask: 'test-**.js'
                }
            },
            coveralls: {
                src: 'test', // the folder, not the files
                options: {
                    coverage:true,
                    check: {
                        lines: 75,
                        statements: 75
                    },
                    root: '../lib/locale**.js', // define where the cover task should consider the root of libraries that are covered by tests
                    reportFormats: ['lcovonly']
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    grunt.registerTask('build', ['jshint']);
    grunt.registerTask('test', [ 'mochacli']);
    grunt.registerTask('coveralls', ['mocha_istanbul:coveralls']);
    grunt.registerTask('coverage', ['mocha_istanbul:coverage']);

};
