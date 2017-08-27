// default settings. fis3 release

// Global start
fis.match('*.{js,css}', {
    useHash: true
});

fis.match('::image', {
    useHash: false
});

fis.match('*.{js,html:js}', {
    optimizer: fis.plugin('uglify-js') // js 压缩
});

fis.match('*.{css,html:css}', {
    optimizer: fis.plugin('clean-css') // css 压缩
});

fis.match('*.png', {
    optimizer: fis.plugin('png-compressor') // png 图片压缩
});
fis.match('layer.css', {
    useHash: false
});

// Global end
fis.media('dev')
    .match('*', {
        useHash: false,
        optimizer: null
    });
// default media is `dev`


// extends GLOBAL config
fis.media('prod');

fis.media('online_H5').match('*', {
    deploy: fis.plugin('http-push', {
        receiver: 'http://119.29.21.17:19528/receiver.php',
        to: '/xinmei/www/fontShop/oppo'
    })
});

fis.media('online_H5_ali').match('*', {
    deploy: fis.plugin('http-push', {
        receiver: 'http://120.76.120.152:19528/receiver.php',
        to: '/home/www/fontShop/oppo'
    })
});

fis.media('online_H5_ali_126').match('*', {
    deploy: fis.plugin('http-push', {
        receiver: 'http://120.25.56.126:19528/receiver.php',
        to: '/home/www/fontShop/oppo'
    })
});


// fis.media('www').match('*', {
//     deploy: fis.plugin('http-push', {
//         receiver: 'http://119.29.21.17:19528/receiver.php',
//         to: '/xinmei/www/sdk_main_web_www' // 注意这个是指的是测试机器的路径，而非本地机器
//     })
// });
//
// fis.media('online_debug').match('*', {
//     deploy: fis.plugin('http-push', {
//         receiver: 'http://119.29.21.17:19528/receiver.php',
//         to: '/xinmei/www/online_beta_tmp/sdk_main_web_debug' // 注意这个是指的是测试机器的路径，而非本地机器
//     })
// });
