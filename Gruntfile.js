module.exports = function (grunt) {
    // Carrega automaticamente todas as tasks do package.json (devDependencies)
    require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
  
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
  
      // Limpa a pasta dist antes de gerar tudo de novo
      clean: {
        dist: ['dist']
      },
  
      // Compila SASS (SCSS -> CSS)
      sass: {
        options: {
          implementation: require('sass'), // 👈 IMPORTANTE pra não dar erro
          sourceMap: false
        },
        dist: {
          files: {
            'dist/css/main.css': 'src/scss/main.scss'
          }
        }
      },
  
      // Compila LESS
      less: {
        dist: {
          files: {
            'dist/css/buttons-extra.css': 'src/less/buttons.less'
          }
        }
      },
  
      // Minifica JS (app e admin)
      uglify: {
        dist: {
          files: {
            'dist/js/app.js': ['src/js/app.js'],
            'dist/js/admin.js': ['src/js/admin.js']
          }
        }
      },
  
      // Copia HTML, imagens e dados para dist
      copy: {
        html: {
          expand: true,
          cwd: 'src/',
          src: ['index.html', 'admin.html'], // 👈 inclui admin.html
          dest: 'dist/'
        },
        data: {
          expand: true,
          cwd: 'src/',
          src: ['data/**'],
          dest: 'dist/'
        },
        img: {
          expand: true,
          cwd: 'src/',
          src: ['img/**'],
          dest: 'dist/'
        }
      },
  
      // Junta e minifica CSS
      cssmin: {
        dist: {
          files: {
            'dist/css/main.min.css': [
              'dist/css/main.css',
              'dist/css/buttons-extra.css'
            ]
          }
        }
      },
  
      // Servidor estático pra testar o dist
      connect: {
        server: {
          options: {
            port: 9000,
            base: 'dist',
            livereload: true,
            open: true
          }
        }
      },
  
      // Observa arquivos pra rodar tasks automáticas
      watch: {
        options: {
          livereload: true
        },
        html: {
          files: ['src/index.html', 'src/admin.html'],
          tasks: ['copy:html']
        },
        js: {
          files: ['src/js/**/*.js'],
          tasks: ['uglify']
        },
        scss: {
          files: ['src/scss/**/*.scss'],
          tasks: ['sass', 'cssmin']
        },
        less: {
          files: ['src/less/**/*.less'],
          tasks: ['less', 'cssmin']
        },
        data: {
          files: ['src/data/**/*.json'],
          tasks: ['copy:data']
        },
        img: {
          files: ['src/img/**/*.*'],
          tasks: ['copy:img']
        }
      }
    });
  
    // Tarefa de build (gera tudo na dist)
    grunt.registerTask('build', [
      'clean:dist',
      'sass',
      'less',
      'uglify',
      'copy',
      'cssmin'
    ]);
  
    // Tarefa de desenvolvimento (build + servidor + watch)
    grunt.registerTask('serve', [
      'build',
      'connect:server',
      'watch'
    ]);
  };
  