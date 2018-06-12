function Activity() {
    this.raffleNum = 0; // 抽奖次数
    this.prize = false; // 是否中奖
    this.prizes = {}; // 奖品
    this.registered = false; //中奖后是否填写地址
    this.userId = ''; // 用户id
    this.interval;
    this.fontList = [
        [4, 583727, 'Aa谦谦君子', 'a8b63e98a21a4f45b5047b5111331d13'],
        [4, 586827, 'Aa窈窕淑女', '4c70772f1fa144a5a9d6a47a769eaf64'],
        [4, 530628, '胖小儿体', 'com.monotype.android.font.PXEOPPO01'],
        [4, 526700, '胖丫儿体', 'com.monotype.android.font.A254'],
        [4, 586256, 'Aa三行情书体加粗', '2213c3af40c8429ab26b754e4780b047'],
        [4, 586829, 'Aa小狐狸加粗', '2d95fcb1e41f47408b17fe8a39509e5a'],
        [4, 564972, 'Aa-桃子小姐', '4c67bc8f701d4f9284d367a751eab92a'],
        [4, 564973, 'Aa-西瓜先生', 'f70ed18e01d54d1b8dee08849cb88b52'],
        [4, 586254, 'Aa芒小果', '9ff5c74d2d42451698b6f918cc1a8a76'],
        [4, 586229, 'Aa小星星', 'b0e2d720697f40539e487d61950c6334'],
        [4, 583064, 'Aa橡皮皇后', '75686a2e2d72482688873dd874277841'],
        [4, 582304, 'Aa蝉梦', '8f505ed069d8445c9cb86a4d37acaa10'],
        [4, 555667, 'Aa-花瓣体', 'com.monotype.android.font.AAHBT'],
        [4, 561137, 'Aa-小鹿体', 'eb2fc1eea6384bdf9377d94e1dbfe778'],
        [4, 582306, 'Aa桑尼', '2c9d37fe973f486cb6afc545ff5fd4d5'],
        [4, 584209, 'Aa晴天', '1b04b6940f5e451f876673cfc4cd006e']
    ]; // 字体参数
    this.canGetUser = false; // 能否获取用户名
    this.canOpenProduct = false; // 能否跳转到字体
    this.canGetProductDownloadSituation = false; // 能否获取字体下载情况
    this.canUpdateVersion = false; // 能否升级版本
    this.version = 0; // 版本号
}
Activity.prototype = {
    constructor: Activity,
    init: function () {
        this.getAPISupportInfo();
        this.getFontsInfo();
        this.updateWinnerList();
    },
    // 获取对几个API的支持情况
    getAPISupportInfo: function () {
        if (typeof window.ThemeClient != "undefined"
            && typeof window.ThemeClient.getUserName != "undefined"
            && window.ThemeClient.getUserName instanceof Function) {
            this.canGetUser = true;
        }
        if (typeof window.ThemeClient != "undefined"
            && typeof window.ThemeClient.openProduct != "undefined"
            && window.ThemeClient.openProduct instanceof Function) {
            this.canOpenProduct = true;
        }
        if (typeof window.ThemeClient != "undefined"
            && typeof window.ThemeClient.updateVersion != "undefined"
            && window.ThemeClient.updateVersion instanceof Function) {
            this.canUpdateVersion = true;
        }
        if ( typeof window.ThemeClient  != "undefined"
            &&  window.ThemeClient.getVersion != "undefined"
            && window.ThemeClient.getVersion instanceof Function){
            this.version = window.ThemeClient.getVersion();
        }
        if ( typeof window.ThemeClient  != "undefined"
            &&  window.ThemeClient.isProductDownloaded != "undefined"
            && window.ThemeClient.isProductDownloaded instanceof Function) {
            if ( this.version >= 480) {
                this.canGetProductDownloadSituation = true;
            }
        }
    },
    // 获取用户名,获取用户字体的下载情况
    getFontsInfo: function () {
        var self = this;
        var id;
        var fontLen = self.fontList.length;
        var fontStateList = [];
        var productInfoList = [];
        if (self.canGetUser) {
            id = window.ThemeClient.getUserName();
            if (id) {
                self.userId = id;
                if (self.canGetProductDownloadSituation) {
                    for (var i = 0; i < fontLen; i ++ ) {
                        var fontId = self.fontList[i][3];
                        var fontType = self.fontList[i][0];
                        productInfoList.push({
                            "type": fontType,
                            "pkgName": fontId
                        })
                    }
                    var ret = JSON.parse(window.ThemeClient.isProductDownloaded(JSON.stringify(productInfoList)));
                    for (var m = 0; m < fontLen; m++) {
                        fontStateList.push({
                            "fontId": self.fontList[m][3],
                            "isPurchased": ret[m]['status'] ? true : false
                        })
                    }
                    var param = {
                        "userId": id,
                        "font": fontStateList
                    }
                    self.getUserDetailData(param);
                } else {
                    self.alertLayer("当前客户端不支持window.downloader功能，请升级客户端");
                }

            } else {
                self.alertLayer("请先登录");
            }
        } else {
            self.alertLayer("当前客户端不支持该功能，请升级客户端");
        }
    },
    /*
     * @param {object} data 用户id 和字体参数
     * 获取用户基本信息,包括抽奖次数,是否获奖,奖品,中奖后是否注册
     * */
    getUserDetailData: function (data) {
        var self = this;
        $.ajax({
            url: "http://api-font.galaxyfont.com/font/user-detail",
            method: "POST",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(data),
            dataType: 'json',
            success: function (res) {
                alert(res);
                if (res.errorCode === 0) {
                    var data = res.data;
                    self.raffleNum = data.raffleNum;
                    self.prize = data.prize;
                    if (self.prize) {
                        self.prizes = data.prizes.prizes;
                        self.registered = data.registered;
                    }
                    self.updateRaffleNum();
                } else {
                    self.alertLayer("出现错误,errorCode: " + res.errorCode + ", errorMsg: " + res.errorMsg);
                }
            }
        })

    },
    // 更新抽奖次数
    updateRaffleNum: function () {
        var self = this;
        $("#raffleNum").html(self.raffleNum);
    },
    // 更新中奖者滚动条信息
    updateWinnerList: function () {
        var self = this;
        var con = [];
        con.push('<marquee  behavior="scroll" scrollamount="5" class="marquee">');
        $.ajax({
            url: "http://api-font.galaxyfont.com/font/winner-list",
            method: "GET",
            dataType: 'json',
            success: function (res) {
                if (res.errorCode == 0) {
                    var data = res.data.data;
                    var len = data.length;
                    for (var i = 0; i < len; i++) {
                        if (data[i].phoneNumber) {
                            var phone = data[i].phoneNumber;
                            var prizeName = data[i].prizeName;
                            con.push('<span> 用户' + phone + '获得' + prizeName + '&nbsp;&nbsp;&nbsp;&nbsp; </span>');
                        }
                    }
                    con.push('</marquee>');
                    var html = con.join('');
                    $('.marquee-div').html(html);
                }
            }
        });
    },
    //下载字体
    openPage: function (index) {
        var self = this;
        if (self.interval) {
            clearInterval(self.interval);
        }
        if (self.userId) {
            var clickedFont = self.fontList[index];
            var productInfoList = [{"type": clickedFont[0], "pkgName": clickedFont[3]}];
            if (self.canOpenProduct) {
                window.ThemeClient.openProduct(clickedFont[0], clickedFont[1], clickedFont[2], clickedFont[3]);
                //self.interval = setInterval(function(){
                //    var fontState = window.ThemeClient.isProductDownloaded(JSON.stringify(productInfoList));
                //    if (JSON.parse(fontState)[0]['status']) {
                //        $("#raffleNum").html('成功下载');
                //        //self.addRaffleNum(clickedFont[3]);
                //        clearInterval(self.interval);
                //    } else {
                //        $("#raffleNum").html('未下载');
                //    }
                //},1000);
            } else if (self.canUpdateVersion) {
                window.ThemeClient.updateVersion();
                return;
            } else {
                self.alertLayer("当前客户端不支持该功能，请升级客户端");
            }
        } else {
            self.alertLayer("请先登录!");
        }
    },
    //增加抽奖次数
    addRaffleNum: function (fontId) {
        var self = this;
        var data = {
            "userId": self.userId,
            "fontId": fontId
        };
        $.ajax({
            url: "http://api-font.galaxyfont.com/font/font-download",
            method: "POST",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(data),
            dataType: 'json',
            success: function (res) {
                alert(res);
                if (res.errorCode == 0) {
                    self.raffleNum = res.data.raffleNum;
                    self.updateRaffleNum();
                } else {
                    self.alertLayer(res);
                }
            }
        })
    },
    //抽奖
    raffle: function () {
        var self = this;
        var num = self.raffleNum;
        console.log(num);
        var data = {
            "userId": self.userId
        };
        if (num > 0) {
            $.ajax({
                url: "http://api-font.galaxyfont.com/font/raffle",
                method: "POST",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(data),
                dataType: 'json',
                success: function (res) {
                    if (!res.errorCode) {
                        self.raffleNum -= 1;
                        self.updateRaffleNum();
                        if (!res.data.win) {
                            layer.open({
                                area: ['7rem', '9.75rem'],
                                shadeClose: true, //点击遮罩关闭,
                                btn: false,
                                closeBtn: 2,
                                content: "<div class='layerContent'>\<div class='pure-context'>\<p>一定是字体助攻不够</p>\<p>快换一款再试试</p></div></div>"
                            });
                            $(".layui-layer-content").css("min-height", "9.75rem");
                        } else {
                            var type = res.data.lotteryName;
                            self.prize = true;
                            if (type in self.prizes) {
                                var num = self.prizes[type];
                                self.prizes[type] = parseInt(num) + 1;
                            } else {
                                self.prizes[type] = 1;
                            }
                            var src = self.prizeMapPoto(type);
                            layer.open({
                                area: ['7rem', '9.75rem'],
                                shadeClose: true, //点击遮罩关闭,
                                closeBtn: 2,
                                btn: false,
                                content: "\<div class='layerContent'>\<div class='win-context'>\<div class='win-context-top'>神人天助!恭喜获得:</div>\<div><img src='" + src + "' class='prizePoto'>\</div><div class='win-context-bottom'><span class='em'>[提示]:</span> 请返回页面,点击右下角\"我的奖品\"按钮填写有效联系方式。</div></div></div>"
                            });
                            $(".layui-layer-content").css("min-height", "9.75rem");
                        }
                    }
                }
            })
        } else {
            layer.open({
                area: ['7rem', '9.75rem'],
                shadeClose: true, //点击遮罩关闭,
                btn: false,
                closeBtn: 2,
                content: "<div class='layerContent'>\<div class='pure-context'>\<p>您还没有抽奖机会</p>\<p>快下载活动字体来试试手气哦!</p></div></div>"
            });
            $(".layui-layer-content").css("min-height", "9.75rem");
        }
    },
    //奖品图片地址映射
    prizeMapPoto: function (type) {
        var src;
        if (type == "200元的京东购物卡") {
            src = 'http://upaicdn.xinmei365.com/activity/oppo/img/qixiActivity/prize/jingdong.png';
        } else if (type == "200元的格瓦拉电影卡") {
            src = 'http://upaicdn.xinmei365.com/activity/oppo/img/qixiActivity/prize/guevara.png';
        } else if (type == "200元的星巴克星礼卡") {
            src = 'http://upaicdn.xinmei365.com/activity/oppo/img/qixiActivity/starbucks.png';
        } else if (type == "200元的哈根达斯储值卡") {
            src = 'http://upaicdn.xinmei365.com/activity/oppo/img/qixiActivity/haagen-dazs.png';
        } else if (type == "200元的八喜月饼提货卡") {
            src = 'http://upaicdn.xinmei365.com/activity/oppo/img/qixiActivity/baxi.png';
        }
        return src;
    },
    //显示活动细则
    showActivityRules: function () {
        layer.open({
            area: ['9.58rem', '7.75rem'],
            shadeClose: true, //点击遮罩关闭,
            btn: false,
            content: $('.layer').html()
        });
        $(".layui-layer-content").css("min-height", "7.75rem");
    },
    //我的奖品
    getPrize: function () {
        var self = this;
        if (!self.prize) {
            layer.open({
                area: ['7rem', '9.75rem'],
                shadeClose: true, //点击遮罩关闭,
                btn: false,
                closeBtn: 2,
                content: "<div class='layerContent'>\<div class='pure-context'>\<p>您还没有任何奖品哟!</p>\<p>快快参加活动,大奖在向你招手!</p></div></div>"
            });
            $(".layui-layer-content").css("min-height", "9.75rem");
        } else if (self.registered) {
            var prizes = self.prizes;
            var con = '';
            var prizeCard = [];
            for (var key in prizes) {
                var len = prizes[key];
                for (var i = 0; i < len; i++) {
                    prizeCard.push(key);
                    var src = self.prizeMapPoto(key);
                }
            }
            var totalLen = prizeCard.length;
            for (var n = 0; n < totalLen; n++) {
                var src = self.prizeMapPoto(prizeCard[n]);
                if (n % 2 == 0) {
                    if (n == totalLen - 1) {
                        con += "<div><img src='" + src + "' class='prizePoto'></div>";
                    } else {
                        con += "<div><img src='" + src + "' class='prizePoto'>";
                    }
                } else {
                    con += "<img src='" + src + "' class='prizePoto'></div>";
                }
            }
            var area = ['7rem', '9.75rem'];
            var height = '9.75rem';
            var top = '4.5rem';
            if (totalLen > 2) {
                area = ['9.58rem', '13.5rem'];
                height = '13.5rem';
                top = '5.5rem';
            }
            layer.open({
                area: area,
                shadeClose: true, //点击遮罩关闭,
                btn: false,
                closeBtn: 2,
                content: "\<div class='layerContent'>\<div class='win-context'>\<div class='win-context-top'>我的奖品:</div>\<div class='prize-img'>" + con + "\</div><div class='win-context-bottom clear-fix'><p>您的信息已收到!</p><p>礼盒翅膀正在安装，不久就飞到您手中！静候哦！</p></div></div></div>"
            });
            $(".layui-layer-content").css("min-height", height);
            $(".win-context").css("padding-top", top);
        } else {
            var con = "";
            con += '<div class="registerContent">';
            con += '<div class="register-context">';
            con += '<form class="layer-form">';
            con += '<div class="title">恭喜获奖!</div>';
            con += '<div class="text hide"><label>* 用户id: </label><input type="text" name="userId" value="' + self.userId + '"></div>';
            con += '<div class="text clear-fix"><label>* 姓名:</label><input type="text" name="name"></div>';
            con += '<div class="text clear-fix"><label>* 联系方式: </label><input type="text" name="phone"></div>';
            con += '<div class="text clear-fix"><label>* 收货地址: </label><input type="text" name="address"></div>';
            con += '<div class = "register-error-tip"></div>';
            con += '<div class="register-tip clear-fix"><span class="em">[提示]</span> 请务必填写有效联络方式；我们不会泄露您的个人信息.</div>';
            con += '</form>';
            con += '</div>';
            con += '</div>';
            var index = layer.open({
                area: ['9.58rem', '7.75rem'],
                shadeClose: true, //点击遮罩关闭,
                btn: ['提交'],
                yes: function (index, layero) {
                    var userId = $(layero).find('input[name=userId]').val();
                    var name = $(layero).find('input[name=name]').val();
                    var phone = $(layero).find('input[name=phone]').val();
                    var address = $(layero).find('input[name=address]').val();
                    var data = {
                        userId: userId,
                        name: name,
                        phone: phone,
                        address: address
                    };
                    if (userId && name && (/^1[3|4|5|8][0-9]\d{4,8}$/.test(phone)) && address) {
                        $('.register-error-tip').html('');
                        $.ajax({
                            url: "http://api-font.galaxyfont.com/font/winner-info-register",
                            method: 'POST',
                            contentType: "application/json;charset=utf-8",
                            data: JSON.stringify(data),
                            dataType: 'json',
                            success: function (res) {
                                console.log(res);
                                if (res.errorCode == 0) {
                                    self.registered = true;
                                    layer.close(index);
                                } else {
                                    alert('信息提交失败,请重新提交');
                                }
                            }
                        })
                    } else {
                        var tips = '';
                        if (!name || !phone || !address) {
                            tips = 'Error:每个字段均不能为空';
                        } else {
                            tips = 'Error:手机号格式不正确,请填11位手机号码'
                        }
                        $('.register-error-tip').html(tips);
                    }
                },
                content: con
            });
            $(".layui-layer-content").css("min-height", "7.75rem");
        }
    },
    alertLayer: function (text) {
        layer.open({
            area: ['9.58rem', '4rem'],
            shadeClose: true, //点击遮罩关闭,
            btn: false,
            content: "<div class='alertMsgLayer'>\<div class='text'>" + text + "</div></div>"
        });
        $(".layui-layer-content").css("min-height", "4rem");
    }
};
$('img.lazy').lazyload();
var activity = new Activity();
activity.init();
var ThemeH5 = {
    'updateDownloadProgress':function(pkgName, progress){
        var h6=document.createElement("h6");
        h6.innerHTML = pkgName + "成功更新" + progress;
        document.body.appendChild(h6);
    },

    'downloadSuccess':function(type, masterid){
        activity.addRaffleNum('com.monotype.android.font.AAHBT');
        //var h6=document.createElement("h6");
        //h6.innerHTML = masterid + "成功下载" + type;
        //document.body.appendChild(h6);
    },

    'buyProductSuccess':function(type, masterid){
        $("#raffleNum").html(masterid);
        //var h6=document.createElement("h6");
        //h6.innerHTML = masterid + "成功购买" + type;
        //document.body.appendChild(h6);
    },

    'awardServiceDone':function(activityId,operationType,requestData, status,responseData){
        var result = "activityId=" + activityId + ",operationType=" + operationType + ",requestData=" + requestData + ",status=" + status + "\n·þÎñÆ÷·µ»Ø=" + responseData;
        alert(result);
    }
}

