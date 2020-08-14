module.exports = function (grunt) {

  var appId = '14';
  var s3Bucket = "doe.wab";
  var vendorJS = ['buildOutput/app/libs/caja-html-sanitizer-minified.js', 'buildOutput/app/libs/moment/twix.js', 'buildOutput/app/libs/Sortable.js', 'buildOutput/app/libs/cropperjs/cropperjs.js', 'buildOutput/app/libs/polyfills/FileSaver.js', 'buildOutput/app/libs/color.all.min.js'];
  var vendorCSS = ['buildOutput/app/arcgis-js-api/esri/css/esri.css', 'buildOutput/app/arcgis-js-api/dijit/themes/claro/claro.css', 'buildOutput/app/arcgis-js-api/dojox/layout/resources/ResizeHandle.css', 'buildOutput/app/arcgis-js-api/dojo/resources/dojo.css', 'buildOutput/app/jimu.js/css/jimu-theme.css', 'buildOutput/app/libs/cropperjs/cropper.css', 'buildOutput/app/libs/goldenlayout/goldenlayout-base.css', 'buildOutput/app/libs/goldenlayout/goldenlayout-light-theme.css'];
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    run: {
      options: {
        // Task-specific options go here.
      },
      your_target: {
        cmd: 'npm run esri-wab-build',
        cwd: "../../",
        args: [
          'apps/' + appId
        ]
      }
    },
    'npm-command': {
      options: {
        cmd: 'run',
        args: ['build']
      },

      build: {
        options: {
          cwd: ''
        }
      }
    },
    run_node: {
      start: {
        options: {
          cwd: './../server',
          stdio: ['ignore', 'ignore', 'ignore'],
          env: {},
          detached: false
        },
        files: { src: ['./../server/server.js'] }
      }
    },
    open: {
      server: {
        path: 'http://localhost:3345/',
        app: 'Chrome'
      }
    },
    clean: {
      git: ["buildOutput/app/.git"],
      widgetsjs: [
        'buildOutput/app/widgets/**/*.js'

      ],
      options: {
        force: true
      }
    },
    copy: {
      env: {
        files: [
          {
            expand: false,
            src: ['env.js'],
            dest: 'buildOutput/app/env.js',
            filter: 'isFile'
          }

        ]
      },
      pbf: {
        files: [
          {
            expand: false,
            src: ['toCopy/pbfDeps_en.js'],
            dest: 'buildOutput/app/arcgis-js-api/esri/tasks/support/nls/pbfDeps_en.js',
            filter: 'isFile'
          },
          {
            expand: false,
            src: ['toCopy/pbfDeps.js'],
            dest: 'buildOutput/app/arcgis-js-api/esri/tasks/support/nls/pbfDeps.js',
            filter: 'isFile'
          }

        ]
      },
      init: {
        files: [
          {
            expand: true,
            cwd: 'customConfigs',
            src: ['**/*'],
            dest: 'buildOutput/app/customConfigs'
          },
          {
            expand: false,
            src: ['init_production.js'],
            dest: 'buildOutput/app/init.js',
            filter: 'isFile'
          },
          {
            expand: false,
            src: ['oauth-callback.html'],
            dest: 'buildOutput/app/oauth-callback.html',
            filter: 'isFile'
          }

        ]
      }
    },
    uglify: {
      js: {
        options: {
          sourceMap: true,
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */',
          // mangle: false,
          compress: false
        },
        files: {
          'buildOutput/app/libs/vendor.min.js': vendorJS
        }
      }
    },
    cssmin: {
      options: {
        mergeIntoShorthands: false,
        roundingPrecision: -1,
        rebase: true
      },
      target: {
        files: {
          'buildOutput/app/vendor.min.css': vendorCSS
        }
      }
    },

    /*  cssmin: {
        'dist': {
          'src': vendorCSS,
          'dest': '../server/dist/buildOutput/app/vendor.min.css'
        }
      },*/

    aws_s3: {
      options: {
        awsProfile: 'default',
        uploadConcurrency: 20,
        downloadConcurrency: 5,
        progress: 'progressBar',
        cache: true
      },
      build: {
        options: {
          bucket: s3Bucket
        },
        files: [
          {
            action: "upload",
            cwd: '../../dist/buildOutput/app',
            differential: true,
            expand: true,
            src: ['**/*']
          }
        ]
      },
      build_dev: {
        options: {
          bucket: s3Bucket
        },
        files: [
          {
            action: "upload",
            cwd: '',
            differential: true,
            expand: true,
            src: ['**/*'],
            dest: 'wab/'
          }
        ]

      }
    }

  });

  grunt.loadNpmTasks('grunt-sync');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-run-node');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-aws-s3');
  grunt.loadNpmTasks('grunt-aws');
  grunt.loadNpmTasks('grunt-npm-command');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  //grunt.registerTask('serve', ['open:server', 'watch']);

  grunt.registerTask('minify', ['uglify:js', 'cssmin']);
  grunt.registerTask('build', ['npm-command:build', 'clean:git', 'minify', 'copy:init']);
  grunt.registerTask('publish', ['build', 'aws_s3:build']);
  grunt.registerTask('publishdev', ['aws_s3:build_dev']);
};
