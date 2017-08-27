function isLoadingPage() {
    var w = $(window).width();
    if (w > 720) {
        $('.loading-container').show();
        $('.main-container').hide();
        console.log('请使用手机访问字体商店');
        return false;
    }
    return true;
}

function openWallpaperInClient(masterId, name, pkgName){
    var clientVersion = "0";
    if ( typeof window.downloader != "undefined"
    && typeof window.downloader.getVersion != "undefined"
    && window.downloader.getVersion instanceof Function){
        clientVersion = window.downloader.getVersion();
    }

    if ( clientVersion >= '456'
    && typeof window.downloader != "undefined"
    && typeof window.downloader.downloadProduct != "undefined"
    && window.downloader.downloadProduct instanceof Function){
        window.downloader.downloadProduct(masterId, name, 4, pkgName);
    }
    else {
        alert("当前版本不支持该功能，请升级主题商店");
    }
}
