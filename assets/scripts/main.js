var character = require('character');

cc.Class({
    extends: cc.Component,

    properties: {
        talkText: {
            default: null,
            type: cc.Label
        },
    },

    // use this for initialization
    onLoad: function () {
        this.canvas = cc.find('Canvas');

        this.initial_time = -0.5
        this.charaTimer = this.initial_time;
        this.textTimer = 0;
        this.showCharaFin = false;
        this.showTextFin = false;
        this.scenarioRunning = false;
        
        this.now_story_no = 0;
        this.count_for_tmp = 0;///////////////////////////////////
        this.now_scenario_no = 0;
        this.now_talk_no = 0;
        this.story_no_onclick = 0;

        this.talkText.string = "";
        this.tmp = "";
        var self = this;

        // JSONファイル読み込み
        var url = cc.url.raw("resources/dataJson.json");
        cc.loader.load(url, function(error, result) { // JSONファイルからデータを読み込む
            if (error !== null) return; // エラーがない場合、処理を抜ける
            self.dataJson = result; // JSONデータを取得

            // ストーリー数、シナリオ数、トーク数を得る
            self.total_story_num = self.dataJson.story.length;
            self.total_scenario_num = self.dataJson.story[self.now_story_no].scenario.length;
            self.total_talk_num = self.dataJson.story[self.now_story_no].scenario[self.now_scenario_no].talk.length;

            self.story_no_onclick = self.now_story_no; // クリック時のストーリー番号
            self.character_on = true;
            self.scenarioRunning = true;

            // キャラとノードの配列を得る
            self.ary_chara_and_node = self.getNowCharacterAndNode();

            // jsonファイル読み込み完了フラグを立てる。
            self.finish_load_json = true;
        });
        // タッチイベント初期化
        this.setTouchEvent();
    },

    // 画像ロード、Canvasにぶら下げ、characte.js付与
    loadImgFromUrl: function(texture) {
        var new_node = new cc.Node()
        var sprite = new_node.addComponent(cc.Sprite);
        sprite.spriteFrame = new cc.SpriteFrame(texture);
        for(var i = 0; i < this.dataJson.character.length; i++){
            if(this.dataJson.character[i].url == texture.url){
                sprite.c_no = this.dataJson.character[i].no;
                break;
            }
        }
        sprite.addComponent(character);
        new_node.parent = this.canvas;
        sprite.trim = false;
        sprite.node.active = false;
        // 画像縦幅を500まで拡大縮小する
        var tmp_width = sprite.node.width;
        sprite.node.width = 330;
        sprite.node.height *= sprite.node.width/tmp_width;
        sprite.node.y = 50;

        // 全画像ロード完了なら、フラグを立てる。
        if(this.canvas.children[this.dataJson.character.length - 1]){
            this.finish_load_character = true;
        }
    },
    // 画像をresources内から読み込む
    loadImgFromRes: function(url){
        var new_node = new cc.Node();
        var sprite = new_node.addComponent(cc.Sprite);		
        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        sprite.spriteFrame = new cc.SpriteFrame(texture);
        for(var i = 0; i < this.dataJson.character.length; i++){
            if(this.dataJson.character[i].url == url){
                sprite.c_no = this.dataJson.character[i].no;
                break;
            }
        }
        sprite.addComponent(character);
        new_node.parent = this.canvas;
        sprite.trim = false;
        sprite.node.active = false;
        // 画像縦幅を500まで拡大縮小する
        var tmp_width = sprite.node.width;
        sprite.node.width = 330;
        sprite.node.height *= sprite.node.width/tmp_width;
        sprite.node.y = 50;

        // 全画像ロード完了なら、フラグを立てる。
        if(this.canvas.children[this.dataJson.character.length - 1]){
            this.finish_load_character = true;
        }
    },

    // タッチイベントの登録
    setTouchEvent: function(){
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouch: true,
            // クリック時の動作を登録
            onTouchBegan: function(touch, event){
                // ストーリーを全部表示し終わったなら、returnする
                if(self.now_story_no == self.total_story_num){
                    cc.find('clickIcon').active = false; // クリックアニメーション停止
                    self.talkText.string = "";
                    return;
                }

                // タイマーリセット
                self.charaTimer = self.initial_time;
                self.textTimer = 0;
                // 全ストーリー数、全シナリオ数を得る
                self.total_scenario_num = self.dataJson.story[self.now_story_no].scenario.length;
                

                // シナリオが走っているなら、現在のシナリオを完了させる。
                if(self.scenarioRunning == true){
                    self.scenarioRunning = false; // シナリオ終了扱い
                    self.showCharaFin = true; // キャラ表示終了扱い
                    self.showTextFin = true; // テキスト表示終了扱い

                    // シナリオのキャラ全部を表示させる
                    for(var i = 0; i < self.total_scenario_num; i++){
                        self.setCharacterToNode(self.ary_chara_and_node[i][0], self.ary_chara_and_node[i][1]);
                    }

                    for(var i = 0; i < self.total_scenario_num; i++){
                        self.now_character = self.dataJson.story[self.now_story_no].scenario[i].character_no;
                        self.characters[self.now_character - 1].active = true;
                        self.characters[self.now_character - 1].opacity = 255
                    }

                    // 今のシナリオのトークを全部表示させる。
                    self.tmp = "";
                    for(var i = 0; i < self.total_scenario_num; i++){
                        for(var j = self.now_talk_no; j < self.dataJson.story[self.now_story_no].scenario[i].talk.length; j++){
                            self.tmp += self.dataJson.story[self.now_story_no].scenario[i].talk[j] + '\n';
                        }
                    }
                    self.talkText.string = self.tmp;

                    // ストーリーを次に進める /////////////////////////
                    self.now_talk_no = 0;
                    self.now_scenario_no = 0;
                    self.now_story_no++;
                    self.count_for_tmp = 0;///////////////////////////////////
                    // クリックアイコンのアニメーション再生
                    cc.find('clickIcon').active = true;
                    
                }else if(self.scenarioRunning == false){　// シナリオが走っていないなら、次のシナリオを１つ走らせる。
                    cc.find('clickIcon').active = false; // クリックアニメーション停止
                    self.story_no_onclick = self.now_story_no; // クリック時のストーリー番号
                    self.character_on = true;
                    self.talkText.string = "";
                    self.tmp = "";

                    // キャラクターを非表示にする
                    for(var i = 0; i < self.dataJson.character.length; i++){
                        self.characters[self.characters_no_ary[i] - 1].active = false;
                    }/////////////////////

                    self.showCharaFin = false;
                    self.showTextFin = false;
                    self.scenarioRunning = true;

                    // キャラとノードの配列を得る
                    self.ary_chara_and_node = self.getNowCharacterAndNode();
                }
                // 以降のイベントも取得する場合はtrueを返す
                return true;
            }
        }, self.node);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        //////////////////////////////////////////////////////////////////////
        // ロードが未完了なら何もしない
        if(this.dataJson === undefined) { return; }
        // jsonを読み込んだなら、１度だけ外部画像を取り込む
        if(this.finish_load_json){
            this.finish_load_json = false; // １度しか入ってこれないようにここでfalse
            // キャラクタ画像をロードする
            for(var i = 0; i < this.dataJson.character.length; i++){
                var url = this.dataJson.character[i].url;
                if(url.substr(0, 10) == "resources/"){
                    this.loadImgFromRes(url);
                }else{
                    var texture = url;
                    cc.textureCache.addImageAsync(texture, this.loadImgFromUrl, this);
                }
            }
        }
        // 外部画像を取り込めていないならreturn
        if(this.canvas.children[this.dataJson.character.length - 1] === undefined) { return; }
        // キャラクターの読み込みが完了したら、１度だけcharacters配列に格納する
        if(this.finish_load_character){
            this.finish_load_character = false;
            this.characters = [];
            this.characters_no_ary = [];
            // 各キャラのspriteを、characters配列内に（キャラ番号−１）＝インデックス番号　となるように格納
            for(var i = 0; i < this.dataJson.character.length; i++){
                this.characters[this.canvas.children[i].getComponent(cc.Sprite).c_no - 1] = this.canvas.children[i];
                this.characters_no_ary[i] = this.canvas.children[i].getComponent(cc.Sprite).c_no;
            }
        }
        //////////////////////////////////////////////////////////////////////


        if(this.scenarioRunning){
            // キャラクタがアクティブかつ、キャラクタ表示未完了ならば
            if(this.character_on && !this.showCharaFin){
                if(this.charaTimer >= 1) {
                    this.charaTimer = 1;
                    this.showCharaFin = true;
                }
                
                // キャラクタをノードに配置する
                if(this.charaTimer == this.initial_time){///////////    
                    this.setCharacterToNode(this.ary_chara_and_node[this.now_scenario_no][0], this.ary_chara_and_node[this.now_scenario_no][1]);
                    //
                    this.total_talk_num = this.dataJson.story[this.now_story_no].scenario[this.now_scenario_no].talk.length;
                }
                if(this.charaTimer >= 0){
                this.now_character = this.dataJson.story[this.now_story_no].scenario[this.now_scenario_no].character_no;
                this.characters[this.now_character - 1].active = true;
                this.characters[this.now_character - 1].opacity = 100 + (255-100) * this.charaTimer;
                }
                if(this.charaTimer == 1){
                    this.characters[this.now_character - 1].getComponent(character).jumpCharacter();
                }

                this.charaTimer += dt;
                this.textTimer = 0;
                this.showTextFin = false;
            }

            // キャラクタ表示完了かつ、テキスト表示未完了ならば
            if(this.showCharaFin && !this.showTextFin){
                this.writeText();

                var scenario = this.dataJson.story[this.now_story_no].scenario[this.now_scenario_no].talk[this.now_talk_no];
                var str_ary = scenario.split('');
                var show_text_ary = [];
                var show_len = Math.floor(this.textTimer / 0.15);
                if(show_len == str_ary.length){
                    // トークを次に進める
                    this.now_talk_no++;
                    this.count_for_tmp = 0;
                    if(this.now_talk_no == this.total_talk_num){
                        this.now_talk_no = 0;
                        this.now_scenario_no++;
                        if(this.now_scenario_no == this.total_scenario_num){
                            this.now_scenario_no = 0;
                            this.now_story_no++;
                        }
                    }

                    this.showTextFin = true;
                    this.showCharaFin = false;
                }

                // storyが次に進んだタイミングで一旦停止して、クリックアイコンはスタート
                if( (this.story_no_onclick + 1) == this.now_story_no ){
                    this.scenarioRunning = false;
                    this.character_on = false;
                    // クリックアイコンのアニメーション再生
                    cc.find('clickIcon').active = true;
                }
                this.textTimer += dt;
                this.charaTimer = this.initial_time;
            }
        }
    },

    writeText: function(){
        /*
        storyが先に進まない限りは２人の会話は上下につづけて表示する
        */
        if(this.story_no_onclick == this.now_story_no && this.count_for_tmp == 0){
            if(this.talkText.string != ""){
                this.tmp = this.talkText.string;
            }
            this.count_for_tmp++;
        }
        this.talkText.string = "";
        var scenario = this.dataJson.story[this.now_story_no].scenario[this.now_scenario_no].talk[this.now_talk_no];
        var str_ary = scenario.split('');
        var show_text_ary = [];
        var show_len = Math.floor(this.textTimer / 0.15);
        for(var i = 0; i < show_len; i++){
            show_text_ary.push(str_ary[i]);
        }
        if(show_len == str_ary.length){
            show_text_ary.push("\n");
        }
        this.text_tmp = show_text_ary.join("");                                         
        this.text = this.tmp + this.text_tmp;
        this.talkText.string = this.text;
    },

    // 現在のstoryで登場するキャラクターの順番を配列に入れてreturn
    getNowCharacterAndNode: function(){
        var ary_chara_and_node = [];
        for(var i = 0; i < this.dataJson.story[this.now_story_no].scenario.length; i++){
            var tmp = [
                this.dataJson.story[this.now_story_no].scenario[i].character_no,
                this.dataJson.story[this.now_story_no].scenario[i].node_no
            ];
            ary_chara_and_node.push(tmp);
        }
        return ary_chara_and_node;
    },
    // 登場キャラクタ数に応じて、登場位置を設定
    setCharacterToNode: function(chara_no, node_no){
        switch(node_no){
            case 1:
                this.characters[chara_no - 1].x = -350; break;
            case 2:
                this.characters[chara_no - 1].x = 0; break;
            case 3:
                this.characters[chara_no - 1].x = 350; break;
            case 4:
                this.characters[chara_no - 1].x = -250; break;
            case 5:
                this.characters[chara_no - 1].x = 250; break;
            default:
                return;
        }
    }
});
