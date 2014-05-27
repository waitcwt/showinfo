define(function(require,exports,module){
    require('common/jquery.pagination.js');
    var Box = require('details/showdaliog.js');
    function detailInfo(options,events){
        this.conf=$.extend({},{
            obj:$('#mylist'),
            currentpage:1,
            baseurl:'ajaxinfo.html',
            articalid: 3,
            channelid:30,
            size:6,
            usepage:true,
            getData:'',
            usedom:'gamevideo' 
        },options);
        this.bindEvents=$.extend({},this.bindEvents,events);
    };
        
    detailInfo.prototype = {
        canClick:true,
        dom:{
            gamevideo:'<li><a href="#" title=""><span class="img"><i class="ico_play"></i><img src="{thumbnail}"></span><p class="tt">视频名称</p></a></li>',
            gameimgs:'<li><a href="javascript:;" title=""><span class="img"><img data-type={index} class="scaleimg" src="{thumbnail}"></span></a></li>',
            newslist:'<li><span><em class="c_blue">{channel_name}</em> <a href="/newsdetails.html?articalid={article_id}&type={article_type}&channel={channel_id}" target="_blank" title="">{title}</a></span>{addtime}</a></li>',
            indexnews:'<li class="{last}"><span class="f-right">{addtime}</span><a href="/newsdetails.html?type={article_type}&channel={channel_id}&articalid={article_id}" class="hui" target="_blank">{title}</a></li>',
            indexvideo:'<a href="/gameshow/{channel_name}.html" class="i-more" target="_blank">&gt;&gt;更多</a><a data-swf="{video_code}" class="c_gd_video"><img width="322" height="156" src="{thumbnail}"></a>',
            indeximgs:'<a href="/gameshow/{channel_name}.html" class="i-more" target="_blank">&gt;&gt;更多</a><a><img width="176" height="115" src="{thumbnail}"></a>',
            nothings:'<li>神马都没有哦~</li>'
        },
        DIY:function(){
            this.Event(this.bindEvents);
            this.conf.usepage ? this.getData(true):this.getData();
        },
        changeNav:function(event){
            if(!this.canClick) return;
            this.canClick = false;
            var $this = $(event.currentTarget),conf = this.conf;
            var data = $this.data();
            $('.changenav').removeClass('cur');
            var href = $('.newsmore').attr('href');
            if(href && href.indexOf('type')>0){
                $('.newsmore').attr('href',href.replace(/type=(\w*)/g,function(match){return 'type='+data.channelid}));
            }else{
                $('.newsmore').attr('href',href+'?type='+data.channelid)
            }
            $this.addClass('cur');
            $.each(data,function(i,item){
                conf[i] = item
            });
            conf.currentpage = 1;
            conf.usepage ? this.getData(true): this.getData();
        },
        inject:function(event){
            var $this = $(event.currentTarget);
            var index = $this.data('type');
            Box.showbox(this.conf.getData,index);
        },
        getData:function(reset){
            var conf = this.conf,that=this;
            $.ajax({
                url:conf.baseurl,
                data:{articalid:conf.articalid,channelid:conf.channelid,currentpage:conf.currentpage,size:conf.size},
                dataType:'json',
                success:function(data){
                    conf.obj.html('');
                    if(!data || data.total==0){
                        $('.page').html('');
                        conf.obj.html(that.dom.nothings);
                    }else{
                        conf.getData = data.data;
                        conf.obj.html(that.render(data.data));
                    }
                    if(reset && conf.usepage){
                        $('.page').html('');
                        var pagenum = Math.ceil(data.total/that.conf.size);
                        if(data.total!=0 && pagenum!=1){
                            $('.page').html('<a class="setpage" data-page="1" href="javascript:;">首页</a><span id="pager"></span><a class="setpage endpage" data-page="1" href="javascript:;">末页</a>');
                        }
                        that.initpage(data.total,that.conf.size,0);
                        $('.endpage').attr('data-page',pagenum);
                        $('.setpage').attr('data-total',data.total);
                    }
                    that.canClick = true;
                }
            })
        },
        render:function(data){
            var that = this,html='';
            var arr ={1:'新闻',2:'公告',3:'活动',30:'cg',20:'yh',21:'jt'};
            $.each(data,function(i,item){
               html+=that.dom[that.conf.usedom].replace(/{(.*?)}/g,function(_,match){
                   if(match) {                      
                       if(match =='index'){
                           return i;
                       }else if(match=='channel_name'){
                           return arr[item['channel_id']];
                       }else if(match=='last'&&i==data.length-1){
                           return 'last';
                       }
                       return item[match] || '';     
                   }                                
                });
            });
            return html;
        },
        initpage :function(total,size,pageindex){
            var that =this;
            $('#pager').pagination(total,{
                num_edge_entries: 1,                
                num_display_entries: 2,             
                items_per_page: size,
                prev_text:"上一页",    
                next_text:"下一页",
                current_page:pageindex,
                callback:function(pageid){
                    that.conf.currentpage=pageid+1;
                    that.getData();
                }
            });
        },
        resetpage:function(event){
            var $this = $(event.currentTarget);
            var pageindex = this.conf.currentpage= $this.data('page');
            var total = $this.data('total');
            this.initpage(total,this.conf.size,pageindex-1);
            this.getData();
        },
        bindEvents:{
                'click|.setpage':'resetpage',
                'click|.scaleimg':'inject'
        },
        Event:function(events){
            var that = this;
            $.each(events,function(k,v){
                var selector = k.split('|');
                $('body').on(selector[0],selector[1],function(){
                    if($.isFunction(that[v])){
                        that[v].apply(that,arguments);
                    }else{
                        //console.log('wrong function');
                    }
                });
            });
        }
    }
    var main= function(opts,e){
        return new detailInfo(opts,e);
    };
    module.exports = main;
});
