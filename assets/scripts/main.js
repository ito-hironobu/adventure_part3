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
        this.initial_time = -0.5;
        this.chara_timer = this.initial_time;
        this.textTimer = 0;
        this.show_chara_fin = false;
        this.show_text_fin = false;
        this.scenario_running = false;
        
        this.now_story_no = 0;
        this.count_for_tmp = 0;///////////////////////////////////
        this.now_scenario_no = 0;
        this.now_talk_no = 0;
        this.story_no_onclick = 0;

        this.talkText.string = "";
        this.talk_tmp = "";
        var self = this;

        // JSONファイル読み込み
        var url = cc.url.raw("resources/dataJson.json");
        cc.loader.load(url, function(error, result) { // JSONファイルからデータを読み込む
            if (error !== null) return; // エラーがない場合、処理を抜ける
            self.dataJson = result; // JSONデータを取得
            // ストーリー数、シナリオ数、トーク数を得ておく
            self.total_story_num = self.dataJson.story.length;
            self.total_scenario_num = self.dataJson.story[self.now_story_no].scenario.length;
            self.total_talk_num = self.dataJson.story[self.now_story_no].scenario[self.now_scenario_no].talk.length;

            self.story_no_onclick = self.now_story_no; // ロード時にもクリック時のストーリー番号として読み込ませておく
            self.character_on = true;
            self.scenario_running = true;

            // キャラとノードの配列を得る
            self.ary_chara_and_node = self.getNowCharacterAndNode();
            // jsonファイル読み込み完了フラグを立てる。
            self.finish_load_json = true;
        });
        // タッチイベント初期化処理
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
                self.chara_timer = self.initial_time;
                self.textTimer = 0;
                // 全ストーリー数、全シナリオ数を得る
                self.total_scenario_num = self.dataJson.story[self.now_story_no].scenario.length;
                
                // シナリオが走っているなら、現在のシナリオを完了させる。
                if(self.scenario_running == true){
                    self.showAllCharaOfNowStory(); // シナリオのキャラ全部を表示させる
                    self.showAllTalkOfNowStory(); // 今のシナリオのトークを全部表示させる。
                    cc.find('clickIcon').active = true; // クリックアイコンのアニメーション再生

                    self.scenario_running = false; // シナリオ終了状態
                    self.show_chara_fin = true; // キャラ表示終了状態
                    self.show_text_fin = true; // テキスト表示終了状態

                    // ストーリー番号を次に進める
                    self.now_talk_no = 0;
                    self.now_scenario_no = 0;
                    self.now_story_no++;
                    self.count_for_tmp = 0;

                }else if(self.scenario_running == false){　// シナリオが走っていないなら、次のシナリオを１つ走らせる。
                    cc.find('clickIcon').active = false; // クリックアニメーション停止
                    self.story_no_onclick = self.now_story_no; // クリック時のストーリー番号
                    self.character_on = true; // キャラ表示のフラグを立てる
                    self.talkText.string = "";
                    self.talk_tmp = "";

                    // キャラクターを非表示にする
                    for(var i = 0; i < self.dataJson.character.length; i++){
                        self.characters[self.characters_no_ary[i] - 1].active = false;
                    }/////////////////////

                    self.scenario_running = true; // シナリオ開始のフラグ
                    self.show_chara_fin = false; // キャラ表示待ちのフラグ
                    self.show_text_fin = false; // テキスト表示待ちのフラグ
                    
                    // キャラとノードの配列を得る
                    self.ary_chara_and_node = self.getNowCharacterAndNode();
                }
                // 以降のイベントも取得する場合はtrueを返す
                return true;
            },
        }, self.node);
    },

    showAllCharaOfNowStory: function(){
        for(var i = 0; i < this.total_scenario_num; i++){
            this.setCharacterToNode(this.ary_chara_and_node[i][0], this.ary_chara_and_node[i][1]);
        }
        for(var i = 0; i < this.total_scenario_num; i++){
            this.now_character = this.dataJson.story[this.now_story_no].scenario[i].character_no;
            this.characters[this.now_character - 1].active = true;
            this.characters[this.now_character - 1].opacity = 255
        }
    },
    showAllTalkOfNowStory: function(){
        this.talk_tmp = "";
        for(var i = 0; i < this.total_scenario_num; i++){
            for(var j = this.now_talk_no; j < this.dataJson.story[this.now_story_no].scenario[i].talk.length; j++){
                this.talk_tmp += this.dataJson.story[this.now_story_no].scenario[i].talk[j] + '\n';
            }
        }
        this.talkText.string = this.talk_tmp;
    },

    update: function (dt) {
        // 本当はonLoad内で実行したかったが、jsonファイル読み込みを待つ手法がわからずupdate内で実行した... //////////////////
        // jsonロード未完了ならreturn
        if(this.finish_load_json == undefined){ return; }
        // キャラ画像を読み込みスプライト作成
        if(this.finish_load_json){
            this.finish_load_json = false; // １度しか入ってこれないようにここでfalse
            this.makeCharasprite();
        }
        // キャラ画像スプライトをcharacters配列に格納
        if(this.finish_load_character){
            this.finish_load_character = false; // １度しか入ってこれないようにここでfalse
            this.setCharaspriteToArray();
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////////////

        // キャラ表示 & キャラアニメーション
        if(this.character_on && !this.show_chara_fin){ // キャラクタがアクティブかつ、キャラクタ表示未完了ならば
            // キャラクタをノードに配置する
            if(this.chara_timer == this.initial_time){
                this.setCharacterToNode(this.ary_chara_and_node[this.now_scenario_no][0], this.ary_chara_and_node[this.now_scenario_no][1]);
                this.total_talk_num = this.dataJson.story[this.now_story_no].scenario[this.now_scenario_no].talk.length; // 現在のシナリオの全トーク数を得ておく
                this.show_text_fin = false; // テキスト表示をfalseにしておく
                this.textTimer = 0;
            }
            if(this.chara_timer >= 0){ // キャラを１秒で表示
                this.now_character = this.dataJson.story[this.now_story_no].scenario[this.now_scenario_no].character_no;
                this.characters[this.now_character - 1].active = true;
                this.characters[this.now_character - 1].opacity = 100 + (255-100) * this.chara_timer;
            }

            this.chara_timer += dt;
            if(this.chara_timer >= 1) { // １秒経過でキャラが跳ねて表示処理完了
                this.characters[this.now_character - 1].getComponent(character).jumpCharacter();
                this.show_chara_fin = true;
            }
        }

        // キャラクタ表示完了かつ、テキスト表示未完了ならば
        if(this.show_chara_fin && !this.show_text_fin){
            var scenario = this.dataJson.story[this.now_story_no].scenario[this.now_scenario_no].talk[this.now_talk_no];
            this.str_ary = scenario.split('');
            this.show_len = Math.floor(this.textTimer / 0.15);
            
            this.writeText(); // トーク表示
            if(this.show_len == this.str_ary.length){ // １トーク表示完了で次のトークへ
                this.goNextTalk();
            }
            // storyが次に進んだタイミングで一旦停止して、クリックアイコンをスタート
            if( (this.story_no_onclick + 1) == this.now_story_no ){
                this.scenario_running = false;
                this.character_on = false;
                // クリックアイコンのアニメーション再生
                cc.find('clickIcon').active = true;
            }

            this.textTimer += dt;
            this.chara_timer = this.initial_time;
        }
    },

    makeCharasprite: function(){
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
    },

    setCharaspriteToArray: function(){
        this.characters = [];
        this.characters_no_ary = [];
        // 各キャラのspriteを、characters配列内に（キャラ番号−１）＝インデックス番号　となるように格納
        for(var i = 0; i < this.dataJson.character.length; i++){
            this.characters[this.canvas.children[i].getComponent(cc.Sprite).c_no - 1] = this.canvas.children[i];
            this.characters_no_ary[i] = this.canvas.children[i].getComponent(cc.Sprite).c_no;
        }
    },

    writeText: function(){
        // storyが先に進まない限りは２人の会話は上下につづけて表示する
        if(this.story_no_onclick == this.now_story_no && this.count_for_tmp == 0){
            if(this.talkText.string != ""){
                this.talk_tmp = this.talkText.string;
            }
            this.count_for_tmp++;
        }
        this.talkText.string = "";
        /////
        
        var show_text_ary = [];
        for(var i = 0; i < this.show_len; i++){
            show_text_ary.push(this.str_ary[i]);
        }
        if(this.show_len == this.str_ary.length){
            show_text_ary.push("\n");
        }
        this.text_tmp = show_text_ary.join("");
        this.talkText.string = this.talk_tmp + this.text_tmp;
    },
    
    goNextTalk: function(){
        // トーク表示完了のフラグ
        this.show_text_fin = true;
        this.show_chara_fin = false;
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
